#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Meshy re-download utility

   For tasks where refine completed but download failed (503,
   network glitch, expired URL), this script:
     1. Reads tools/meshy-state.json
     2. Finds entries with stage === 'failed' that have a refineTaskId
     3. Calls Meshy's task-detail endpoint to get a fresh signed URL
     4. Downloads the GLB to assets/models/props/
     5. Updates state to 'downloaded'

   Why a separate script: meshy-batch.js stores the download URL
   from when the task completed, but those signed URLs are
   short-lived. On a 503 retry sometime later, that cached URL is
   often expired/invalid. The fix is to re-fetch the task to get
   a fresh URL, which is exactly what this script does.

   Usage
     export MESHY_API_KEY=msy_...
     node tools/meshy-redownload.js
   ───────────────────────────────────────────────────────────── */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT       = path.resolve(__dirname, '..');
const STATE_FILE = path.join(__dirname, 'meshy-state.json');
const OUT_DIR    = path.join(ROOT, 'assets', 'models', 'props');
const API_KEY    = process.env.MESHY_API_KEY;

if (!API_KEY) {
  console.error('❌ MESHY_API_KEY env var is required');
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));

// API helper — get task details (refine endpoint is the same shape)
function fetchTask(taskId) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.meshy.ai',
      path: `/openapi/v2/text-to-3d/${taskId}`,
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          return;
        }
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// Download a URL to a file path, with up to 3 retries on transient errors
function downloadGlb(url, outPath, attempts = 3) {
  return new Promise((resolve, reject) => {
    const tryOnce = (n) => {
      const file = fs.createWriteStream(outPath);
      https.get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close(); fs.unlinkSync(outPath);
          return https.get(res.headers.location, (res2) => {
            res2.pipe(fs.createWriteStream(outPath))
                .on('finish', () => resolve(fs.statSync(outPath).size))
                .on('error', reject);
          });
        }
        if (res.statusCode !== 200) {
          file.close();
          if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
          if (n > 0) {
            console.log(`     retry (${attempts - n + 1}/${attempts}) HTTP ${res.statusCode}`);
            setTimeout(() => tryOnce(n - 1), 5000);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(fs.statSync(outPath).size);
        });
      }).on('error', (err) => {
        file.close();
        if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
        if (n > 0) {
          console.log(`     retry (${attempts - n + 1}/${attempts}) ${err.message}`);
          setTimeout(() => tryOnce(n - 1), 5000);
        } else {
          reject(err);
        }
      });
    };
    tryOnce(attempts);
  });
}

async function main() {
  const failed = Object.entries(state).filter(([fn, s]) =>
    s.stage === 'failed' && s.refineTaskId
  );
  if (failed.length === 0) {
    console.log('No failed entries to recover.');
    return;
  }
  console.log(`Recovering ${failed.length} failed download(s)…\n`);

  for (const [filename, entry] of failed) {
    console.log(`▶ ${filename}`);
    console.log(`   refineTaskId: ${entry.refineTaskId}`);
    try {
      // Get fresh task detail
      const task = await fetchTask(entry.refineTaskId);
      const url = task.model_urls?.glb || task.model_url;
      if (!url) {
        console.log(`   ✗ no model URL in task response (status: ${task.status})`);
        continue;
      }
      console.log(`   ✓ fresh URL fetched`);
      const outPath = path.join(OUT_DIR, filename);
      const size = await downloadGlb(url, outPath);
      console.log(`   ✓ downloaded ${(size / 1024).toFixed(0)} KB → ${outPath}`);

      // Update state
      state[filename].stage = 'downloaded';
      state[filename].error = null;
      delete state[filename].lastError;
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch (e) {
      console.log(`   ✗ ${e.message}`);
    }
    console.log();
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });
