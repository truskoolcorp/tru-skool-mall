#!/usr/bin/env node
/**
 * Furniture tuner export → source-code converter.
 *
 * Reads a cs-furniture-*.json from the furniture tuner and writes
 * a .js fragment we can paste into cafe-sativa-interiors.js (when
 * we rebuild it).
 *
 * Also cleans up known tuner-export bugs:
 * - Strips A-Frame's expanded material component (all the default
 *   properties) down to just the user-authored keys. Older exports
 *   (before commit `fix: tuner export material` landed) dumped the
 *   whole parsed object including empty keys like 'displacementMap'
 *   and serialized Vector2 objects as '[object Object]'.
 *
 * Usage:
 *   node tools/convert-tuner-export.js <export.json> [--format=js|json]
 *
 *   --format=js   (default)  emits JS fragment as spawnFromRecord calls
 *   --format=json            emits a cleaned-up JSON (same shape,
 *                            but materials are reduced to their
 *                            authored keys only)
 */

const fs = require('fs');
const path = require('path');

const MATERIAL_DEFAULTS = new Set([
  'alphaTest', 'depthTest', 'depthWrite', 'flatShading', 'npot',
  'offset', 'opacity', 'repeat', 'shader', 'side', 'transparent',
  'vertexColorsEnabled', 'visible', 'blending', 'dithering',
  'anisotropy', 'ambientOcclusionMap', 'ambientOcclusionMapIntensity',
  'ambientOcclusionTextureOffset', 'ambientOcclusionTextureRepeat',
  'displacementMap', 'displacementScale', 'displacementBias',
  'displacementTextureOffset', 'displacementTextureRepeat',
  'envMap', 'fog', 'height', 'width',
  'metalnessMap', 'metalnessTextureOffset', 'metalnessTextureRepeat',
  'normalMap', 'normalScale', 'normalTextureOffset', 'normalTextureRepeat',
  'roughnessMap', 'roughnessTextureOffset', 'roughnessTextureRepeat',
  'sphericalEnvMap', 'src', 'wireframe', 'wireframeLinewidth',
]);
// Keys we WANT to preserve even though A-Frame's expanded form
// includes them — these are the ones a human usually authors:
const MATERIAL_USER_KEYS = new Set([
  'color', 'metalness', 'roughness', 'emissive', 'emissiveIntensity',
  'opacity', 'transparent', 'side',
]);

/**
 * Clean a potentially-bloated material string.
 *
 * Input might be:
 *   - Clean: "color: #8b6f47; roughness: 0.7"
 *   - A-Frame expanded: "alphaTest: 0; depthTest: true; ... color: #8b6f47; ... wireframeLinewidth: 2"
 *   - Contains [object Object]: "offset: [object Object]; ..."
 *
 * Output: just the keys a human would set, with [object Object]
 * values stripped. Also drops value=default entries that are
 * no-ops and just clutter the string.
 */
function cleanMaterial(mat) {
  if (!mat || typeof mat !== 'string') return mat;
  const parts = mat.split(';').map((s) => s.trim()).filter(Boolean);
  const keep = [];
  for (const part of parts) {
    const colonIdx = part.indexOf(':');
    if (colonIdx < 0) continue;
    const key = part.slice(0, colonIdx).trim();
    const value = part.slice(colonIdx + 1).trim();
    // Drop default-component keys, but keep user-authored ones
    if (MATERIAL_DEFAULTS.has(key) && !MATERIAL_USER_KEYS.has(key)) continue;
    // Drop broken [object Object] values
    if (value.includes('[object Object]')) continue;
    // Drop empty values
    if (value === '' || value === 'undefined') continue;
    // Drop no-op defaults — these are the values A-Frame picks when
    // the user didn't set anything, and including them in the output
    // is pure clutter.
    if (key === 'opacity' && value === '1') continue;
    if (key === 'transparent' && value === 'false') continue;
    if (key === 'side' && value === 'front') continue;
    if (key === 'emissive' && (value === '#000' || value === '#000000')) continue;
    if (key === 'emissiveIntensity' && value === '1') continue;
    if (key === 'metalness' && value === '0') continue;
    // Note: roughness defaults to 0.5 but we can't safely drop that
    // because 0.5 is a value people often intentionally set.
    keep.push(`${key}: ${value}`);
  }
  // Deduplicate — if a key appears twice, last wins
  const seen = new Map();
  for (const p of keep) {
    const k = p.split(':')[0].trim();
    seen.set(k, p);
  }
  return Array.from(seen.values()).join('; ');
}

function round(n, decimals = 2) {
  const f = Math.pow(10, decimals);
  return Math.round(Number(n) * f) / f;
}

