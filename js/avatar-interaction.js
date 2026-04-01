/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Avatar Interaction System v2
   Avatars face the visitor, show labels, glow on approach
   ═══════════════════════════════════════════════════════════ */

AFRAME.registerComponent('avatar-interact', {
  schema: {
    name: { type: 'string', default: '' },
    color: { type: 'string', default: '#c9a84c' },
    range: { type: 'number', default: 10 },
    guide: { type: 'string', default: 'laviche' },
  },

  init: function() {
    this.camEl = null;
    this.isNear = false;
    this.targetY = 0;
    this._vec1 = new THREE.Vector3();
    this._vec2 = new THREE.Vector3();
    this._frameCount = 0;

    // Create floating name label (above avatar head)
    var label = document.createElement('a-entity');
    label.setAttribute('position', '0 2.2 0');
    label.setAttribute('visible', false);
    label.innerHTML =
      '<a-text value="' + this.data.name + '" align="center" color="' + this.data.color + '" ' +
      'width="6" font="mozillavr" opacity="0.9"></a-text>' +
      '<a-text value="Click to chat" align="center" color="#aaa" ' +
      'width="3" font="mozillavr" position="0 -0.3 0" opacity="0.6"></a-text>';
    this.el.appendChild(label);
    this.label = label;

    // Create glow ring
    var ring = document.createElement('a-ring');
    ring.setAttribute('position', '0 0.03 0');
    ring.setAttribute('rotation', '-90 0 0');
    ring.setAttribute('radius-inner', '0.7');
    ring.setAttribute('radius-outer', '1.0');
    ring.setAttribute('material',
      'color: ' + this.data.color +
      '; emissive: ' + this.data.color +
      '; emissiveIntensity: 0.4; opacity: 0; transparent: true');
    this.el.appendChild(ring);
    this.ring = ring;

    // Click → switch to this guide
    var guide = this.data.guide;
    this.el.classList.add('clickable');
    this.el.addEventListener('click', function() {
      if (typeof GuideSystem !== 'undefined') {
        GuideSystem.switchGuide(guide, '');
      }
      var panel = document.getElementById('chat-panel');
      if (panel) panel.classList.remove('hidden');
    });

    console.log('[AvatarInteract] Init: ' + this.data.name);
  },

  tick: function(time, delta) {
    // Only check every 3rd frame for performance
    this._frameCount++;
    if (this._frameCount % 3 !== 0) return;

    if (!this.camEl) {
      this.camEl = document.querySelector('[camera]');
      if (!this.camEl) return;
    }

    // Get positions
    this.camEl.object3D.getWorldPosition(this._vec1);
    this.el.object3D.getWorldPosition(this._vec2);

    var dx = this._vec1.x - this._vec2.x;
    var dz = this._vec1.z - this._vec2.z;
    var dist = Math.sqrt(dx * dx + dz * dz);

    var wasNear = this.isNear;
    this.isNear = dist < this.data.range;

    // Show/hide label + ring
    if (this.isNear && !wasNear) {
      this.label.setAttribute('visible', true);
      this.ring.setAttribute('material', 'opacity', 0.35);
    } else if (!this.isNear && wasNear) {
      this.label.setAttribute('visible', false);
      this.ring.setAttribute('material', 'opacity', 0);
    }

    // Rotate to face camera when within range
    if (this.isNear && dist > 1.5) {
      this.targetY = Math.atan2(dx, dz) * (180 / Math.PI);

      // Direct rotation on object3D (bypasses A-Frame attribute system for smoothness)
      var currentY = this.el.object3D.rotation.y * (180 / Math.PI);
      var diff = this.targetY - currentY;
      // Normalize
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;

      // Smooth turn — 15% per tick
      if (Math.abs(diff) > 1) {
        var newY = currentY + diff * 0.15;
        this.el.object3D.rotation.y = newY * (Math.PI / 180);
      }
    }
  },
});
