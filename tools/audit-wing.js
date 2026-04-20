// V3 layout — rooms use WORLD coordinates directly (not wing-local + origin).
// Simpler, less error-prone.

const ROOMS = [
  // ── SPINE (x-centered on 25, walk straight north from entry) ──
  { id: 'foyer',         xMin: 23,   xMax: 27,   zMin: -21.5, zMax: -18,   cy: 4,
    doors: [
      { wall: 'south', at: 25, width: 2.0 },  // entry from arcade (from mall corridor)
      { wall: 'north', at: 25, width: 2.4 },  // into Gallery
    ] },
  { id: 'gallery',       xMin: 22,   xMax: 28,   zMin: -29.5, zMax: -21.5, cy: 10,
    doors: [
      { wall: 'south', at: 25, width: 2.4 },  // from Foyer
      { wall: 'north', at: 25, width: 2.4 },  // into Bar
      { wall: 'east',  at: -24, width: 1.4 }, // into Cold Stoned (east side)
    ] },
  { id: 'bar',           xMin: 20,   xMax: 30,   zMin: -37.5, zMax: -29.5, cy: 4.5,
    doors: [
      { wall: 'south', at: 25, width: 2.4 },  // from Gallery
      { wall: 'north', at: 25, width: 3.0 },  // into Main Lounge
      { wall: 'west',  at: -32, width: 1.4 }, // to BOH (staff service rail)
      { wall: 'east',  at: -28.5, width: 1.8 }, // to Courtyard (outdoor spillover)
    ] },
  { id: 'main-lounge',   xMin: 17.5, xMax: 32.5, zMin: -46,   zMax: -37.5, cy: 6,
    doors: [
      { wall: 'south', at: 25, width: 3.0 },  // from Bar
      { wall: 'north', at: 25, width: 1.4 },  // to Culinary (kitchen pass, behind stage)
      { wall: 'east',  at: -43.75, width: 1.4 }, // to Cigar Airlock
    ] },

  // ── EAST OF SPINE ──
  { id: 'cold-stoned',   xMin: 28,   xMax: 32,   zMin: -26,   zMax: -21.5, cy: 4,
    doors: [
      { wall: 'west',  at: -24, width: 1.4 },  // from Gallery
      { wall: 'north', at: 31, width: 1.4 },   // into Courtyard (north = deeper into wing)
    ] },
  { id: 'courtyard',     xMin: 30,   xMax: 37,   zMin: -31,   zMax: -26,   cy: 12, openAir: true,
    doors: [
      { wall: 'south', at: 31, width: 1.4 },   // from Cold Stoned
      { wall: 'west',  at: -28.5, width: 1.8 },  // from Bar east wall
    ] },
  { id: 'cigar-airlock', xMin: 32.5, xMax: 35.7, zMin: -44.5, zMax: -43,   cy: 3,
    doors: [
      { wall: 'west',  at: -43.75, width: 1.4 },  // from Main Lounge
      { wall: 'east',  at: -43.75, width: 1.4 },  // to Cigar Lounge
    ] },
  { id: 'cigar',         xMin: 35.7, xMax: 41.7, zMin: -46,   zMax: -37.5, cy: 3,
    doors: [
      { wall: 'west',  at: -43.75, width: 1.4 }, // from airlock
    ] },

  // ── WEST OF SPINE ──
  { id: 'boh',           xMin: 15,   xMax: 20,   zMin: -34.5, zMax: -29.5, cy: 3,
    doors: [
      { wall: 'east', at: -32, width: 1.4 },  // to Bar
    ] },
  { id: 'culinary',      xMin: 22.5, xMax: 27.5, zMin: -51,   zMax: -46,   cy: 5,
    doors: [
      { wall: 'south', at: 25, width: 1.4 },  // from Main Lounge (behind-stage kitchen pass)
    ] },
];

// Helpers
function doorWorld(r, d) {
  // `at` is the center coord along the door's wall axis.
  // For N/S walls, `at` is x-coordinate; door runs along x.
  // For E/W walls, `at` is z-coordinate; door runs along z.
  if (d.wall === 'north') return { axis: 'x', z: r.zMin, a: d.at - d.width/2, b: d.at + d.width/2 };
  if (d.wall === 'south') return { axis: 'x', z: r.zMax, a: d.at - d.width/2, b: d.at + d.width/2 };
  if (d.wall === 'east')  return { axis: 'z', x: r.xMax, a: d.at - d.width/2, b: d.at + d.width/2 };
  if (d.wall === 'west')  return { axis: 'z', x: r.xMin, a: d.at - d.width/2, b: d.at + d.width/2 };
}

console.log('═══ ROOM FOOTPRINTS ═══');
console.log('id              | x-range        | z-range        | size      | ceil');
console.log('─'.repeat(76));
for (const r of ROOMS) {
  const w = r.xMax - r.xMin, d = r.zMax - r.zMin;
  console.log(
    r.id.padEnd(15) + ' | ' +
    (r.xMin.toFixed(1)+','+r.xMax.toFixed(1)).padStart(13) + ' | ' +
    (r.zMin.toFixed(1)+','+r.zMax.toFixed(1)).padStart(13) + ' | ' +
    (w+'×'+d).padEnd(9) + ' | ' +
    r.cy + 'm'
  );
}

