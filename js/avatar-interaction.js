/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Avatar Interaction System
   Makes 3D avatars face the visitor, show labels, and react
   ═══════════════════════════════════════════════════════════ */

AFRAME.registerComponent('avatar-interact', {
  schema: {
    name: { type: 'string', default: '' },
    color: { type: 'string', default: '#c9a84c' },
    range: { type: 'number', default: 8 },
    guide: { type: 'string', default: 'laviche' },
  },

  init: function() {
    this.camera = null;
    this.isNear = false;
    this.hasGreeted = false;

    // Create floating name label
    var label = document.createElement('a-entity');
    label.setAttribute('position', '0 2.2 0');
    label.innerHTML = `
      <a-text value="${this.data.name}" align="center" color="${this.data.color}"
        width="6" font="mozillavr" opacity="0.9"></a-text>
      <a-text value="Click to chat" align="center" color="#888"
        width="3" font="mozillavr" position="0 -0.25 0" opacity="0"
        class="chat-hint"></a-text>
    `;
    this.el.appendChild(label);
    this.label = label;

    // Create glow ring on floor
    var ring = document.createElement('a-ring');
    ring.setAttribute('position', '0 0.03 0');
    ring.setAttribute('rotation', '-90 0 0');
    ring.setAttribute('radius-inner', '0.8');
    ring.setAttribute('radius-outer', '1.2');
    ring.setAttribute('material', `color: ${this.data.color}; emissive: ${this.data.color}; emissiveIntensity: 0.3; opacity: 0; transparent: true`);
    this.el.appendChild(ring);
    this.ring = ring;

    // Click handler — open chat with this guide
    this.el.addEventListener('click', () => {
      if (typeof GuideSystem !== 'undefined') {
        GuideSystem.switchGuide(this.data.guide, '');
      }
      var chatPanel = document.getElementById('chat-panel');
      if (chatPanel) chatPanel.classList.remove('hidden');
    });
  },

  tick: function() {
    // Get camera position
    if (!this.camera) {
      this.camera = document.querySelector('[camera]');
      if (!this.camera) return;
    }

    var camPos = this.camera.object3D.getWorldPosition(new THREE.Vector3());
    var myPos = this.el.object3D.getWorldPosition(new THREE.Vector3());
    var dist = camPos.distanceTo(myPos);
    var wasNear = this.isNear;
    this.isNear = dist < this.data.range;

    // Show/hide label and ring based on proximity
    if (this.isNear && !wasNear) {
      // Just entered range — show label + ring
      this.label.setAttribute('visible', true);
      this.ring.setAttribute('material', 'opacity', 0.4);

      // Show "click to chat" hint
      var hint = this.label.querySelector('.chat-hint');
      if (hint) hint.setAttribute('opacity', 0.7);

    } else if (!this.isNear && wasNear) {
      // Left range — hide hint, fade ring
      this.ring.setAttribute('material', 'opacity', 0);
      var hint = this.label.querySelector('.chat-hint');
      if (hint) hint.setAttribute('opacity', 0);
    }

    // Rotate avatar to face camera when nearby
    if (this.isNear) {
      var dx = camPos.x - myPos.x;
      var dz = camPos.z - myPos.z;
      var angle = Math.atan2(dx, dz) * (180 / Math.PI);
      // Smoothly rotate toward camera
      var currentRot = this.el.getAttribute('rotation');
      var diff = angle - currentRot.y;
      // Normalize angle difference
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      this.el.setAttribute('rotation', {
        x: currentRot.x,
        y: currentRot.y + diff * 0.05,  // Smooth lerp
        z: currentRot.z,
      });
    }
  },
});
