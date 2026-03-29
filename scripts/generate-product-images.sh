#!/bin/bash
# ═══════════════════════════════════════════════════════════
# TRU SKOOL MALL — Product Image Generator
# Uses MiniMAX image-01 to generate product mockup photos
# Cost: $0.0035 per image × 35 products = ~$0.13 total
# ═══════════════════════════════════════════════════════════

if [ -z "$MINIMAX_API_KEY" ]; then
  echo "Error: Set MINIMAX_API_KEY environment variable first"
  echo "  export MINIMAX_API_KEY=your-key-here"
  exit 1
fi

OUTDIR="assets/products"
mkdir -p "$OUTDIR"

API="https://api.minimax.io/v1/image_generation"

generate_image() {
  local filename="$1"
  local prompt="$2"
  local outfile="$OUTDIR/${filename}.jpg"

  if [ -f "$outfile" ]; then
    echo "  ⏭  Skipping $filename (already exists)"
    return 0
  fi

  echo "  🎨 Generating: $filename"

  response=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MINIMAX_API_KEY" \
    -d "{
      \"model\": \"image-01\",
      \"prompt\": \"$prompt\",
      \"aspect_ratio\": \"1:1\",
      \"response_format\": \"url\",
      \"n\": 1
    }")

  # Extract image URL
  image_url=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'image_urls' in data['data'] and len(data['data']['image_urls']) > 0:
        print(data['data']['image_urls'][0])
    else:
        print('ERROR', file=sys.stderr)
        print(json.dumps(data.get('base_resp', data)), file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
" 2>/dev/null)

  if [ $? -ne 0 ] || [ -z "$image_url" ]; then
    echo "     ❌ Failed: $filename"
    return 1
  fi

  # Download immediately (URLs expire fast)
  curl -s -o "$outfile" "$image_url"

  if [ -f "$outfile" ] && [ -s "$outfile" ]; then
    size=$(du -h "$outfile" | cut -f1)
    echo "     ✅ Saved: $outfile ($size)"
  else
    echo "     ❌ Download failed: $filename"
    rm -f "$outfile"
  fi

  # Rate limit
  sleep 2
}

echo "═══════════════════════════════════════════════════════"
echo "  TRU SKOOL MALL — Product Image Generator"
echo "  Generating 35 product mockups + 7 hero images"
echo "  Estimated cost: ~\$0.15 (MiniMAX image-01)"
echo "═══════════════════════════════════════════════════════"
echo ""

# ─── CONCRETE ROSE ───
echo "🌹 Concrete Rose"
generate_image "cr-hero" "Luxury streetwear brand hero shot, dark concrete wall background with a single red rose, dramatic lighting, fashion editorial style, dark moody atmosphere, high-end fashion photography"
generate_image "cr-bomber" "Black satin bomber jacket with embroidered rose on the back, product photo on dark background, luxury streetwear, studio lighting, e-commerce product shot"
generate_image "cr-hoodie" "Black French terry hoodie with thorn vine graphic across chest, product flat lay on concrete surface, streetwear photography, moody lighting"
generate_image "cr-tee" "Premium black cotton t-shirt with cracked concrete texture print, flat lay product photo, minimalist dark background, fashion product photography"
generate_image "cr-joggers" "Black fleece joggers with red rose stem embroidery on left leg, product photo, dark background, streetwear fashion photography"
generate_image "cr-cap" "Structured black six-panel cap with red rose petal embroidered logo, product photo on dark surface, fashion accessories photography"
echo ""

# ─── BiJaDi ───
echo "💎 BiJaDi"
generate_image "bj-hero" "Luxury family lifestyle brand hero image, platinum and rose gold color palette, elegant minimalist composition, warm lighting, high-end lifestyle photography, champagne tones"
generate_image "bj-hoodie" "Premium cream colored fleece hoodie with platinum embroidered crest, product photo on marble surface, luxury fashion photography, warm tones"
generate_image "bj-onesie" "Organic cotton baby onesie in cream with rose gold foil text, adorable baby clothing flat lay, soft warm lighting, luxury baby fashion"
generate_image "bj-polo" "Elegant cream pique cotton polo shirt with platinum monogram, product photo on light marble, luxury menswear photography"
generate_image "bj-kids-tee" "Soft cotton kids t-shirt in cream with playful embroidered characters, children's fashion flat lay, warm bright photography"
generate_image "bj-bracelet" "Stainless steel link bracelet with platinum finish and elegant clasp, jewelry product photo on dark velvet, luxury accessories photography, dramatic lighting"
echo ""

# ─── FAITHFULLY FADED ───
echo "🦋 Faithfully Faded"
generate_image "ff-hero" "Edgy fashion brand hero shot, deep burgundy and pink color palette, butterfly motifs, vintage film grain aesthetic, streetwear editorial photography"
generate_image "ff-dress" "Oversized hooded baseball jersey dress with mesh panels and snap front, product photo, edgy streetwear photography, pink and dark burgundy tones"
generate_image "ff-crop-hoodie" "Boxy cropped hoodie in deep burgundy with back print, product flat lay, streetwear photography, pink accent lighting"
generate_image "ff-tee" "Vintage wash t-shirt with faded script graphic, product photo with retro aesthetic, soft pink and burgundy tones, fashion photography"
generate_image "ff-joggers" "Dark burgundy fleece joggers with side stripe detail, product photo, streetwear fashion, moody lighting"
generate_image "ff-beanie" "Ribbed knit beanie in deep burgundy with embroidered butterfly, product photo on dark surface, cozy accessories photography"
echo ""

# ─── H.O.E. ───
echo "👑 H.O.E."
generate_image "ho-hero" "Bold regal fashion brand hero image, gold and black color palette, crown motif, dramatic royal aesthetic, luxury fashion editorial photography"
generate_image "ho-jacket" "Structured oversized black jacket with gold crown embroidery on back, product photo, bold fashion photography, dramatic gold lighting"
generate_image "ho-hoodie" "Heavyweight black hoodie with metallic gold logo, product photo on dark background, bold streetwear photography, gold accents"
generate_image "ho-tee" "Premium black t-shirt with regal gold crest graphic, product flat lay, luxury streetwear photography"
generate_image "ho-chain" "Gold-plated chain necklace with ornate scepter pendant, jewelry product photo on black velvet, dramatic gold lighting, luxury accessories"
generate_image "ho-shorts" "Black mesh basketball shorts with gold crown side panel, product photo, athletic streetwear photography"
echo ""

# ─── WANDERLUST ───
echo "🌍 Wanderlust"
generate_image "wl-hero" "Travel and adventure brand hero image, earth tones and sage green, globe and compass motifs, wanderlust travel photography aesthetic, warm natural light"
generate_image "wl-pack" "Olive green weather-resistant backpack with travel details, product photo on natural surface, adventure gear photography, outdoor lighting"
generate_image "wl-hoodie" "Forest green hoodie with passport stamp print pattern, product photo, travel lifestyle fashion, warm tones"
generate_image "wl-tee" "Sage green tri-blend t-shirt with GPS coordinates printed, product flat lay on world map, travel fashion photography"
generate_image "wl-joggers" "Lightweight olive joggers with zip pockets, product photo, travel activewear photography, outdoor lighting"
generate_image "wl-hat" "Wide-brim adventure hat with compass logo embroidered, product photo on natural surface, outdoor accessories photography"
echo ""

# ─── CAFÉ SATIVA ───
echo "☕ Café Sativa"
generate_image "cs-hero" "Warm coffee lounge brand hero image, rich brown and amber tones, vintage cafe aesthetic, retro typography, cozy atmospheric photography, Sip Smoke Vibe"
generate_image "cs-coffee" "Premium coffee bag with retro bold serif label design, product photo on wooden surface, artisanal coffee photography, warm lighting"
generate_image "cs-mug" "Hand-thrown ceramic coffee mug with retro logo, product photo on wooden cafe counter, warm amber lighting, artisan pottery photography"
generate_image "cs-tee" "Vintage wash brown t-shirt with retro cafe logo, product flat lay on wooden surface, vintage fashion photography, warm tones"
generate_image "cs-tray" "Handcrafted wooden rolling tray with carved motif, product photo on dark surface, artisan craftsmanship photography"
generate_image "cs-candle" "Soy wax candle in amber glass jar with elegant label, product photo, warm atmospheric lighting, lifestyle photography, cozy vibes"
echo ""

# ─── THE VERSE ALKEMIST ───
echo "🎤 The Verse Alkemist"
generate_image "va-hero" "Hip hop music studio brand hero image, purple neon and black aesthetic, vinyl records and microphone, rap music production atmosphere, dramatic neon lighting"
generate_image "va-ep" "Music album cover art, dark with purple neon glow, abstract walls of the world concept, hip hop EP artwork, vinyl record aesthetic"
generate_image "va-hoodie" "Heavyweight black hoodie with metallic purple logo, product photo on dark background, hip hop fashion photography, purple accent lighting"
generate_image "va-tee" "Black t-shirt with lyric fragment screen print, product flat lay, underground hip hop merch aesthetic, moody purple lighting"
generate_image "va-snapback" "Black flat-brim snapback cap with embroidered turntable icon, product photo, hip hop accessories, purple accent"
generate_image "va-stickers" "Set of die-cut vinyl stickers with hip hop album art designs spread on dark surface, music merch photography, purple and black tones"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "  Done! Generated images in $OUTDIR/"
echo ""
echo "  Total: 42 images (~\$0.15)"
echo "  Push to GitHub and Vercel will deploy automatically."
echo "═══════════════════════════════════════════════════════"
