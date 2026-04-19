/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Core Engine
   Mode switching, teleportation, zone detection, minimap
   ═══════════════════════════════════════════════════════════ */

// ─── State ───
const MallState = {
  mode: null,          // 'virtual' | 'ar' | 'vr'
  currentZone: 'Grand Entrance',
  currentGuide: 'laviche',
  voiceEnabled: false,   // opt-in — user clicks 🔊 to enable
  chatOpen: false,       // opt-in — user clicks 💬 to open
  mapOpen: false,
};

// ─── Teleport Positions ───
const TELEPORT_POSITIONS = {
  'entrance':         { x: 0,    y: 0,   z: 14,  label: 'Grand Entrance' },
  'concrete-rose':    { x: -7,   y: 0,   z: -8,  label: 'Concrete Rose' },
  'bijadi':           { x: 7,    y: 0,   z: -8,  label: 'BiJaDi' },
  'faithfully-faded': { x: -7,   y: 0,   z: -22, label: 'Faithfully Faded' },
  'hoe':              { x: 7,    y: 0,   z: -22, label: 'H.O.E.' },
  'wanderlust':       { x: -7,   y: 0,   z: -38, label: 'Wanderlust' },
  'cafe-sativa':      { x: 6,    y: 0,   z: -29, label: 'Cafe Sativa' },
  'verse-alkemist':   { x: 0,    y: 0,   z: -55, label: 'The Verse Alkemist' },
};

// ─── Zone Trigger Definitions ───
const ZONES = [
  { id: 'entrance',         pos: {x:0, z:3},   size: {w:10, d:4},  label: 'Grand Entrance',    guide: 'laviche' },
  { id: 'concrete-rose',    pos: {x:-7, z:-8},  size: {w:6, d:8},   label: 'Concrete Rose',     guide: 'laviche' },
  { id: 'bijadi',           pos: {x:7, z:-8},   size: {w:6, d:8},   label: 'BiJaDi',            guide: 'laviche' },
  { id: 'faithfully-faded', pos: {x:-7, z:-22}, size: {w:6, d:8},   label: 'Faithfully Faded',  guide: 'ahnika' },
  { id: 'hoe',              pos: {x:7, z:-22},  size: {w:6, d:8},   label: 'H.O.E.',            guide: 'laviche' },
  { id: 'wanderlust',       pos: {x:-7, z:-38}, size: {w:6, d:8},   label: 'Wanderlust',        guide: 'ginger' },
  { id: 'cafe-sativa',      pos: {x:13, z:-35}, size: {w:22, d:22},  label: 'Cafe Sativa',       guide: 'laviche' },
  { id: 'verse-alkemist',   pos: {x:0, z:-58},  size: {w:12, d:10}, label: 'The Verse Alkemist', guide: 'laviche' },
];

// ═══════════════════════════════════════════════════
// MODE MANAGEMENT
// ═══════════════════════════════════════════════════

function enterMall(mode) {
  MallState.mode = mode;

  // Hide mode selector
  document.getElementById('mode-selector').classList.add('hidden');
  // Show HUD
  document.getElementById('hud').classList.remove('hidden');

  const scene = document.getElementById('mall-scene');

  switch(mode) {
    case 'virtual':
      // Standard first-person browser mode (default A-Frame)
      console.log('[Mall] Entering Virtual mode');
      break;

    case 'ar':
      // 8th Wall AR mode
      console.log('[Mall] Entering AR mode');
      initARMode();
      break;

    case 'vr':
      // WebXR VR headset mode
      console.log('[Mall] Entering VR mode');
      if (scene.enterVR) {
        scene.enterVR();
      }
      break;
  }

  // Start zone detection loop
  startZoneDetection();

  // Start minimap
  initMinimap();

  // Initialize ambient audio
  if (typeof AmbientAudio !== 'undefined') {
    AmbientAudio.init();
  }

  // Trigger entrance greeting
  if (typeof GuideSystem !== 'undefined') {
    GuideSystem.greet('entrance');
  }

  // Hide move hint after 6 seconds
  setTimeout(() => {
    const hint = document.getElementById('move-hint');
    if (hint) hint.style.opacity = '0';
    setTimeout(() => { if (hint) hint.style.display = 'none'; }, 500);
  }, 6000);
}

