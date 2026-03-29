#!/bin/bash
# ═══════════════════════════════════════════════════════════
# TRU SKOOL MALL — Batch Ambient Track Generator
# Uses MiniMAX Music 2.0 to generate zone-specific background music
# Cost: ~$0.03 per track × 8 zones = $0.24 total
# ═══════════════════════════════════════════════════════════

if [ -z "$MINIMAX_API_KEY" ]; then
  echo "Error: Set MINIMAX_API_KEY environment variable first"
  echo "  export MINIMAX_API_KEY=your-key-here"
  exit 1
fi

OUTDIR="assets/audio"
mkdir -p "$OUTDIR"

API="https://api.minimax.io/v1/music_generation"

generate_track() {
  local name="$1"
  local prompt="$2"
  local outfile="$OUTDIR/ambient-${name}.mp3"

  echo "🎵 Generating: $name"
  echo "   Prompt: $prompt"

  response=$(curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $MINIMAX_API_KEY" \
    -d "{
      \"model\": \"music-2.0\",
      \"prompt\": \"$prompt\",
      \"lyrics\": \"[inst]\"
    }")

  # Extract hex audio and convert to binary
  audio_hex=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'data' in data and 'audio' in data['data']:
        print(data['data']['audio'])
    else:
        print('ERROR: ' + json.dumps(data.get('base_resp', data)), file=sys.stderr)
        sys.exit(1)
except Exception as e:
    print(f'ERROR: {e}', file=sys.stderr)
    sys.exit(1)
")

  if [ $? -ne 0 ]; then
    echo "   ❌ Failed to generate $name"
    return 1
  fi

  echo "$audio_hex" | python3 -c "
import sys
hex_str = sys.stdin.read().strip()
with open('$outfile', 'wb') as f:
    f.write(bytes.fromhex(hex_str))
"

  if [ -f "$outfile" ]; then
    size=$(du -h "$outfile" | cut -f1)
    echo "   ✅ Saved: $outfile ($size)"
  else
    echo "   ❌ Failed to save $outfile"
  fi

  # Rate limit pause
  sleep 5
}

echo "═══════════════════════════════════════════"
echo "  TRU SKOOL MALL — Ambient Track Generator"
echo "  Generating 8 zone-specific background tracks"
echo "  Estimated cost: \$0.24 (MiniMAX Music 2.0)"
echo "═══════════════════════════════════════════"
echo ""

generate_track "entrance" \
  "72 BPM ambient pad in Dm, luxurious and sophisticated. Soft warm synth chords with gentle reverb. Background music for a high-end luxury mall entrance. Subtle, loopable, atmospheric. No vocals. 2 minutes."

generate_track "concrete-rose" \
  "90 BPM dark lo-fi hip hop beat in Am. Subtle bass, gritty texture, vinyl crackle. Background music for a luxury streetwear boutique. Moody but elegant. No vocals. 2 minutes."

generate_track "bijadi" \
  "68 BPM warm ambient chords in C major. Soft piano and gentle strings. Background music for a platinum luxury family lifestyle store. Elegant and comforting. No vocals. 2 minutes."

generate_track "faithfully-faded" \
  "85 BPM hazy lo-fi beat in F minor. Vinyl texture, warm Rhodes chords, lazy drum pattern. Background music for an edgy fashion boutique with a blunt vibe. No vocals. 2 minutes."

generate_track "hoe" \
  "95 BPM regal trap-influenced beat in G minor. Bold 808 bass, crisp hi-hats, royal brass stabs. Background music for a bold, crown-themed fashion store. No vocals. 2 minutes."

generate_track "wanderlust" \
  "110 BPM uplifting world music fusion in G major. Acoustic guitar, gentle percussion, airy pads. Background music for a travel and adventure store. Inspiring and warm. No vocals. 2 minutes."

generate_track "cafe-sativa" \
  "75 BPM warm jazz-lounge in Eb major. Soft brushed drums, upright bass, warm Rhodes piano. Background music for a coffee and culture lounge. Cozy and sophisticated. No vocals. 2 minutes."

generate_track "verse-alkemist" \
  "92 BPM boom bap hip hop instrumental in C minor. Classic vinyl crackle, punchy drums, soulful sample chops. Background music for a hip hop studio. Authentic golden era vibe. No vocals. 2 minutes."

echo ""
echo "═══════════════════════════════════════════"
echo "  Done! Generated tracks in $OUTDIR/"
echo ""
echo "  To use in the mall, update js/ambient-audio.js:"
echo "  Change zone type from 'synth' to 'url' and add:"
echo "    url: 'assets/audio/ambient-ZONE.mp3'"
echo "═══════════════════════════════════════════"
