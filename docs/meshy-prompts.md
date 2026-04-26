# Meshy Prompts — Café Sativa Hero Props

Copy-paste these prompts directly into Meshy's text-to-3D mode. Each prompt is
tuned for **Stylized 3D** (not Photoreal) — matches the Base44 reference
aesthetic and produces smaller GLB files (~200-500 KB vs 5-10 MB photoreal).

**File destination:** `assets/models/props/<filename>.glb`

The prop loader (`js/cafe-sativa-props.js`) already references these exact
filenames — drop the GLB in, reload the page, the prop appears.

**Credit budget:** Meshy text-to-3D = 25 credits per generation.
- Full set (20 props) = ~500 credits of your ~909 available.
- Bar minimum (3 props) = 75 credits to prove pipeline.

---

## STRATEGY: All 7 rooms in parallel

Each room gets 2-3 hero props. Mall-wide progress visible immediately
instead of one perfect room at a time.

| Room          | Props | Credits | Priority |
|---------------|-------|---------|----------|
| Bar           | 3     | 75      | High (anchor) |
| Main Lounge   | 3     | 75      | High (Verse Alkemist sessions) |
| Smoke Lounge  | 2     | 60      | Med (cigar-focused, no hookah) |
| Cigar Lounge  | 3     | 75      | Med (VIP) |
| Culinary      | 3     | 75      | High (live cooking shows) |
| Courtyard     | 3     | 75      | Low (transition space) |
| Cold Stoned   | 3     | 75      | Med |
| **Total**     | **20**| **510** | |

Plus already-generated foyer (desk + Laviche). Bar-counter-walnut.glb is
archived from previous round and can be reused.

---

## ROOM 1 — BAR (3 prompts, 75 credits)

### bar-counter-walnut.glb [ALREADY GENERATED — in _archive/]
> Luxury cocktail bar counter, dark walnut wood front with vertical paneling
> and a thin brass horizontal trim line, 4-meter long polished marble top in
> warm cream color, art deco style, no objects on top, single hero piece,
> stylized realism. Dimensions: 4m wide × 1.1m tall × 0.9m deep.

### bar-backbar-shelf.glb
> Backbar shelf wall unit, dark walnut wood frame with three horizontal shelves,
> 12 colored liquor bottles in two rows on the shelves (mixed amber, green,
> clear, blue), brass shelf-edge LED strip lights underneath each shelf,
> stylized realism. Dimensions: 4m wide × 2m tall × 0.4m deep.

### bar-stool-leather.glb
> Bar stool, brushed steel cylindrical pedestal base with wide circular brass
> foot ring at bottom, oxblood red leather seat cushion with subtle button
> tufting, no backrest, single chair only, stylized realism.
> Dimensions: 0.4m diameter × 0.85m tall.

---

## ROOM 2 — MAIN LOUNGE (3 prompts, 75 credits)

### lounge-stage-platform.glb
> Small intimate performance stage, dark wood platform raised 0.3m high with
> a single wooden barstool centered on it, a vocal microphone on a chrome
> floor stand in front, two small black PA speakers on stands flanking the
> sides, a dark velvet curtain backdrop behind, stylized realism.
> Dimensions: 4m wide × 2m deep × 2.5m tall total.

### lounge-host-table.glb
> Round dining table with crisp white tablecloth draped to the floor, dark
> wood top showing through the center, three crystal wine glasses, one
> bottle of red wine, no chairs, single piece, stylized realism.
> Dimensions: 1.2m diameter × 0.75m tall.

### lounge-dining-chair.glb
> Single upholstered dining chair with curved back, deep emerald green velvet
> seat and back cushion, dark walnut wood legs, classic restaurant style,
> stylized realism. Dimensions: 0.5m wide × 1m tall.

---

## ROOM 3 — SMOKE LOUNGE (2 prompts, 60 credits)

> Note: this room shares the cigar lounge's smoking accessories
> (cigar + ashtray are in the cigar-side-table-walnut.glb prop).
> No hookah — Café Sativa's smoking program is cigar-focused.

### smoke-armchair-cognac.glb
> Deep-seated lounge armchair, cognac brown distressed leather with rolled
> arms and a high curved back, low wide seat for relaxed posture, brushed
> brass nailhead trim along the edges, dark wood legs, single chair only,
> stylized realism. Dimensions: 0.95m wide × 1m tall × 1m deep.

### smoke-low-table-marble.glb
> Low rectangular coffee table, dark walnut wood frame with a green veined
> marble top, single hammered brass ashtray and a small whiskey glass on
> top, stylized realism. Dimensions: 1.2m wide × 0.45m tall × 0.6m deep.

---

## ROOM 4 — CIGAR LOUNGE (3 prompts, 75 credits)

### cigar-armchair-oxblood.glb
> Classic gentleman's club armchair, oxblood red leather with deep button-
> tufted backrest, rolled padded armrests, wooden legs visible at base,
> single chair only, stylized realism. Dimensions: 0.85m wide × 1m tall ×
> 0.85m deep.

### cigar-side-table-walnut.glb
> Round side table, dark walnut wood with brass-trim edge, single small
> glass ashtray on top, stylized realism. Dimensions: 0.5m diameter × 0.55m
> tall.