function showModeSelector() {
  document.getElementById('mode-selector').classList.remove('hidden');
  document.getElementById('hud').classList.add('hidden');
}

// ═══════════════════════════════════════════════════
// AR MODE (8th Wall Integration)
// ═══════════════════════════════════════════════════

function initARMode() {
  // Check if 8th Wall engine is loaded
  if (typeof XR8 === 'undefined') {
    console.warn('[Mall] 8th Wall engine not loaded. To enable AR:');
    console.warn('  1. Download xr-standalone.zip from https://8th.io/xrjs');
    console.warn('  2. Unzip into project /xr/ folder');
    console.warn('  3. Uncomment the script tag in index.html');

    addChatMessage('laviche',
      'AR mode requires 8th Wall engine setup. For now, exploring in virtual mode — you can still see everything, darling. 💎'
    );

    // Fallback to virtual mode
    MallState.mode = 'virtual';
    return;
  }

  // Initialize 8th Wall
  const onxrloaded = () => {
    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      XR8.Threejs.pipelineModule(),
      XR8.XrController.pipelineModule(),
      window.LandingPage && window.LandingPage.pipelineModule(),
    ].filter(Boolean));

    const canvas = document.querySelector('canvas');
    if (canvas) {
      XR8.run({ canvas, allowedDevices: XR8.XrConfig.device().ANY });
    }
  };

  window.XR8 ? onxrloaded() : window.addEventListener('xrloaded', onxrloaded);
}

// ═══════════════════════════════════════════════════
// TELEPORTATION
// ═══════════════════════════════════════════════════

