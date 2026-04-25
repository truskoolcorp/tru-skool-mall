# Meshy Prompts — Café Sativa Hero Props

Copy-paste these prompts directly into Meshy's text-to-3D mode. Each prompt is
tuned for **Stylized 3D** (not Photoreal) — matches the Base44 reference
aesthetic and produces smaller GLB files (~200-500 KB vs 5-10 MB photoreal).

**File destination:** `assets/models/props/<filename>.glb`

The prop loader (`js/cafe-sativa-props.js`) already references these exact
filenames — drop the GLB in, reload the page, the prop appears.

**Credit budget:** Meshy text-to-3D = 25 credits per generation.
Total for full set = ~325 credits of your ~1710 available.

---

## TIER 1 — Bar (highest impact, 4 prompts, 100 credits)

### bar-counter-walnut.glb
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

### pendant-cone-brass.glb
> Hanging pendant lamp, brass cup-shape shade pointing downward with a warm
> glowing bulb visible inside, thin black cord hanging from above 0.6m long,
> single fixture, stylized realism. Dimensions: 0.3m shade diameter, total
> height with cord 0.8m.

---

## TIER 2 — Main Lounge (4 prompts, 100 credits)

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

### wall-sconce-brass.glb
> Wall-mounted sconce light, brass arm extending 0.3m from a small mounting
> plate, frosted glass tulip-shape shade pointing upward, warm bulb visible
> through the frosted glass, single fixture, stylized realism.
> Dimensions: 0.3m wide × 0.4m tall × 0.3m deep.

---

## TIER 3 — Cigar Lounge (3 prompts, 75 credits)

### lounge-armchair-oxblood.glb
> Classic gentleman's club armchair, oxblood red leather with deep button-
> tufted backrest, rolled padded armrests, wooden legs visible at base,
> single chair only, stylized realism. Dimensions: 0.85m wide × 1m tall ×
> 0.85m deep.

### lounge-side-table-walnut.glb
> Round side table, dark walnut wood with brass-trim edge, single small
> glass ashtray on top, stylized realism. Dimensions: 0.5m diameter × 0.55m
> tall.

### cigar-humidor.glb
> Tall standing humidor cabinet, dark walnut wood with brass corners and
> small brass handle, glass front panel with cigars visible inside in
> rows, freestanding furniture piece, stylized realism. Dimensions: 0.6m
> wide × 1.6m tall × 0.4m deep.

---

## TIER 4 — Foyer & Gallery (2 prompts, 50 credits)

### foyer-reception-desk.glb
> Hotel lobby reception desk, dark walnut wood front with subtle brass
> inlay detail along the top edge, marble top, small brass desk lamp on
> the right side with warm glowing shade, single freestanding piece,
> stylized realism. Dimensions: 2m wide × 1.1m tall × 0.7m deep.

### gallery-plinth.glb
> Museum sculpture display plinth, white marble base with subtle warm
> beige veining, no object on top of it (bare plinth), single piece,
> stylized realism. Dimensions: 0.5m × 0.5m × 1.2m tall.

---

## TIER 5 — Cold Stoned (1 prompt, 25 credits)

### gelato-display-case.glb
> Gelato display case, dark walnut wood base with curved tinted glass
> dome on top, 8 round metal tubs of colorful gelato visible inside (mint
> green, strawberry pink, chocolate brown, coconut cream, mango orange,
> pistachio sage, vanilla, dark chocolate), small ice cream scoop visible,
> stylized realism. Dimensions: 2.5m wide × 1.4m tall × 0.7m deep.

---

## TIER 6 — Concierge / Host (1 prompt, 25 credits)

### concierge-laviche.glb
> Stylized 3D character of an elegant Latin woman concierge in her early
> 30s, wearing a tailored dark green velvet blazer over a cream silk
> blouse, dark slim trousers, brass jewelry (small earrings, simple
> pendant necklace), professional warm smile, A-pose with arms slightly
> out for rigging, full body visible, stylized realism with smooth
> shading. Dimensions: 1.7m tall.

> NOTE: Meshy has a separate "Text to 3D Avatar" mode that produces
> rigged humanoids — use that mode for this one, not the standard
> text-to-3D. Output will be GLB with a skeleton ready for animation.

---

## EXECUTION PLAN

**Recommended order:**

1. **Start with TIER 1** (Bar). Generate 4 prompts. Drop GLBs in
   `assets/models/props/`. Reload `mall.truskool.net`. The Bar
   should now have a real cocktail bar, backbar shelf, 4 stools,
   3 pendant lights. If it looks great, the prompt-style is right;
   apply the same to the rest.

2. **Per generation, check before saving:**
   - Does the model have proper PBR materials? (should look 3D, not
     flat-shaded — Meshy auto-applies PBR in stylized mode)
   - Roughly the right scale? (Meshy's ~1m default is usually fine; if
     it comes back tiny, ?prop-tune scales it up)
   - Single object, not a scene? (if you got a "bar with a guy
     standing next to it," reroll with a more focused prompt)

3. **Tune positions:** load `?prop-tune=bar/0` (first instance of first
   prop in bar), use arrow keys to nudge, X to export the values, paste
   into `cafe-sativa-props.js` PROPS map.

4. **For any prop that comes back wrong:** keep the previous prompt as
   reference, edit, regenerate. Meshy charges 25 credits per generation
   regardless of result, so iterate efficiently.

## DON'T-DO LIST

- Don't ask Meshy for "a bar room" or "a lounge scene" — multi-object
  prompts produce muddled GLBs. One hero object per prompt.
- Don't say "high detail photorealistic" — that mode burns 2-4× more
  credits and produces 5-10MB files that hurt page load.
- Don't include people in furniture prompts (a stool with a person
  sitting on it = Meshy renders the person too).
- Don't include floor/walls in prop prompts — we have those procedurally.