console.log('\n═══ ADJACENCY CHECK (shared walls + door alignment) ═══');
function shareWall(a, b) {
  if (Math.abs(a.xMax - b.xMin) < 0.05) {
    const zOv0 = Math.max(a.zMin, b.zMin), zOv1 = Math.min(a.zMax, b.zMax);
    if (zOv1 > zOv0) return { aWall: 'east', bWall: 'west', axis: 'z', ov0: zOv0, ov1: zOv1 };
  }
  if (Math.abs(b.xMax - a.xMin) < 0.05) {
    const zOv0 = Math.max(a.zMin, b.zMin), zOv1 = Math.min(a.zMax, b.zMax);
    if (zOv1 > zOv0) return { aWall: 'west', bWall: 'east', axis: 'z', ov0: zOv0, ov1: zOv1 };
  }
  if (Math.abs(a.zMax - b.zMin) < 0.05) {
    const xOv0 = Math.max(a.xMin, b.xMin), xOv1 = Math.min(a.xMax, b.xMax);
    if (xOv1 > xOv0) return { aWall: 'south', bWall: 'north', axis: 'x', ov0: xOv0, ov1: xOv1 };
  }
  if (Math.abs(b.zMax - a.zMin) < 0.05) {
    const xOv0 = Math.max(a.xMin, b.xMin), xOv1 = Math.min(a.xMax, b.xMax);
    if (xOv1 > xOv0) return { aWall: 'north', bWall: 'south', axis: 'x', ov0: xOv0, ov1: xOv1 };
  }
  return null;
}

let errors = 0, warnings = 0;
for (let i = 0; i < ROOMS.length; i++) {
  for (let j = i+1; j < ROOMS.length; j++) {
    const a = ROOMS[i], b = ROOMS[j];
    const adj = shareWall(a, b);
    if (!adj) continue;
    const aDoors = a.doors.filter(d => d.wall === adj.aWall).map(d => doorWorld(a, d));
    const bDoors = b.doors.filter(d => d.wall === adj.bWall).map(d => doorWorld(b, d));
    if (aDoors.length === 0 && bDoors.length === 0) {
      console.log(`  ○ ${a.id} (${adj.aWall}) ↔ ${b.id} (${adj.bWall}) — solid shared wall`);
      continue;
    }
    if (aDoors.length === 0 || bDoors.length === 0) {
      console.log(`  ✗ ${a.id} (${adj.aWall}) ↔ ${b.id} (${adj.bWall}) — DOOR MISMATCH: one side has door, other doesn't`);
      errors++;
      continue;
    }
    aDoors.forEach(da => {
      bDoors.forEach(db => {
        const ov = Math.min(da.b, db.b) - Math.max(da.a, db.a);
        if (ov < -0.01) {
          console.log(`  ✗ ${a.id}(${adj.aWall}) ↔ ${b.id}(${adj.bWall}) — doors don't overlap: a[${da.a.toFixed(2)},${da.b.toFixed(2)}] b[${db.a.toFixed(2)},${db.b.toFixed(2)}]`);
          errors++;
        } else if (ov < Math.min(da.b-da.a, db.b-db.a) - 0.01) {
          console.log(`  ! ${a.id}(${adj.aWall}) ↔ ${b.id}(${adj.bWall}) — partial alignment: ${ov.toFixed(2)}m overlap`);
          warnings++;
        } else {
          console.log(`  ✓ ${a.id}(${adj.aWall}) ↔ ${b.id}(${adj.bWall}) — aligned ${ov.toFixed(2)}m`);
        }
      });
    });
  }
}

console.log('\n═══ ORPHAN DOORS ═══');
for (const r of ROOMS) {
  for (const d of r.doors) {
    // Is this door the wing entry? (foyer south)
    if (r.id === 'foyer' && d.wall === 'south') {
      console.log(`  ✓ foyer south — entry from mall corridor`);
      continue;
    }
    // Find partner
    let partner = null;
    for (const other of ROOMS) {
      if (other.id === r.id) continue;
      const adj = shareWall(r, other);
      if (!adj) continue;
      if (adj.aWall !== d.wall) continue;
      const da = doorWorld(r, d);
      const partnerDoors = other.doors.filter(od => od.wall === adj.bWall).map(od => doorWorld(other, od));
      for (const pd of partnerDoors) {
        if (Math.min(da.b, pd.b) - Math.max(da.a, pd.a) > 0.05) {
          partner = other.id; break;
        }
      }
      if (partner) break;
    }
    if (!partner) {
      console.log(`  ✗ ${r.id} ${d.wall} @ ${d.at} — ORPHAN (leads to void)`);
      errors++;
    }
  }
}

// Check for overlapping rooms (bad layout)
console.log('\n═══ ROOM OVERLAP CHECK ═══');
for (let i = 0; i < ROOMS.length; i++) {
  for (let j = i+1; j < ROOMS.length; j++) {
    const a = ROOMS[i], b = ROOMS[j];
    if (a.xMax > b.xMin + 0.01 && b.xMax > a.xMin + 0.01 &&
        a.zMax > b.zMin + 0.01 && b.zMax > a.zMin + 0.01) {
      console.log(`  ✗ ${a.id} OVERLAPS ${b.id}`);
      errors++;
    }
  }
}

// Envelope
console.log('\n═══ WING ENVELOPE ═══');
let xMin=Infinity, xMax=-Infinity, zMin=Infinity, zMax=-Infinity;
for (const r of ROOMS) {
  xMin = Math.min(xMin, r.xMin); xMax = Math.max(xMax, r.xMax);
  zMin = Math.min(zMin, r.zMin); zMax = Math.max(zMax, r.zMax);
}
console.log(`  x: [${xMin}, ${xMax}]  width ${xMax-xMin}m`);
console.log(`  z: [${zMin}, ${zMax}]  depth ${zMax-zMin}m`);

console.log('\n═══ SUMMARY ═══');
console.log(`  errors: ${errors}`);
console.log(`  warnings: ${warnings}`);
if (errors === 0) console.log('  ✓ LAYOUT VALID');
else console.log('  ✗ LAYOUT HAS ERRORS — do not ship');
