#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Meshy batch generator — Tru Skool Mall props

   Reads tools/meshy-jobs.json (the prompt manifest), submits
   each job as a Meshy text-to-3D preview→refine task, polls
   until done, and downloads the GLB to assets/models/props/.

   Features
   - Concurrency cap (default 4) to avoid Meshy rate limits
   - Exponential backoff on 429 / "server is busy"
   - Resumable: checkpoint state in tools/meshy-state.json so a
     re-run skips already-completed jobs (and resumes mid-poll
     for in-flight ones)
   - Web-UI fallback: jobs that exhaust API retries are written
     to tools/meshy-failed-fallback.md as a copy-paste list
   - Live progress: counts per state, per-job status updates

   Usage
     export MESHY_API_KEY=msy_GtxW1l2Kkz...
     node tools/meshy-batch.js [--limit=3] [--only=bar,cigar]
                               [--concurrency=2] [--retry-failed]

   Cost
     ~30 credits/prop (preview 20 + refine 10).
     21 props ≈ 630 credits.
   ───────────────────────────────────────────────────────────── */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ─── CLI args ─────────────────────────────────────────────────
const args = process.argv.slice(2).reduce((a, arg) => {
  const m = arg.match(/^--([^=]+)(?:=(.*))?$/);
  if (m) a[m[1]] = m[2] === undefined ? true : m[2];
  return a;
}, {});

const LIMIT       = args.limit ? parseInt(args.limit, 10) : Infinity;
const CONCURRENCY = args.concurrency ? parseInt(args.concurrency, 10) : 4;
const ONLY_ROOMS  = args.only ? args.only.split(',') : null;
const RETRY_FAILED = !!args['retry-failed'];

// ─── Paths ────────────────────────────────────────────────────
const ROOT       = path.resolve(__dirname, '..');
const JOBS_FILE  = path.join(__dirname, 'meshy-jobs.json');
const STATE_FILE = path.join(__dirname, 'meshy-state.json');
const FALLBACK_FILE = path.join(__dirname, 'meshy-failed-fallback.md');
const OUT_DIR    = path.join(ROOT, 'assets', 'models', 'props');

// ─── Config ───────────────────────────────────────────────────
const API_KEY = process.env.MESHY_API_KEY;
if (!API_KEY) {
  console.error('❌ MESHY_API_KEY env var is required');
  console.error('   export MESHY_API_KEY=msy_GtxW1l2Kkz...');
  process.exit(1);
}

const API_BASE = 'https://api.meshy.ai/openapi/v2/text-to-3d';
const POLL_INTERVAL = 15_000;          // 15s — Meshy jobs run 1-5min
const MAX_POLL_TIME = 10 * 60_000;     // 10 min hard cap per stage
const MAX_API_RETRIES = 5;             // retry 429s up to 5 times
const BACKOFF_BASE = 30_000;           // 30s → 60s → 120s → 240s → 480s

// ─── Load manifest & state ────────────────────────────────────
const manifest = JSON.parse(fs.readFileSync(JOBS_FILE, 'utf8'));
const META = manifest._meta;

