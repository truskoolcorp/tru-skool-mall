/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Wayfinding System
   Directional arrows, store proximity glow, breadcrumbs
   ═══════════════════════════════════════════════════════════ */

const Wayfinding = {

  // ─── Store directory signs (added to scene) ───
  signs: [
    { text: '← CONCRETE ROSE', pos: '-5 3.5 -3', rot: '0 0 0', color: '#c94060' },
    { text: 'BiJaDi →',        pos: '5 3.5 -3',  rot: '0 0 0', color: '#d4c0a8' },
    { text: '← FAITHFULLY FADED', pos: '-5 3.5 -17', rot: '0 0 0', color: '#FFADED' },
    { text: 'H.O.E. →',        pos: '5 3.5 -17', rot: '0 0 0', color: '#e8c060' },
    { text: '← WANDERLUST',    pos: '-5 3.5 -33', rot: '0 0 0', color: '#60c890' },
    { text: 'CAFE SATIVA →',   pos: '5 3.5 -33', rot: '0 0 0', color: '#c09060' },
    { text: '↓ THE VERSE ALKEMIST', pos: '0 3.5 -50', rot: '0 0 0', color: '#a060e0' },
  ],

  // ─── Floor arrows ───
  arrows: [
    { pos: '0 0.03 -5',  rot: '-90 0 0', dir: 'forward' },
    { pos: '0 0.03 -15', rot: '-90 0 0', dir: 'forward' },
    { pos: '0 0.03 -25', rot: '-90 0 0', dir: 'forward' },
    { pos: '0 0.03 -35', rot: '-90 0 0', dir: 'forward' },
    { pos: '0 0.03 -48', rot: '-90 0 0', dir: 'forward' },
  ],

  // ─── Initialize ───
  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Add directory signs
    this.signs.forEach(sign => {
      const el = document.createElement('a-entity');
      el.setAttribute('position', sign.pos);

      // Sign background
      el.innerHTML = `
        <a-plane width="3" height="0.5" rotation="${sign.rot}"
          material="color: #0a0a14; opacity: 0.7; transparent: true">
        </a-plane>
        <a-text value="${sign.text}" position="0 0 0.01" rotation="${sign.rot}"
          align="center" color="${sign.color}" width="4" font="mozillavr" opacity="0.9">
        </a-text>
      `;
      scene.appendChild(el);
    });

    // Add floor arrows (chevrons)
    this.arrows.forEach(arrow => {
      const el = document.createElement('a-entity');
      el.setAttribute('position', arrow.pos);
      el.setAttribute('rotation', arrow.rot);

      // Create arrow shape using triangles
      el.innerHTML = `
        <a-triangle vertex-a="0 0.4 0" vertex-b="-0.3 -0.1 0" vertex-c="0.3 -0.1 0"
          material="color: #c9a84c; opacity: 0.2; transparent: true; side: double">
        </a-triangle>
        <a-triangle vertex-a="0 0.8 0" vertex-b="-0.3 0.3 0" vertex-c="0.3 0.3 0"
          material="color: #c9a84c; opacity: 0.15; transparent: true; side: double">
        </a-triangle>
      `;

      scene.appendChild(el);
    });

    // Add store entrance markers (glowing floor strips)
    const entranceMarkers = [
      { pos: '-5.5 0.02 -8',  w: 0.1, d: 6, color: '#c94060' },  // CR
      { pos: '5.5 0.02 -8',   w: 0.1, d: 6, color: '#d4c0a8' },  // BiJaDi
      { pos: '-5.5 0.02 -22', w: 0.1, d: 6, color: '#FFADED' },   // FF
      { pos: '5.5 0.02 -22',  w: 0.1, d: 6, color: '#e8c060' },   // HOE
      { pos: '-5.5 0.02 -38', w: 0.1, d: 6, color: '#60c890' },   // Wanderlust
      { pos: '5.5 0.02 -38',  w: 0.1, d: 6, color: '#c09060' },   // Cafe
    ];

    entranceMarkers.forEach(marker => {
      const el = document.createElement('a-box');
      el.setAttribute('position', marker.pos);
      el.setAttribute('width', marker.w);
      el.setAttribute('height', 0.01);
      el.setAttribute('depth', marker.d);
      el.setAttribute('material', `color: ${marker.color}; emissive: ${marker.color}; emissiveIntensity: 0.4; opacity: 0.5; transparent: true`);
      scene.appendChild(el);
    });

    console.log('[Wayfinding] Directory signs and floor markers initialized');
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) Wayfinding.init();
    else scene.addEventListener('loaded', () => Wayfinding.init());
  }
});

window.Wayfinding = Wayfinding;