function teleportTo(locationId) {
  const pos = TELEPORT_POSITIONS[locationId];
  if (!pos) return;

  const rig = document.getElementById('camera-rig');
  if (!rig) return;

  // Smooth fade transition
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9998;
    background: black; opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  `;
  document.body.appendChild(overlay);

  // Fade to black
  requestAnimationFrame(() => { overlay.style.opacity = '1'; });

  setTimeout(() => {
    // Move player
    rig.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);

    // Reset camera look direction toward mall interior
    var cam = document.getElementById('camera');
    if (cam) {
      var lookComp = cam.components['look-controls'];
      if (lookComp) {
        lookComp.pitchObject.rotation.x = 0;
        lookComp.yawObject.rotation.y = 0; // Face into mall (-Z direction)
      }
    }

    // Update zone
    MallState.currentZone = pos.label;
    document.getElementById('location-label').textContent = pos.label;

    // Transition ambient audio
    if (typeof AmbientAudio !== 'undefined') {
      AmbientAudio.transitionTo(pos.label);
    }

    // Fade back
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);

    // Trigger zone narration
    if (typeof GuideSystem !== 'undefined') {
      GuideSystem.greet(locationId);
    }
  }, 350);

  // Note: callers are responsible for closing their own UI surfaces.
  // toggleToStore() closes the Store Directory; the minimap stays open
  // so you can see where you teleported to.
}

// ═══════════════════════════════════════════════════
// ZONE DETECTION (proximity-based)
// ═══════════════════════════════════════════════════

let zoneCheckInterval = null;

function startZoneDetection() {
  if (zoneCheckInterval) return;

  zoneCheckInterval = setInterval(() => {
    const rig = document.getElementById('camera-rig');
    if (!rig) return;

    const pos = rig.getAttribute('position');
    const px = pos.x;
    const pz = pos.z;

    let detectedZone = null;
    for (const zone of ZONES) {
      const halfW = zone.size.w / 2;
      const halfD = zone.size.d / 2;
      if (px >= zone.pos.x - halfW && px <= zone.pos.x + halfW &&
          pz >= zone.pos.z - halfD && pz <= zone.pos.z + halfD) {
        detectedZone = zone;
        break;
      }
    }

    if (detectedZone && detectedZone.label !== MallState.currentZone) {
      MallState.currentZone = detectedZone.label;
      MallState.currentGuide = detectedZone.guide;

      document.getElementById('location-label').textContent = detectedZone.label;

      // Switch chat persona
      if (typeof GuideSystem !== 'undefined') {
        GuideSystem.switchGuide(detectedZone.guide, detectedZone.id);
      }

      // Transition ambient audio
      if (typeof AmbientAudio !== 'undefined') {
        AmbientAudio.transitionTo(detectedZone.label);
      }

      console.log(`[Mall] Entered zone: ${detectedZone.label} (guide: ${detectedZone.guide})`);
    }
  }, 500);
}

// ═══════════════════════════════════════════════════
// UI TOGGLES
// ═══════════════════════════════════════════════════

function toggleChat() {
  const panel = document.getElementById('chat-panel');
  MallState.chatOpen = !MallState.chatOpen;
  panel.classList.toggle('chat-open', MallState.chatOpen);
  document.getElementById('btn-chat').classList.toggle('active', MallState.chatOpen);

  // When the user opens chat for the first time, greet them from the
  // current zone's guide so the panel isn't empty.
  if (MallState.chatOpen && typeof GuideSystem !== 'undefined') {
    var zone = null;
    for (const z of ZONES) {
      if (z.label === MallState.currentZone) { zone = z; break; }
    }
    if (zone) GuideSystem.greet(zone.id);
  }
}

function toggleMap() {
  // Option B: 🗺 button shows the minimap ("where am I"), 🏪 shows the
  // Store Directory ("take me somewhere"). Previously 🗺 opened a text
  // teleport list that duplicated the Directory.
  MallState.mapOpen = !MallState.mapOpen;
  const mm = document.getElementById('minimap');
  if (mm) mm.classList.toggle('hidden', !MallState.mapOpen);
  document.getElementById('btn-map').classList.toggle('active', MallState.mapOpen);
}

function toggleVoice() {
  MallState.voiceEnabled = !MallState.voiceEnabled;
  document.getElementById('btn-voice').classList.toggle('active', MallState.voiceEnabled);
  const status = document.getElementById('voice-status');
  if (!MallState.voiceEnabled) {
    status.classList.add('hidden');
  }
}

function toggleMusic() {
  if (typeof AmbientAudio !== 'undefined') {
    const isOn = AmbientAudio.toggle();
    document.getElementById('btn-music').classList.toggle('active', isOn);
  }
}

// ═══════════════════════════════════════════════════
// MINIMAP
// ═══════════════════════════════════════════════════

let minimapCtx = null;

function initMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  if (!canvas) return;
  minimapCtx = canvas.getContext('2d');

  // Draw minimap periodically
  setInterval(drawMinimap, 200);
}

function drawMinimap() {
  if (!minimapCtx) return;
  const ctx = minimapCtx;
  const W = 240, H = 320;

  // Clear
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);

  // Scale: map world coords to canvas
  // World: x from -15 to 15 (width 30), z from -70 to 10 (depth 80)
  const mapX = (wx) => ((wx + 15) / 30) * W;
  const mapY = (wz) => ((wz + 70) / 80) * (H - 20) + 10;

  // Draw corridor
  ctx.fillStyle = '#1a1a24';
  ctx.fillRect(mapX(-15), mapY(-70), mapX(15) - mapX(-15), mapY(10) - mapY(-70));

  // Draw stores
  const storeColors = {
    'concrete-rose': '#c94060',
    'bijadi': '#d4c0a8',
    'faithfully-faded': '#FFADED',
    'hoe': '#e8c060',
    'wanderlust': '#60c890',
    'cafe-sativa': '#c09060',
    'verse-alkemist': '#a060e0',
  };

  for (const zone of ZONES) {
    if (zone.id === 'entrance') continue;
    ctx.fillStyle = storeColors[zone.id] || '#444';
    ctx.globalAlpha = 0.3;
    const x = mapX(zone.pos.x - zone.size.w/2);
    const y = mapY(zone.pos.z - zone.size.d/2);
    const w = (zone.size.w / 30) * W;
    const h = (zone.size.d / 80) * (H - 20);
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;

    // Store label
    ctx.fillStyle = storeColors[zone.id] || '#888';
    ctx.font = '9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(zone.label, mapX(zone.pos.x), mapY(zone.pos.z) + 3);
  }

  // Draw player position
  const rig = document.getElementById('camera-rig');
  if (rig) {
    const pos = rig.getAttribute('position');
    const px = mapX(pos.x);
    const py = mapY(pos.z);

    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#c9a84c';
    ctx.fill();
    ctx.strokeStyle = '#ffe0a0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

// ═══════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return; // Don't capture when typing in chat

  switch(e.key.toLowerCase()) {
    // Option B nav model:
    //   T or M → toggle minimap ("where am I")
    //   D     → toggle store directory ("take me somewhere")
    //   C     → toggle chat
    //   V     → toggle voice
    //   N     → toggle music
    case 't': toggleMap(); break;
    case 'm': toggleMap(); break;
    case 'd': toggleDirectory(); break;
    case 'c': toggleChat(); break;
    case 'v': toggleVoice(); break;
    case 'n': toggleMusic(); break;
  }
});

// ═══════════════════════════════════════════════════
// HELPER: Add chat message to panel
// ═══════════════════════════════════════════════════

function addChatMessage(persona, text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = 'msg guide';
  msg.innerHTML = `
    <div class="msg-avatar ${persona}"></div>
    <div class="msg-body">${text}</div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = 'msg user';
  msg.innerHTML = `
    <div class="msg-body">${text}</div>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// Export for other modules
window.MallState = MallState;
window.enterMall = enterMall;
window.showModeSelector = showModeSelector;
window.teleportTo = teleportTo;
window.toggleChat = toggleChat;
window.toggleMap = toggleMap;
window.toggleVoice = toggleVoice;
window.toggleMusic = toggleMusic;
window.addChatMessage = addChatMessage;
window.addUserMessage = addUserMessage;
window.TELEPORT_POSITIONS = TELEPORT_POSITIONS;

// ═══════════════════════════════════════════════════
// HELP OVERLAY
// ═══════════════════════════════════════════════════

function toggleHelp() {
  var overlay = document.getElementById('help-overlay');
  if (!overlay) return;
  overlay.classList.toggle('hidden');
  document.getElementById('btn-help').classList.toggle('active', !overlay.classList.contains('hidden'));
}
window.toggleHelp = toggleHelp;

// ═══════════════════════════════════════════════════
// STORE DIRECTORY
// ═══════════════════════════════════════════════════

function toggleDirectory() {
  var panel = document.getElementById('directory-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
  document.getElementById('btn-directory').classList.toggle('active', !panel.classList.contains('hidden'));
}
window.toggleDirectory = toggleDirectory;

function teleportToStore(storeId) {
  // Close directory panel
  var panel = document.getElementById('directory-panel');
  if (panel) panel.classList.add('hidden');
  document.getElementById('btn-directory').classList.remove('active');

  // Use existing teleport system
  if (typeof teleportTo === 'function') {
    teleportTo(storeId);
  }
}
window.teleportToStore = teleportToStore;

// ═══════════════════════════════════════════════════
// WELCOME TOOLTIP
// ═══════════════════════════════════════════════════

function showWelcome() {
  var tooltip = document.getElementById('welcome-tooltip');
  if (!tooltip) return;
  // Only show welcome to first-time visitors. Once dismissed (or auto-hidden),
  // remember so subsequent visits don't re-open the tooltip.
  try {
    if (localStorage.getItem('mall_welcome_seen') === '1') return;
  } catch (e) { /* localStorage unavailable — fall through and show */ }
  tooltip.classList.remove('hidden');
  // Auto-dismiss after 8 seconds
  setTimeout(function() { dismissWelcome(); }, 8000);
}

function dismissWelcome() {
  var tooltip = document.getElementById('welcome-tooltip');
  if (tooltip) tooltip.classList.add('hidden');
  try { localStorage.setItem('mall_welcome_seen', '1'); } catch (e) {}
}
window.dismissWelcome = dismissWelcome;

// Show welcome 2 seconds after entering mall
var _origEnterMall = window.enterMall;
window.enterMall = function(mode) {
  _origEnterMall(mode);
  setTimeout(showWelcome, 2000);
};