let state = {};
if (fs.existsSync(STATE_FILE)) {
  state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

// state[filename] = {
//   stage: 'preview' | 'refine' | 'downloaded' | 'failed',
//   previewTaskId?, refineTaskId?,
//   error?, attempts?, lastError?
// }

function saveState() {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── HTTP helper ──────────────────────────────────────────────
function request(method, url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      method,
      hostname: u.hostname,
      path: u.pathname + u.search,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(opts, (res) => {
      let chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const text = buf.toString('utf8');
        let json;
        try { json = JSON.parse(text); } catch (_) { json = null; }
        resolve({ status: res.statusCode, json, text, buf });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const get = (uu) => https.get(uu, (res) => {
      // Follow redirects — Meshy returns 302 to S3
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(new URL(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed ${res.statusCode}: ${url}`));
      }
      const out = fs.createWriteStream(dest);
      res.pipe(out);
      out.on('finish', () => out.close(resolve));
      out.on('error', reject);
    });
    get(u);
  });
}

// ─── API calls ────────────────────────────────────────────────
async function createPreview(prompt) {
  const body = {
    mode: 'preview',
    prompt: prompt.slice(0, 600), // 600 char hard cap
    art_style: META.art_style,
    ai_model: META.ai_model,
    topology: META.topology,
    target_polycount: META.target_polycount,
    should_remesh: true,
  };
  return apiWithBackoff(() => request('POST', API_BASE, body));
}

async function createRefine(previewTaskId) {
  const body = {
    mode: 'refine',
    preview_task_id: previewTaskId,
    enable_pbr: true,
  };
  return apiWithBackoff(() => request('POST', API_BASE, body));
}

async function pollTask(taskId) {
  const start = Date.now();
  let lastProgress = -1;
  while (Date.now() - start < MAX_POLL_TIME) {
    const res = await apiWithBackoff(() => request('GET', `${API_BASE}/${taskId}`));
    if (res.status !== 200 || !res.json) {
      throw new Error(`Poll failed ${res.status}: ${res.text.slice(0, 200)}`);
    }
    const task = res.json;
    if (task.progress !== lastProgress) {
      lastProgress = task.progress;
    }
    if (task.status === 'SUCCEEDED') return task;
    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      throw new Error(`Task ${task.status}: ${task.task_error?.message || 'unknown'}`);
    }
    await sleep(POLL_INTERVAL);
  }
  throw new Error(`Poll timeout after ${MAX_POLL_TIME / 1000}s`);
}

// Wraps an API call with exponential backoff on 429s and 5xx.
async function apiWithBackoff(fn) {
  let lastErr;
  for (let attempt = 0; attempt < MAX_API_RETRIES; attempt++) {
    try {
      const res = await fn();
      // 429 = rate limit, 503 = server busy
      if (res.status === 429 || res.status === 503) {
        const wait = BACKOFF_BASE * Math.pow(2, attempt);
        console.log(`    ⏳ ${res.status} (server busy) — backing off ${wait / 1000}s (retry ${attempt + 1}/${MAX_API_RETRIES})`);
        await sleep(wait);
        continue;
      }
      // 402 = out of credits, 401 = bad API key — these don't retry
      if (res.status === 402) throw new Error('OUT OF CREDITS');
      if (res.status === 401) throw new Error('INVALID API KEY');
      if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}: ${res.text.slice(0, 200)}`);
      }
      return res;
    } catch (e) {
      lastErr = e;
      // Don't retry hard failures (out of credits, bad key)
      if (/CREDITS|API KEY/.test(e.message)) throw e;
      const wait = BACKOFF_BASE * Math.pow(2, attempt);
      console.log(`    ⏳ network error: ${e.message} — backing off ${wait / 1000}s`);
      await sleep(wait);
    }
  }
  throw lastErr || new Error('Exhausted retries');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Per-job pipeline ─────────────────────────────────────────
async function runJob(job) {
  const { filename, prompt, room } = job;
  const dest = path.join(OUT_DIR, filename);

  // Skip if already on disk and state confirms it
  if (state[filename]?.stage === 'downloaded' && fs.existsSync(dest)) {
    console.log(`   ✓ ${filename} (already done)`);
    return 'skipped';
  }

  state[filename] = state[filename] || { attempts: 0 };
  state[filename].attempts++;

  console.log(`▶ ${filename}  [${room}]`);

  // Stage 1: preview
  let previewId = state[filename].previewTaskId;
  if (!previewId) {
    console.log(`   ① preview submit...`);
    const submitRes = await createPreview(prompt);
    previewId = submitRes.json?.result;
    if (!previewId) throw new Error(`No preview task ID in response: ${submitRes.text.slice(0, 200)}`);
    state[filename].previewTaskId = previewId;
    state[filename].stage = 'preview';
    saveState();
  }
  console.log(`   ① preview poll (id ${previewId.slice(0, 8)})...`);
  await pollTask(previewId);
  console.log(`   ① preview ✓`);

  // Stage 2: refine
  let refineId = state[filename].refineTaskId;
  if (!refineId) {
    console.log(`   ② refine submit...`);
    const submitRes = await createRefine(previewId);
    refineId = submitRes.json?.result;
    if (!refineId) throw new Error(`No refine task ID in response: ${submitRes.text.slice(0, 200)}`);
    state[filename].refineTaskId = refineId;
    state[filename].stage = 'refine';
    saveState();
  }
  console.log(`   ② refine poll (id ${refineId.slice(0, 8)})...`);
  const refined = await pollTask(refineId);
  console.log(`   ② refine ✓`);

  // Stage 3: download
  const glbUrl = refined.model_urls?.glb;
  if (!glbUrl) throw new Error('No GLB url in refined result');
  console.log(`   ③ download → ${path.relative(ROOT, dest)}`);
  await downloadFile(glbUrl, dest);
  const sizeKB = Math.round(fs.statSync(dest).size / 1024);
  console.log(`   ③ ✓ ${sizeKB} KB`);

  state[filename].stage = 'downloaded';
  state[filename].error = null;
  saveState();
  return 'done';
}

// ─── Concurrency pool ─────────────────────────────────────────
async function runPool(jobs, concurrency) {
  let idx = 0;
  let done = 0;
  let failed = 0;
  let skipped = 0;
  const total = jobs.length;

  async function worker() {
    while (idx < jobs.length) {
      const myIdx = idx++;
      const job = jobs[myIdx];
      try {
        const result = await runJob(job);
        if (result === 'done') done++;
        else if (result === 'skipped') skipped++;
      } catch (e) {
        failed++;
        state[job.filename] = state[job.filename] || {};
        state[job.filename].stage = 'failed';
        state[job.filename].lastError = e.message;
        saveState();
        console.log(`   ✗ ${job.filename} FAILED: ${e.message}`);
        if (/CREDITS|API KEY/.test(e.message)) {
          console.log(`\n💀 Hard error — aborting batch.`);
          process.exit(1);
        }
      }
      const completed = done + failed + skipped;
      console.log(`   [${completed}/${total}]  ✓${done}  ⊘${skipped}  ✗${failed}\n`);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return { done, failed, skipped };
}

// ─── Web-UI fallback writer ──────────────────────────────────
function writeFallback(failedJobs) {
  if (failedJobs.length === 0) return;
  const lines = [
    '# Meshy Web-UI Fallback Prompts',
    '',
    `Generated ${new Date().toISOString()} after API failures.`,
    'Paste each prompt at https://www.meshy.ai (Text to 3D).',
    'Use settings: **Stylized Realism** style, **meshy-5** model.',
    '',
  ];
  for (const job of failedJobs) {
    lines.push(`## ${job.filename}  (${job.room})`);
    lines.push(`**Last error:** ${state[job.filename]?.lastError || 'unknown'}`);
    lines.push('');
    lines.push('```');
    lines.push(job.prompt);
    lines.push('```');
    lines.push('');
    lines.push(`After download, save to: \`assets/models/props/${job.filename}\``);
    lines.push('');
  }
  fs.writeFileSync(FALLBACK_FILE, lines.join('\n'));
  console.log(`📝 Wrote web-UI fallback list: ${path.relative(ROOT, FALLBACK_FILE)}`);
}

// ─── Main ─────────────────────────────────────────────────────
(async () => {
  let jobs = manifest.jobs;

  // Filter
  if (ONLY_ROOMS) {
    jobs = jobs.filter((j) => ONLY_ROOMS.includes(j.room));
  }
  if (RETRY_FAILED) {
    jobs = jobs.filter((j) => state[j.filename]?.stage === 'failed');
    // Reset failed state so they get re-attempted
    jobs.forEach((j) => {
      delete state[j.filename].previewTaskId;
      delete state[j.filename].refineTaskId;
      state[j.filename].stage = null;
    });
    saveState();
  } else {
    // Skip already-downloaded
    jobs = jobs.filter((j) => {
      if (state[j.filename]?.stage === 'downloaded' && fs.existsSync(path.join(OUT_DIR, j.filename))) {
        return false;
      }
      return true;
    });
  }

  if (jobs.length > LIMIT) jobs = jobs.slice(0, LIMIT);

  console.log('═══════════════════════════════════════════════════════');
  console.log('  MESHY BATCH GENERATOR — Tru Skool Mall props');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Jobs to run:    ${jobs.length}`);
  console.log(`  Concurrency:    ${CONCURRENCY}`);
  console.log(`  Est. credits:   ~${jobs.length * META.credits_per_job}`);
  console.log(`  Output dir:     ${path.relative(ROOT, OUT_DIR)}/`);
  console.log(`  State file:     ${path.relative(ROOT, STATE_FILE)}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (jobs.length === 0) {
    console.log('Nothing to do — all jobs already completed. ✓');
    process.exit(0);
  }

  const t0 = Date.now();
  const result = await runPool(jobs, CONCURRENCY);
  const elapsed = Math.round((Date.now() - t0) / 1000);

  console.log('═══════════════════════════════════════════════════════');
  console.log(`  DONE in ${elapsed}s`);
  console.log(`  ✓ Completed:  ${result.done}`);
  console.log(`  ⊘ Skipped:    ${result.skipped}`);
  console.log(`  ✗ Failed:     ${result.failed}`);
  console.log('═══════════════════════════════════════════════════════');

  if (result.failed > 0) {
    const failedJobs = jobs.filter((j) => state[j.filename]?.stage === 'failed');
    writeFallback(failedJobs);
    console.log(`\nRun \`node tools/meshy-batch.js --retry-failed\` to retry just the failures.`);
    process.exit(1);
  }
})().catch((e) => {
  console.error('💀 FATAL:', e);
  process.exit(1);
});
