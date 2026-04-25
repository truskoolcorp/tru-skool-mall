# Tools — Meshy Batch Generator

## What it does

Generates all 21 hero props for the Tru Skool Mall in parallel via the
Meshy text-to-3D API. Each prop runs through preview → refine → download
to `assets/models/props/<filename>.glb`.

## Setup

```bash
export MESHY_API_KEY=msy_GtxW1l2Kkz...   # full key in followup notes
cd <repo-root>
```

## Usage

**Full run (all 21 props, ~630 credits, ~30-60 min):**
```bash
node tools/meshy-batch.js
```

**Test with one prop first (recommended):**
```bash
node tools/meshy-batch.js --limit=1 --concurrency=1
```

**Just one room (e.g. just the bar):**
```bash
node tools/meshy-batch.js --only=bar
```

**Multiple rooms:**
```bash
node tools/meshy-batch.js --only=bar,cigar,cold-stoned
```

**Lower concurrency if Meshy starts throwing 429s:**
```bash
node tools/meshy-batch.js --concurrency=2
```

**Retry only the props that failed:**
```bash
node tools/meshy-batch.js --retry-failed
```

## Resumability

State is checkpointed to `tools/meshy-state.json` after every step.
If the process crashes or you Ctrl+C, just re-run the same command —
it'll skip completed props and resume in-flight ones from the right
stage (preview vs refine vs download).

## Web-UI fallback

If a prop fails after 5 retries (e.g. Meshy is down), it gets
written to `tools/meshy-failed-fallback.md` as a copy-pasteable
prompt list for manual generation in the Meshy web UI. Drop the
GLB at the indicated path and re-run the batch — it'll pick up
where it left off.

## Cost tracking

Roughly 30 credits per prop (preview ~20 + refine ~10).
- Full set:  21 × 30 = 630 credits
- Bar only:   3 × 30 =  90 credits
- One prop:        30 credits

Your starting balance is shown after the first API call (Meshy returns
it in response headers, surfaced in error messages).

## After generation

The prop loader (`js/cafe-sativa-props.js`) auto-detects new GLBs
on next page reload — but most rooms don't yet have prop entries
in the `PROPS` map. Once GLBs are generated, follow up by:

1. Adding entries to `PROPS` for each new prop
2. Loading `mall.truskool.net/?prop-tune=<room>` to position them
3. Clicking 📋 Copy and pasting tuned values back into the manifest