function cleanRecord(rec) {
  const out = {
    tag: rec.tag,
    name: rec.name || '',
    position: {
      x: round(rec.position?.x ?? 0),
      y: round(rec.position?.y ?? 0),
      z: round(rec.position?.z ?? 0),
    },
    rotation: {
      x: round(rec.rotation?.x ?? 0, 1),
      y: round(rec.rotation?.y ?? 0, 1),
      z: round(rec.rotation?.z ?? 0, 1),
    },
    scale: {
      x: round(rec.scale?.x ?? 1),
      y: round(rec.scale?.y ?? 1),
      z: round(rec.scale?.z ?? 1),
    },
  };
  ['width', 'height', 'depth', 'radius'].forEach((k) => {
    if (rec[k] !== undefined) out[k] = round(rec[k], 3);
  });
  if (rec.material) out.material = cleanMaterial(rec.material);
  return out;
}

function emitJS(cleanedEntities) {
  const lines = [];
  lines.push('// Generated by tools/convert-tuner-export.js');
  lines.push(`// Entities: ${cleanedEntities.length}`);
  lines.push('(function spawnTunedFurniture(scene) {');
  lines.push('  const entities = [');

  cleanedEntities.forEach((e, i) => {
    const { tag, name, position: p, rotation: r, scale: s, material } = e;
    const shape = [];
    ['width', 'height', 'depth', 'radius'].forEach((k) => {
      if (e[k] !== undefined) shape.push(`${k}: ${e[k]}`);
    });
    const shapeStr = shape.length ? ', ' + shape.join(', ') : '';
    const comment = name ? `  // ${name}` : '';
    lines.push(`    { tag: '${tag}', name: '${name.replace(/'/g, "\\'")}',`);
    lines.push(`      position: { x: ${p.x}, y: ${p.y}, z: ${p.z} },`);
    lines.push(`      rotation: { x: ${r.x}, y: ${r.y}, z: ${r.z} },`);
    lines.push(`      scale: { x: ${s.x}, y: ${s.y}, z: ${s.z} }${shape.length ? ',' : ''}`);
    shape.forEach((prop, j) => {
      const isLast = j === shape.length - 1;
      lines.push(`      ${prop}${isLast && !material ? '' : ','}`);
    });
    if (material) {
      lines.push(`      material: '${material.replace(/'/g, "\\'")}'`);
    }
    lines.push(`    }${i < cleanedEntities.length - 1 ? ',' : ''}${comment}`);
  });

  lines.push('  ];');
  lines.push('');
  lines.push('  entities.forEach((e) => {');
  lines.push('    const el = document.createElement(e.tag);');
  lines.push('    el.setAttribute(\'position\', `${e.position.x} ${e.position.y} ${e.position.z}`);');
  lines.push('    el.setAttribute(\'rotation\', `${e.rotation.x} ${e.rotation.y} ${e.rotation.z}`);');
  lines.push('    el.setAttribute(\'scale\', `${e.scale.x} ${e.scale.y} ${e.scale.z}`);');
  lines.push('    [\'width\',\'height\',\'depth\',\'radius\'].forEach((k) => {');
  lines.push('      if (e[k] !== undefined) el.setAttribute(k, e[k]);');
  lines.push('    });');
  lines.push('    if (e.material) el.setAttribute(\'material\', e.material);');
  lines.push('    scene.appendChild(el);');
  lines.push('  });');
  lines.push('})(document.querySelector(\'a-scene\'));');
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const format = (args.find((a) => a.startsWith('--format='))?.split('=')[1]) || 'js';
  const input = args.find((a) => !a.startsWith('--'));
  if (!input) {
    console.error('Usage: node tools/convert-tuner-export.js <export.json> [--format=js|json]');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
  const entities = Array.isArray(raw.entities) ? raw.entities : [];
  const cleaned = entities.map(cleanRecord);

  // Stats
  const sizeBefore = JSON.stringify(raw).length;
  const sizeAfter = JSON.stringify({ entities: cleaned }).length;
  console.error(`[convert] ${entities.length} entities · ${sizeBefore}B → ${sizeAfter}B (${Math.round(100 - sizeAfter / sizeBefore * 100)}% smaller)`);
  cleaned.forEach((e) => {
    console.error(`  ${e.tag.padEnd(10)} ${(e.name || '(unnamed)').padEnd(20)} ` +
      `@ (${e.position.x}, ${e.position.y}, ${e.position.z})  ` +
      `material: "${(e.material || '').slice(0, 60)}"`);
  });

  if (format === 'json') {
    console.log(JSON.stringify({ entities: cleaned }, null, 2));
  } else {
    console.log(emitJS(cleaned));
  }
}

main();