### cigar-humidor.glb
> Tall standing humidor cabinet, dark walnut wood with brass corners and
> small brass handle, glass front panel with cigars visible inside in
> rows, freestanding furniture piece, stylized realism. Dimensions: 0.6m
> wide × 1.6m tall × 0.4m deep.

---

## ROOM 5 — CULINARY THEATER (3 prompts, 75 credits)

The kitchen-as-stage. Tiered velvet seating faces the chef's line. Live
cooking shows broadcast as podcast/video content.

### culinary-chef-station.glb
> Professional chef's cooking station, brushed stainless steel counter with
> a built-in flat top grill on the left and gas range with copper pots on
> the right, white tile backsplash, brass utensil rack overhead with hanging
> ladles and whisks, no chef figure, single hero piece, stylized realism.
> Dimensions: 3m wide × 2.2m tall × 0.9m deep.

### culinary-tiered-seating.glb
> Three-row tiered theater bench seating, deep red velvet cushioned benches
> rising in steps, brass safety rails between rows, dark wood frame, no
> people sitting, single freestanding piece, stylized realism.
> Dimensions: 4m wide × 1.5m tall × 2m deep.

### culinary-display-counter.glb
> Glass-front display counter, dark walnut base with curved tempered glass
> top, six small ceramic plates with stylized food items inside (a steak,
> a pasta dish, a salad, a tart, a sushi roll, a colorful dessert), brass
> trim, stylized realism. Dimensions: 2m wide × 1.1m tall × 0.6m deep.

---

## ROOM 6 — COURTYARD (3 prompts, 75 credits)

Open-air sanctuary. Olive trees, warm stone pavers, a live fire pit, a
strand of glowing lights overhead.

### courtyard-olive-tree.glb
> Mature olive tree with twisted gnarled trunk and silvery-green leaves,
> rooted in a large terracotta pot with brass banding, full canopy, single
> tree only, stylized realism. Dimensions: 2.5m wide canopy × 3.5m tall ×
> 2.5m deep including pot.

### courtyard-fire-pit.glb
> Round fire pit, dark stacked-stone circular base with a copper fire bowl
> on top, glowing orange flames and amber embers visible inside, no logs
> visible, freestanding outdoor fixture, stylized realism. Dimensions:
> 1.2m diameter × 0.6m tall.

### courtyard-bistro-set.glb
> Outdoor bistro furniture set, single round wrought-iron café table with
> mosaic tile top in cream and terracotta colors, two matching wrought-iron
> chairs with curved backs flanking it, Mediterranean style, stylized
> realism. Dimensions: 1.5m wide × 0.95m tall × 1.5m deep.

---

## ROOM 7 — COLD STONED (3 prompts, 75 credits)

Gelato pocket inside Café Sativa. Eight rotating flavors, hand-folded daily.

### cold-stoned-display-case.glb
> Gelato display case, dark walnut wood base with curved tinted glass
> dome on top, 8 round metal tubs of colorful gelato visible inside (mint
> green, strawberry pink, chocolate brown, coconut cream, mango orange,
> pistachio sage, vanilla, dark chocolate), small ice cream scoop visible,
> stylized realism. Dimensions: 2.5m wide × 1.4m tall × 0.7m deep.

### cold-stoned-prep-station.glb
> Frozen granite prep slab on a stainless steel base, rectangular polished
> granite top in dark grey marbled stone for hand-folding gelato, two metal
> mixing spades resting on the slab, brass utensil holder on the side,
> single freestanding piece, stylized realism. Dimensions: 1.8m wide × 1m
> tall × 0.8m deep.

### cold-stoned-menu-board.glb
> Vintage hanging menu board, dark walnut wood frame with brass corner
> trim, chalkboard surface with handwritten gelato flavor names in white
> chalk and price marks, single small flourish at the top, freestanding
> board on a pedestal base, stylized realism. Dimensions: 0.9m wide × 1.6m
> tall × 0.3m deep.

---

## EXECUTION PLAN

**Parallel mode (all 7 rooms at once):**

1. Run the API generator script: `node tools/meshy-batch.js`
   - Reads all prompts from this file
   - Submits each as a separate Meshy text-to-3D job
   - Polls every 30s; downloads finished GLBs to `assets/models/props/`
   - Falls back to web UI prompts list if API returns "server is busy"
   - Tracks credit spend in real time

2. As each GLB lands, the prop loader auto-detects on next page reload
   and places it via the manifest. Rooms light up one at a time.

3. Once all rooms have their hero props in place, use `?prop-tune=<room>`
   to dial position/rotation per prop. Tuner already supports multi-prop
   panels.

## CREDIT TRACKING

- Starting: 909 credits
- After foyer (desk + Laviche): ~860 credits
- After full mall set (21 props × 25): ~335 credits remaining
- Buffer for re-rolls: ~335 credits = 13 retries available

## DON'T-DO LIST

- Don't ask Meshy for "a bar room" or "a lounge scene" — multi-object
  prompts produce muddled GLBs. One hero object per prompt.
- Don't say "high detail photorealistic" — that mode burns 2-4× more
  credits and produces 5-10MB files that hurt page load.
- Don't include people in furniture prompts (a stool with a person
  sitting on it = Meshy renders the person too).
- Don't include floor/walls in prop prompts — we have those procedurally.
- If a generation comes back wrong, iterate the prompt by 1-2 specific
  words at a time. Wholesale rewrites burn credits faster than tweaks.
