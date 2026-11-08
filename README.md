# Tru Skool Mall — 3D Virtual Experience

**Culture. Commerce. Code.**

A multi-mode (Virtual / AR / VR) 3D virtual shopping mall featuring AI persona guides, built for [Tru Skool Entertainment International Corp](https://truskool.net).

## Features

### Phase 1 — Foundation
- **7 Brand Storefronts**: Concrete Rose, BiJaDi, Faithfully Faded, H.O.E., Wanderlust, Café Sativa, The Verse Alkemist
- **3 Experience Modes**: Browser (Virtual), AR (8th Wall), VR Headset (WebXR)
- **AI Persona Guides**: Laviche Cárdenas (main), Ginger Pelirroja (Wanderlust), Ahnika Merlot (Faithfully Faded)
- **Claude-Powered Chat**: Conversational AI guide with zone-aware context
- **MiniMAX TTS Voice**: Voice narration from AI personas as you explore
- **Teleportation System**: Instant travel between stores
- **Minimap**: Real-time position tracking
- **Zone Detection**: Automatic guide switching based on location

### Phase 2 — Enhanced Experience
- **Product Catalog**: 35+ products across 7 stores with clickable detail panels
- **Store Interiors**: Detailed geometry — shelving, racks, mirrors, mannequins, display cases, counters, furniture
- **Ambient Audio**: Zone-specific synthesized background music with crossfading (upgradeable to MiniMAX Music tracks)
- **Wayfinding System**: Directory signs, floor arrows, color-coded entrance markers
- **Loading Screen**: Branded loading experience with progress indicators
- **Music Generation Script**: Batch generate MiniMAX Music 2.0 tracks for all 8 zones ($0.24 total)
- **TTS API Proxy**: Secure MiniMAX voice proxy for production deployment

## Quick Start

```bash
# Install http-server
npm install

# Start local server
npm run serve

# Open browser
open http://localhost:8080
```

## Text chat safety and release preparation

Mall chat uses the Café concierge endpoint as an anonymous browser session. It does not send authentication cookies or promise shared signed-in Café history. Never put provider keys in browser storage.

The local compatibility candidate requires Café's uncached capability endpoint before sending. Durable requests use retained UUIDv7 identities and explicit same-ID status recovery. Legacy mode remains wire-compatible when Café reports it, but an uncertain legacy send is retained and blocked rather than sent again. Browser storage and Web Locks are required for safe cross-tab coordination.

The old `/api/chat` direct-provider path is replaced in this candidate by a provider-free HTTP 410 response. It does not redirect, proxy, or invoke Anthropic. Old deployments remain a separate rollout concern.

See [the compatibility and rollout checklist](docs/concierge-compatibility.md) before any publication. This is local preparation, not a production enablement instruction. Durable mode must stay off until the separate approved database and rollout gates are complete.

### Local synthetic checks

Run `npm test`. Tests inject network and browser storage; they do not invoke any live chat endpoint, model, or payment service. The source review covered all nonbinary files in the baseline, but full 3D browser QA still requires the complete checkout and media. The dependency-free GitHub workflow runs these mocked regressions and syntax checks; it does not deploy anything.

### Voice configuration

Independent voice narration retains its existing configuration. This text-chat change does not deploy or certify voice services.

## Enable AR Mode (8th Wall)

1. Download the engine binary: https://8th.io/xrjs
2. Unzip into `./xr/` folder in the project
3. Uncomment the script tag in `index.html`:
   ```html
   <script async src="./xr/xr.js" data-preload-chunks="slam"></script>
   ```
4. Serve over HTTPS for mobile camera access:
   ```bash
   npm run serve:ssl
   ```

## Project Structure

```
tru-skool-mall/
├── index.html              # Main 3D scene (A-Frame)
├── css/
│   ├── ui.css              # HUD, chat, mode selector styling
│   └── product-panel.css   # Product browsing overlay
├── js/
│   ├── loading-screen.js   # Branded loading experience
│   ├── mall-core.js        # Mode switching, teleport, zones, minimap
│   ├── guide-system.js     # AI persona management & greetings
│   ├── chat-engine.js      # Café concierge client and recovery UI
│   ├── concierge-transport.mjs # Retained request/status transport
│   ├── voice-narration.js  # MiniMAX TTS voice guide
│   ├── product-catalog.js  # Product database & detail panels
│   ├── ambient-audio.js    # Zone-based background music
│   ├── wayfinding.js       # Directory signs & floor markers
│   └── store-interiors.js  # Enhanced store interior geometry
├── api/
│   ├── chat.js             # Retired legacy endpoint (provider-free 410)
│   └── tts.js              # Vercel serverless — MiniMAX TTS proxy
├── scripts/
│   └── generate-ambient-tracks.sh  # Batch MiniMAX music generator
├── assets/
│   ├── models/             # GLTF/GLB 3D models (add your own)
│   ├── audio/              # Generated ambient tracks
│   └── textures/           # Store textures and brand assets
├── xr/                     # 8th Wall engine binary (download separately)
├── package.json
├── vercel.json
└── README.md
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look around |
| T | Toggle teleport menu |
| C | Toggle chat panel |
| M | Toggle minimap |
| V | Toggle voice narration |

## Customization

### Add Custom 3D Models

Replace A-Frame primitives with GLTF models:

```html
<!-- In a-assets -->
<a-asset-item id="store-model" src="assets/models/store.glb"></a-asset-item>

<!-- Replace store geometry -->
<a-entity gltf-model="#store-model" position="..."></a-entity>
```

### Configure Voice IDs

After cloning/designing voices in MiniMAX:

```javascript
VoiceNarration.voiceIds = {
  laviche: 'your-cloned-laviche-voice-id',
  ginger:  'your-cloned-ginger-voice-id',
  ahnika:  'your-designed-ahnika-voice-id',
};
```

### Add Product Interactivity

Attach click handlers to store elements:

```html
<a-entity class="clickable" data-product="concrete-rose-jacket-01"
  event-set__click="_event: click; ..."
></a-entity>
```

## Deployment to Vercel

Publication and production deployment require a separate reviewed release. Follow the [capability-first rollout checklist](docs/concierge-compatibility.md) and verify the exact commit's CI before deploying. Do not enable durable mode or apply a database migration as a side effect of this Mall client change.

Mall text chat now calls the Café concierge service and does not need an Anthropic provider credential in the Mall project. Do not add a browser key or restore the retired proxy. Removing existing deployment secrets or restricting historical deployment URLs requires its own approved rollout action.

Keep independent voice configuration separate; the existing MiniMAX voice setup is not changed or certified by this text-chat candidate.

## Tech Stack

- **3D Engine**: A-Frame 1.6 (Three.js) + A-Frame Extras
- **AR Engine**: 8th Wall (self-hosted binary, MIT license)
- **VR**: WebXR API (built into A-Frame)
- **AI Chat**: Shared Café concierge API
- **Voice**: MiniMAX Speech 2.8
- **Hosting**: Vercel (recommended) or any static host

## Generate Background Music

Run the batch script to generate MiniMAX Music tracks for all zones:

```bash
export MINIMAX_API_KEY=your-key-here
chmod +x scripts/generate-ambient-tracks.sh
./scripts/generate-ambient-tracks.sh
```

This generates 8 ambient tracks (one per zone) for ~$0.24 total. Then update `js/ambient-audio.js` to point each zone at its generated track file.

## Phase 3 Roadmap

- [ ] GLTF storefront models (Blender/Sketchfab)
- [ ] Product images in catalog panels
- [ ] Shopify Buy Button integration (real checkout)
- [ ] AR product placement (8th Wall world tracking)
- [ ] Avatar video loops (MiniMAX Hailuo 2.3)
- [ ] Multiplayer presence (LiveKit / Croquet)
- [ ] NFT ownership verification (Polygon)
- [ ] Spatial audio (3D positional sound per zone)
- [ ] Mobile-optimized touch controls & joystick
- [ ] Analytics dashboard (visitor tracking per zone)

---

Built by **Tru Skool Entertainment International Corp.**
Culture. Commerce. Code.
