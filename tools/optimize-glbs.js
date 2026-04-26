#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   GLB optimizer — compresses Meshy props for web delivery

   Meshy returns ~7MB GLBs with full 2K-4K PBR textures and dense
   triangle meshes. For web delivery (especially mobile), we want
   to compress to ~500KB-2MB without visible quality loss.

   Pipeline (per file):
     1. Resize textures: 2048→1024 base color, 1024→512 PBR maps
     2. Convert textures to KTX2 (Basis Universal) — ~75% size cut
     3. Apply Draco mesh compression — ~50% geometry cut
     4. Dedupe textures/materials
     5. Prune unused buffers/accessors

   File sizes (typical):
     Input:  Meshy output  →  ~5-10 MB
     Output: optimized     →  ~400-800 KB

   Usage:
     # Optimize ALL props in assets/models/props/, output to optimized/
     node tools/optimize-glbs.js

     # Just one file
     node tools/optimize-glbs.js assets/models/props/bar-stool-leather.glb

     # Replace originals (overwrites — backup first!)
     node tools/optimize-glbs.js --in-place

   Dependencies (one-time install):
     npm install --save-dev @gltf-transform/core @gltf-transform/extensions \
       @gltf-transform/functions @gltf-transform/cli sharp \
       draco3dgltf meshoptimizer

   ─────────────────────────────────────────────────────────────── */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PROPS_DIR = path.join(ROOT, 'assets', 'models', 'props');
const OUT_DIR = path.join(ROOT, 'assets', 'models', 'props-optimized');

const args = process.argv.slice(2);
const IN_PLACE = args.includes('--in-place');
const SINGLE_FILE = args.find((a) => a.endsWith('.glb'));

// Verify gltf-transform CLI is available
function checkDeps() {
  try {
    execSync('npx gltf-transform --version', { stdio: 'pipe' });
    return true;
  } catch (_) {
    console.error('❌ gltf-transform CLI not found.');
    console.error('   Install with:');
    console.error('     npm install --save-dev @gltf-transform/cli sharp draco3dgltf meshoptimizer');
    return false;
  }
}

function fmtSize(bytes) {
  if (bytes > 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function optimize(inputPath, outputPath) {
  const inputSize = fs.statSync(inputPath).size;
  const baseName = path.basename(inputPath);
  console.log(`\n▶ ${baseName}  (${fmtSize(inputSize)})`);

  // gltf-transform pipeline:
  // - resize:   shrink texture dimensions
  // - webp:     convert textures to WebP (broadest browser support)
  //             KTX2/Basis is smaller but ALL three.js versions need
  //             the KTX2Loader registered with the right transcoders;
  //             WebP "just works" out of the box.
  // - dedup:    remove duplicate accessors/textures/materials
  // - prune:    remove unused nodes, materials, etc.
  // - draco:    Draco geometry compression (lossless, ~50% smaller)
  //
  // Run as a single piped chain so intermediate buffers stay in RAM.
  const cmd = [
    'npx gltf-transform',
    'optimize',           // umbrella command — runs sensible defaults
    `"${inputPath}"`,
    `"${outputPath}"`,
    '--texture-compress webp',     // smaller than PNG, broad support
    '--texture-size 1024',         // resize down to 1024px max
    '--simplify',                  // mesh simplification
    '--simplify-error 0.001',      // very tight error tolerance
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe' });
  } catch (e) {
    // Fall back to manual chain if `optimize` isn't available
    console.log('   (umbrella optimize unavailable, falling back to manual chain)');
    const tmpPath = outputPath + '.tmp.glb';
    execSync(`npx gltf-transform resize "${inputPath}" "${tmpPath}" --width 1024 --height 1024`, { stdio: 'pipe' });
    execSync(`npx gltf-transform webp "${tmpPath}" "${tmpPath}"`, { stdio: 'pipe' });
    execSync(`npx gltf-transform dedup "${tmpPath}" "${tmpPath}"`, { stdio: 'pipe' });
    execSync(`npx gltf-transform prune "${tmpPath}" "${tmpPath}"`, { stdio: 'pipe' });
    execSync(`npx gltf-transform draco "${tmpPath}" "${outputPath}"`, { stdio: 'pipe' });
    fs.unlinkSync(tmpPath);
  }

  const outputSize = fs.statSync(outputPath).size;
  const ratio = ((1 - outputSize / inputSize) * 100).toFixed(0);
  console.log(`   ✓ ${fmtSize(outputSize)} (-${ratio}%)`);
  return { inputSize, outputSize };
}

function main() {
  if (!checkDeps()) process.exit(1);

  let files;
  if (SINGLE_FILE) {
    files = [path.resolve(SINGLE_FILE)];
  } else {
    if (!fs.existsSync(PROPS_DIR)) {
      console.error(`❌ Props dir not found: ${PROPS_DIR}`);
      process.exit(1);
    }
    files = fs.readdirSync(PROPS_DIR)
      .filter((f) => f.endsWith('.glb'))
      .map((f) => path.join(PROPS_DIR, f));
  }

  if (files.length === 0) {
    console.log('No GLBs to optimize.');
    return;
  }

  if (!IN_PLACE && !fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('  GLB OPTIMIZER');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Files:    ${files.length}`);
  console.log(`  Mode:     ${IN_PLACE ? 'IN-PLACE (overwrites originals)' : 'separate output dir'}`);
  if (!IN_PLACE) console.log(`  Output:   ${path.relative(ROOT, OUT_DIR)}/`);
  console.log('═══════════════════════════════════════════════════════');

  let totalIn = 0, totalOut = 0, ok = 0, failed = 0;
  for (const inputPath of files) {
    const outputPath = IN_PLACE
      ? inputPath
      : path.join(OUT_DIR, path.basename(inputPath));

    try {
      const r = optimize(inputPath, outputPath);
      totalIn += r.inputSize;
      totalOut += r.outputSize;
      ok++;
    } catch (e) {
      console.log(`   ✗ FAILED: ${e.message.split('\n')[0]}`);
      failed++;
    }
  }

  const totalRatio = ((1 - totalOut / totalIn) * 100).toFixed(0);
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  ✓ Optimized:  ${ok}`);
  console.log(`  ✗ Failed:     ${failed}`);
  console.log(`  Total in:    ${fmtSize(totalIn)}`);
  console.log(`  Total out:   ${fmtSize(totalOut)}  (-${totalRatio}%)`);
  console.log('═══════════════════════════════════════════════════════');

  if (!IN_PLACE && ok > 0) {
    console.log(`\nReview the optimized files in ${path.relative(ROOT, OUT_DIR)}/`);
    console.log('If they look good, replace originals with:');
    console.log(`  cp ${path.relative(ROOT, OUT_DIR)}/*.glb ${path.relative(ROOT, PROPS_DIR)}/`);
    console.log('\nOr run again with --in-place to overwrite directly:');
    console.log('  node tools/optimize-glbs.js --in-place');
  }
}

main();
