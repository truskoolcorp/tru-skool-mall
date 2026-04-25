# Café Sativa Wing — Hero Object Asset Plan

Goal: replace primitive-box-and-cylinder placeholder objects with proper 3D
hero models that give each room real visual identity. Budget pass 1: the
six CS wing rooms that read most placeholder-y right now.

## ASSETS ALREADY ON DISK — use first before generating anything new

These Sketchfab-sourced CC-BY models were downloaded previously and are
sitting in `assets/models/`:

| File | Size | Description | Fits room |
|---|---|---|---|
| `rooms/cold-stoned.glb` | 8.8 MB | Ice Cream Parlor (5 meshes) | **Cold Stoned** |
| `rooms/jazz-club.glb` | 66 KB | Jazz club voxel (1 mesh) | **Main Lounge** (possibly) |
| `rooms/smoking-lounge.glb` | 213 KB | Cigar smoking lounge (2 meshes) | **Cigar Lounge** |
| `rooms/music-studio.glb` | 1.1 MB | Full music studio (47 meshes) | **Verse Alkemist** |
| `studio/headphones.glb` | 3.2 MB | Studio headphones | Verse Alkemist prop |
| `studio/mic.glb` | 3.4 MB | Studio microphone | Verse Alkemist prop |
| `studio/mixer.glb` | 4.1 MB | Audio mixer | Verse Alkemist prop |
| `studio/monitor.glb` | 3.0 MB | Studio monitor speaker | Verse Alkemist, Main Lounge |
| `studio/mpc.glb` | 4.7 MB | MPC drum machine | Verse Alkemist |
| `studio/turntable.glb` | 4.5 MB | DJ turntable | Verse Alkemist |

## STRATEGY

**Phase 1 — Drop-in existing (zero Meshy credits)**
For each CS wing room that has an existing GLB fit, position + scale the
existing GLB inside the room. If it looks right, we're done. If it looks
wrong (wrong style / scale / aesthetic), fall through to Phase 2.

**Phase 2 — Meshy generate for gaps**
For rooms that don't have a fit:
- **Bar** — needs cocktail bar GLB (backbar with bottles, counter, taps).
  Meshy prompt target.
- **Foyer** — needs welcome desk, bench, reception prop. Meshy prompt target.
- **Gallery** — needs art sculpture plinths + 2-3 display pieces. Meshy
  prompt target.
- **Main Lounge / "At The Table"** — if jazz-club.glb doesn't fit, needs a
  stage-with-speakers GLB + host table + chairs. Meshy prompt target.

## MESHY PROMPT WRITING GUIDELINES

Meshy works best with prompts that specify:
1. Style (photorealistic vs stylized low-poly)
2. Single object or small composition
3. Material cues (wood, marble, metal, leather)
4. Scale reference (hint dimensions via object type)

Avoid: abstract scenes, multiple disconnected objects, indoor space as a
"scene" (Meshy struggles with walls-and-furniture scenes; does better with
a single hero prop or a compact grouping).

## ROOM-BY-ROOM PASS

### Cold Stoned (DONE: see if existing GLB fits)
- Try: `assets/models/rooms/cold-stoned.glb` positioned to fill the 4m × 4.5m
  room footprint.
- Fallback if too stylized/wrong: Meshy prompt:
  "Luxury gelato display case, walnut wood base with marble top, glass front
   showing 8 colorful gelato tubs in stainless steel pans, small brass price
   signs, stylized realism, 2m wide x 0.8m tall x 0.6m deep"

### Main Lounge / At The Table
- Try: `assets/models/rooms/jazz-club.glb` as ambient stage set piece.
- Fallback/complement: Meshy prompts:
  1. "Intimate performance stage with single stool and vocal mic on stand,
     two PA speakers flanking, warm wood floor, dark backdrop curtain,
     stylized realism, 3m wide"
  2. "Round host table with white tablecloth, crystal glasses, wine bottle,
     4 upholstered dining chairs with curved backs, warm restaurant lighting,
     stylized realism, 1.2m diameter table"

### Bar
- Meshy prompt: "Art deco cocktail bar, dark walnut wood with marble top,
  backbar shelf with 15 liquor bottles of different colors, brass taps,
  row of glassware above, two amber pendant lamps hanging, stylized
  realism, 4m wide x 2m tall"

### Cigar Lounge
- Try: `assets/models/rooms/smoking-lounge.glb` (213KB, probably a full room
  set — check scale first).
- Fallback: Meshy prompts:
  1. "Cluster of 4 oxblood leather armchairs around a round walnut table,
     brass ashtray on table, small humidor side cabinet, deep red rug,
     stylized realism, 3m diameter arrangement"

### Verse Alkemist (music studio)
- Try: `assets/models/rooms/music-studio.glb` full room.
- Plus studio props: turntable, mpc, mixer, mic, headphones, monitor.

### Gallery
- Meshy prompts:
  1. "Museum sculpture plinth with abstract bronze sculpture on top,
     white marble base, stylized realism, 0.5m x 0.5m x 1.2m tall"
  2. "Framed modern art painting, 1m x 1.5m, geometric abstract composition,
     warm earth tones, gold frame, stylized realism"

### Foyer
- Meshy prompt: "Hotel lobby reception desk, dark walnut wood with
  brass inlay details, small table lamp with warm shade, single upholstered
  reception chair behind it, stylized realism, 2m wide"

## INTEGRATION CODE

New file: `js/cafe-sativa-hero-objects.js`. Loads each GLB with
`gltf-model`, positions inside the appropriate room, replaces the
corresponding primitive objects in `cafe-sativa-interiors.js`.

Pattern:
```js
const HERO = {
  'cold-stoned': { src: 'assets/models/rooms/cold-stoned.glb', pos: '30 0 -25.3', rot: '0 180 0', scale: '0.8 0.8 0.8' },
  // ... one entry per room
};

// On scene load, each entry: fetch HEAD to confirm GLB exists,
// then append a-entity with gltf-model. On error, skip gracefully.
// When HERO loads, set window.HERO_LOADED[roomId] = true, and
// cafe-sativa-interiors.js skips its primitive objects for that room.
```

## NEXT STEPS

1. Build `js/cafe-sativa-hero-objects.js` that tries to load each existing
   GLB in its target room.
2. Add position/scale tuning hook: URL param `?hero-tune=1` drops a
   gizmo-like panel that lets you move/scale the GLB and export values.
3. Deploy, test Cold Stoned / Main Lounge / Cigar / Verse Alkemist first
   (the ones with existing assets). See what looks good, what doesn't.
4. For rooms that don't look right, write Meshy prompts and generate via
   your Meshy.ai account (~1710 credits as of last check). Each
   text-to-3D generation is 25 credits; even 15 generations = 375 credits.
5. Drop generated GLBs into `assets/models/` and add HERO entries.
