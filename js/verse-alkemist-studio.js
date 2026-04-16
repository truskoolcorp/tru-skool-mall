/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Verse Alkemist Studio Build (Option 2 Test)

   Photorealistic-grade 3D studio built from refined primitives.
   Renders IN FRONT of the panorama backdrop.
   All major items are CLICKABLE for interaction.

   Items:
   - Studio desk with rack gear
   - Mixing console (fader grid)
   - DJ turntable (platter + tonearm + slipmat)
   - MPC drum machine (4x4 pad grid)
   - Studio monitor speakers (L+R, angled)
   - Condenser mic with shock mount + pop filter
   - Studio headphones (CLICKABLE → streams music)
   - Vinyl crate (CLICKABLE → shows releases)
   - Studio chair
   - Audio interface
   - Subwoofer
   ═══════════════════════════════════════════════════════════ */

const VerseAlkemistStudio = {
  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    // Wait for scene to be ready
    const go = () => setTimeout(() => this.build(scene), 3500);
    if (scene.hasLoaded) go();
    else scene.addEventListener('loaded', go);
  },

  build(scene) {
    // Remove primitive speakers/mic from old Verse Alkemist to avoid clutter
    this.clearOldProps();

    // Build new detailed studio — positioned at zone center (0, 0, -58)
    const studio = document.createElement('a-entity');
    studio.id = 'va-detailed-studio';
    studio.setAttribute('position', '0 0 -58');
    studio.innerHTML = this.studioHTML();
    scene.appendChild(studio);

    // Wait a frame, then wire up interactivity
    setTimeout(() => this.wireInteractions(), 100);

    console.log('[VA Studio] Detailed 3D studio built');
  },

  clearOldProps() {
    // Hide the old primitive Verse Alkemist content (keeps the zone entity for triggers)
    const oldZone = document.getElementById('zone-verse-alkemist');
    if (!oldZone) return;
    Array.from(oldZone.children).forEach(child => {
      const tag = child.tagName.toLowerCase();
      if (['a-box', 'a-text', 'a-sphere', 'a-cylinder', 'a-circle'].includes(tag)) {
        child.setAttribute('visible', 'false');
      }
    });
  },

  studioHTML() {
    return `
      <!-- ═══ STUDIO DESK (main centerpiece) ═══ -->
      <a-entity id="va-desk" position="0 0 -2">
        <!-- Desktop (wide, angled for ergonomics) -->
        <a-box position="0 0.75 0" width="3.2" height="0.08" depth="1.4"
          material="color: #1a1a1a; metalness: 0.3; roughness: 0.5"></a-box>
        <!-- Desk edge trim (purple glow) -->
        <a-box position="0 0.82 0.7" width="3.2" height="0.02" depth="0.02"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.6"></a-box>
        <!-- Desk legs (tubular, matte black) -->
        <a-cylinder position="-1.5 0.37 0.5" radius="0.04" height="0.75"
          material="color: #0a0a0a; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <a-cylinder position="1.5 0.37 0.5" radius="0.04" height="0.75"
          material="color: #0a0a0a; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <a-cylinder position="-1.5 0.37 -0.5" radius="0.04" height="0.75"
          material="color: #0a0a0a; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <a-cylinder position="1.5 0.37 -0.5" radius="0.04" height="0.75"
          material="color: #0a0a0a; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <!-- Keyboard tray (lower shelf) -->
        <a-box position="0 0.55 0.4" width="2.2" height="0.04" depth="0.4"
          material="color: #1a1a1a; metalness: 0.4; roughness: 0.6"></a-box>
      </a-entity>

      <!-- ═══ MIXING CONSOLE (on desk, center) ═══ -->
      <a-entity id="va-mixer" position="0 0.82 -2.2">
        <!-- Console body (angled top) -->
        <a-box position="0 0.08 0" width="1.4" height="0.05" depth="0.55"
          material="color: #1a1a1a; metalness: 0.5; roughness: 0.4"></a-box>
        <a-box position="0 0.12 -0.1" width="1.4" height="0.04" depth="0.35"
          material="color: #2a2a2a; metalness: 0.4; roughness: 0.3"
          rotation="-15 0 0"></a-box>
        <!-- Fader channels (8 faders) -->
        <a-box position="-0.6 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="-0.4 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="-0.2 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="0 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="0.2 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="0.4 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="0.6 0.13 0.1" width="0.05" height="0.02" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <!-- Fader knobs (indicator LEDs) -->
        <a-box position="-0.6 0.15 0.15" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="-0.4 0.15 0.18" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="-0.2 0.15 0.12" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="0 0.15 0.2" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="0.2 0.15 0.1" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="0.4 0.15 0.17" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <a-box position="0.6 0.15 0.14" width="0.08" height="0.03" depth="0.03"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-box>
        <!-- LCD display strip -->
        <a-box position="0 0.17 -0.18" width="1.2" height="0.01" depth="0.08"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5"></a-box>
        <!-- Master volume knob (big, right side) -->
        <a-cylinder position="0.55 0.2 -0.1" radius="0.06" height="0.08"
          material="color: #1a1a1a; metalness: 0.7; roughness: 0.2"></a-cylinder>
        <a-cylinder position="0.55 0.24 -0.1" radius="0.055" height="0.005"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.4"></a-cylinder>
      </a-entity>

      <!-- ═══ DJ TURNTABLE (left of mixer) ═══ -->
      <a-entity id="va-turntable" position="-1.2 0.82 -2">
        <!-- Base (rectangular, heavy-looking) -->
        <a-box position="0 0.04 0" width="0.55" height="0.08" depth="0.5"
          material="color: #1a1a1a; metalness: 0.4; roughness: 0.4"></a-box>
        <!-- Platter (circular, rotates) -->
        <a-cylinder position="0 0.09 0" radius="0.22" height="0.02"
          material="color: #0a0a0a; metalness: 0.7; roughness: 0.2"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 2000; easing: linear"></a-cylinder>
        <!-- Slipmat (purple branded) -->
        <a-cylinder position="0 0.105 0" radius="0.2" height="0.003"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.15"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 2000; easing: linear"></a-cylinder>
        <!-- Center spindle -->
        <a-cylinder position="0 0.12 0" radius="0.012" height="0.04"
          material="color: #888; metalness: 0.9; roughness: 0.1"></a-cylinder>
        <!-- Tonearm (hinged cylindrical arm with cartridge) -->
        <a-cylinder position="0.18 0.09 -0.18" radius="0.015" height="0.04"
          material="color: #c0c0c0; metalness: 0.8"></a-cylinder>
        <a-box position="0.08 0.11 -0.08" width="0.22" height="0.015" depth="0.015"
          rotation="0 -35 5"
          material="color: #888; metalness: 0.7"></a-box>
        <a-box position="0.03 0.11 -0.04" width="0.03" height="0.02" depth="0.025"
          material="color: #1a1a1a; metalness: 0.5"></a-box>
        <!-- Control buttons (Start/Stop/Speed) -->
        <a-circle position="-0.22 0.081 0.1" rotation="-90 0 0" radius="0.015"
          material="color: #00e060; emissive: #00e060; emissiveIntensity: 0.6"></a-circle>
        <a-circle position="-0.22 0.081 0" rotation="-90 0 0" radius="0.015"
          material="color: #e02020; emissive: #e02020; emissiveIntensity: 0.6"></a-circle>
      </a-entity>

      <!-- ═══ MPC DRUM MACHINE (right of mixer) ═══ -->
      <a-entity id="va-mpc" position="1.2 0.82 -2">
        <!-- Body -->
        <a-box position="0 0.04 0" width="0.5" height="0.08" depth="0.45"
          material="color: #1a1a1a; metalness: 0.5; roughness: 0.4"></a-box>
        <!-- LCD screen -->
        <a-box position="0 0.085 -0.15" width="0.3" height="0.01" depth="0.1"
          material="color: #00b060; emissive: #00b060; emissiveIntensity: 0.5"></a-box>
        <!-- 4x4 pad grid (signature MPC look) -->
        ${[0,1,2,3].map(row =>
          [0,1,2,3].map(col => `
            <a-box position="${-0.135 + col*0.09} 0.085 ${-0.02 + row*0.08}"
              width="0.075" height="0.008" depth="0.065"
              material="color: #3a3a3a; metalness: 0.4; roughness: 0.3; emissive: ${Math.random() > 0.7 ? '#c09060' : '#000'}; emissiveIntensity: 0.2"></a-box>
          `).join('')
        ).join('')}
        <!-- Jog wheel (big, right side) -->
        <a-cylinder position="0.18 0.09 -0.05" radius="0.05" height="0.01"
          material="color: #2a2a2a; metalness: 0.5"></a-cylinder>
        <a-cylinder position="0.18 0.095 -0.05" radius="0.02" height="0.005"
          material="color: #c09060; emissive: #c09060; emissiveIntensity: 0.3"></a-cylinder>
      </a-entity>

      <!-- ═══ STUDIO HEADPHONES (CLICKABLE) ═══ -->
      <a-entity id="va-headphones" position="1.6 1.0 -1.5" class="clickable"
        music-player="track: ; label: Stream Verse Alkemist; color: #a060e0"
        interactive-panel="type: music; label: Listen to Verse Alkemist; color: #a060e0">
        <!-- Headband (curved top) -->
        <a-torus position="0 0.18 0" radius="0.15" radius-tubular="0.02"
          rotation="90 0 0" arc="180"
          material="color: #0a0a0a; metalness: 0.5; roughness: 0.4"></a-torus>
        <!-- Headband cushion -->
        <a-box position="0 0.32 0" width="0.22" height="0.025" depth="0.05"
          material="color: #1a1a1a; roughness: 0.8"></a-box>
        <!-- Left cup -->
        <a-entity position="-0.14 0.12 0">
          <a-cylinder radius="0.07" height="0.06" rotation="0 0 90"
            material="color: #0a0a0a; metalness: 0.5; roughness: 0.4"></a-cylinder>
          <!-- Ear pad -->
          <a-torus position="-0.035 0 0" radius="0.06" radius-tubular="0.018"
            rotation="0 90 0"
            material="color: #1a1a1a; roughness: 0.9"></a-torus>
          <!-- Logo ring -->
          <a-torus position="0.035 0 0" radius="0.045" radius-tubular="0.004"
            rotation="0 90 0"
            material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5"></a-torus>
        </a-entity>
        <!-- Right cup -->
        <a-entity position="0.14 0.12 0">
          <a-cylinder radius="0.07" height="0.06" rotation="0 0 90"
            material="color: #0a0a0a; metalness: 0.5; roughness: 0.4"></a-cylinder>
          <a-torus position="0.035 0 0" radius="0.06" radius-tubular="0.018"
            rotation="0 90 0"
            material="color: #1a1a1a; roughness: 0.9"></a-torus>
          <a-torus position="-0.035 0 0" radius="0.045" radius-tubular="0.004"
            rotation="0 90 0"
            material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5"></a-torus>
        </a-entity>
        <!-- Glow ring on floor indicating interactivity -->
        <a-ring position="0 -1.0 0" rotation="-90 0 0" radius-inner="0.15" radius-outer="0.25"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.5; opacity: 0.35; transparent: true"
          animation="property: rotation.z; to: 360; loop: true; dur: 8000; easing: linear"></a-ring>
      </a-entity>

      <!-- ═══ CONDENSER MIC (on desk, angled toward vocal position) ═══ -->
      <a-entity id="va-mic" position="0 0.82 -1.5" rotation="0 15 0">
        <!-- Shock mount base -->
        <a-cylinder position="0 0.02 0" radius="0.05" height="0.04"
          material="color: #2a2a2a; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <!-- Boom arm -->
        <a-cylinder position="0 0.35 0" radius="0.015" height="0.7"
          material="color: #333; metalness: 0.6; roughness: 0.3"></a-cylinder>
        <!-- Arm pivot (visible hinge) -->
        <a-sphere position="0 0.7 0" radius="0.025"
          material="color: #444; metalness: 0.7"></a-sphere>
        <!-- Angled upper arm toward mic -->
        <a-box position="0.08 0.76 0.02" width="0.2" height="0.02" depth="0.02"
          rotation="0 0 -25"
          material="color: #333; metalness: 0.6"></a-box>
        <!-- Shock mount cradle -->
        <a-torus position="0.18 0.86 0" radius="0.05" radius-tubular="0.008"
          rotation="0 90 0"
          material="color: #666; metalness: 0.8"></a-torus>
        <!-- Mic body (cylindrical, large diaphragm) -->
        <a-cylinder position="0.18 0.86 0" radius="0.035" height="0.14" rotation="0 0 90"
          material="color: #1a1a1a; metalness: 0.5; roughness: 0.3"></a-cylinder>
        <!-- Mic head grille (chromed mesh look) -->
        <a-sphere position="0.25 0.86 0" radius="0.04"
          material="color: #888; metalness: 0.9; roughness: 0.2; wireframe: false"></a-sphere>
        <!-- Mic LED indicator -->
        <a-cylinder position="0.2 0.93 0" radius="0.005" height="0.003"
          material="color: #e02020; emissive: #e02020; emissiveIntensity: 0.8"></a-cylinder>
        <!-- Pop filter (circular mesh in front) -->
        <a-circle position="0.38 0.86 0" rotation="0 90 0" radius="0.08"
          material="color: #1a1a1a; opacity: 0.35; transparent: true; side: double"></a-circle>
        <a-torus position="0.38 0.86 0" rotation="0 90 0" radius="0.08" radius-tubular="0.004"
          material="color: #333; metalness: 0.5"></a-torus>
        <!-- Pop filter gooseneck -->
        <a-cylinder position="0.32 0.86 0" radius="0.008" height="0.12" rotation="0 0 90"
          material="color: #333; metalness: 0.5"></a-cylinder>
      </a-entity>

      <!-- ═══ STUDIO MONITOR SPEAKERS (L+R, angled toward listening position) ═══ -->
      <!-- LEFT monitor -->
      <a-entity id="va-monitor-l" position="-1.8 0.92 -2.4" rotation="0 25 0">
        <!-- Body (tapered rectangular) -->
        <a-box position="0 0.15 0" width="0.28" height="0.42" depth="0.3"
          material="color: #0a0a0a; metalness: 0.3; roughness: 0.5"></a-box>
        <!-- Front baffle (slightly darker) -->
        <a-box position="0 0.15 0.151" width="0.26" height="0.4" depth="0.01"
          material="color: #050505; roughness: 0.7"></a-box>
        <!-- Woofer (main speaker) -->
        <a-circle position="0 0.07 0.157" radius="0.09"
          material="color: #1a1a1a; metalness: 0.2"></a-circle>
        <a-circle position="0 0.07 0.158" radius="0.035"
          material="color: #2a2a2a; metalness: 0.3"></a-circle>
        <!-- Dust cap -->
        <a-sphere position="0 0.07 0.17" radius="0.025"
          material="color: #333; metalness: 0.4"></a-sphere>
        <!-- Tweeter -->
        <a-circle position="0 0.27 0.157" radius="0.04"
          material="color: #222; metalness: 0.4"></a-circle>
        <a-circle position="0 0.27 0.158" radius="0.02"
          material="color: #444; metalness: 0.5"></a-circle>
        <!-- Power LED -->
        <a-cylinder position="0.11 0.33 0.158" radius="0.005" height="0.003"
          material="color: #60ff00; emissive: #60ff00; emissiveIntensity: 0.9"></a-cylinder>
        <!-- Brand strip -->
        <a-box position="0 -0.045 0.158" width="0.18" height="0.015" depth="0.002"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.3"></a-box>
        <!-- Speaker stand -->
        <a-cylinder position="0 -0.15 0" radius="0.05" height="0.3"
          material="color: #0a0a0a; metalness: 0.4"></a-cylinder>
      </a-entity>
      <!-- RIGHT monitor -->
      <a-entity id="va-monitor-r" position="1.8 0.92 -2.4" rotation="0 -25 0">
        <a-box position="0 0.15 0" width="0.28" height="0.42" depth="0.3"
          material="color: #0a0a0a; metalness: 0.3; roughness: 0.5"></a-box>
        <a-box position="0 0.15 0.151" width="0.26" height="0.4" depth="0.01"
          material="color: #050505; roughness: 0.7"></a-box>
        <a-circle position="0 0.07 0.157" radius="0.09"
          material="color: #1a1a1a; metalness: 0.2"></a-circle>
        <a-circle position="0 0.07 0.158" radius="0.035"
          material="color: #2a2a2a; metalness: 0.3"></a-circle>
        <a-sphere position="0 0.07 0.17" radius="0.025"
          material="color: #333; metalness: 0.4"></a-sphere>
        <a-circle position="0 0.27 0.157" radius="0.04"
          material="color: #222; metalness: 0.4"></a-circle>
        <a-circle position="0 0.27 0.158" radius="0.02"
          material="color: #444; metalness: 0.5"></a-circle>
        <a-cylinder position="0.11 0.33 0.158" radius="0.005" height="0.003"
          material="color: #60ff00; emissive: #60ff00; emissiveIntensity: 0.9"></a-cylinder>
        <a-box position="0 -0.045 0.158" width="0.18" height="0.015" depth="0.002"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.3"></a-box>
        <a-cylinder position="0 -0.15 0" radius="0.05" height="0.3"
          material="color: #0a0a0a; metalness: 0.4"></a-cylinder>
      </a-entity>

      <!-- ═══ FLOOR SUBWOOFER (under desk) ═══ -->
      <a-entity id="va-sub" position="0 0 -1.5">
        <a-box position="0 0.2 0" width="0.5" height="0.4" depth="0.5"
          material="color: #0a0a0a; metalness: 0.3; roughness: 0.5"></a-box>
        <a-circle position="0 0.2 0.251" radius="0.18"
          material="color: #1a1a1a; metalness: 0.3"></a-circle>
        <a-circle position="0 0.2 0.252" radius="0.08"
          material="color: #333; metalness: 0.4"></a-circle>
        <a-cylinder position="0.2 0.36 0.251" radius="0.005" height="0.003"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.7"></a-cylinder>
      </a-entity>

      <!-- ═══ VINYL CRATE (CLICKABLE → releases) ═══ -->
      <a-entity id="va-vinyl-crate" position="-2.5 0 -1.5" class="clickable"
        interactive-panel="type: music; label: Browse Releases; color: #a060e0">
        <!-- Wooden crate -->
        <a-box position="0 0.25 0" width="0.45" height="0.5" depth="0.45"
          material="color: #3a2a1a; roughness: 0.8"></a-box>
        <!-- Inner lip -->
        <a-box position="0 0.45 0" width="0.43" height="0.03" depth="0.43"
          material="color: #2a1a10; roughness: 0.9"></a-box>
        <!-- Vinyl records stacked inside (visible tops) -->
        <a-cylinder position="-0.08 0.5 0" radius="0.18" height="0.015"
          material="color: #111; metalness: 0.5"></a-cylinder>
        <a-cylinder position="-0.04 0.515 0" radius="0.18" height="0.015"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.15"></a-cylinder>
        <a-cylinder position="0 0.53 0" radius="0.18" height="0.015"
          material="color: #e0d000; emissive: #e0d000; emissiveIntensity: 0.1"></a-cylinder>
        <a-cylinder position="0.04 0.545 0" radius="0.18" height="0.015"
          material="color: #111; metalness: 0.5"></a-cylinder>
        <a-cylinder position="0.08 0.56 0" radius="0.18" height="0.015"
          material="color: #c94060; emissive: #c94060; emissiveIntensity: 0.1"></a-cylinder>
        <!-- Vinyl label on top record -->
        <a-cylinder position="0.08 0.568 0" radius="0.055" height="0.001"
          material="color: #fff"></a-cylinder>
        <!-- Glow hint -->
        <a-ring position="0 0.01 0" rotation="-90 0 0" radius-inner="0.3" radius-outer="0.4"
          material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.4; opacity: 0.3; transparent: true"></a-ring>
      </a-entity>

      <!-- ═══ STUDIO CHAIR ═══ -->
      <a-entity id="va-chair" position="0 0 -0.8">
        <!-- Seat -->
        <a-cylinder position="0 0.5 0" radius="0.28" height="0.08"
          material="color: #0a0a0a; roughness: 0.7"></a-cylinder>
        <!-- Backrest -->
        <a-box position="0 0.85 -0.23" width="0.5" height="0.6" depth="0.08"
          material="color: #0a0a0a; roughness: 0.7"
          rotation="-10 0 0"></a-box>
        <!-- Armrests -->
        <a-box position="-0.28 0.65 -0.05" width="0.04" height="0.2" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="0.28 0.65 -0.05" width="0.04" height="0.2" depth="0.25"
          material="color: #0a0a0a"></a-box>
        <a-box position="-0.28 0.78 -0.05" width="0.08" height="0.03" depth="0.25"
          material="color: #1a1a1a; roughness: 0.8"></a-box>
        <a-box position="0.28 0.78 -0.05" width="0.08" height="0.03" depth="0.25"
          material="color: #1a1a1a; roughness: 0.8"></a-box>
        <!-- Central column -->
        <a-cylinder position="0 0.3 0" radius="0.04" height="0.4"
          material="color: #333; metalness: 0.6"></a-cylinder>
        <!-- 5-star base -->
        <a-cylinder position="0 0.08 0" radius="0.25" height="0.05"
          material="color: #1a1a1a; metalness: 0.5"></a-cylinder>
        <!-- Wheels -->
        <a-sphere position="0.22 0.03 0" radius="0.03" material="color: #222"></a-sphere>
        <a-sphere position="-0.22 0.03 0" radius="0.03" material="color: #222"></a-sphere>
        <a-sphere position="0 0.03 0.22" radius="0.03" material="color: #222"></a-sphere>
        <a-sphere position="0 0.03 -0.22" radius="0.03" material="color: #222"></a-sphere>
      </a-entity>

      <!-- ═══ AMBIENT STUDIO LIGHTING ═══ -->
      <!-- Purple backlight behind desk -->
      <a-entity light="type: point; color: #a060e0; intensity: 1.5; distance: 6; decay: 1.5"
        position="0 2 -4"></a-entity>
      <!-- Warm key light from above -->
      <a-entity light="type: point; color: #fff2d8; intensity: 0.8; distance: 5; decay: 1.5"
        position="0 3 -1.5"></a-entity>
      <!-- Purple accent on floor -->
      <a-entity light="type: point; color: #a060e0; intensity: 0.6; distance: 4; decay: 2"
        position="0 0.3 -2"></a-entity>

      <!-- ═══ FLOOR LED STRIPS ═══ -->
      <a-box position="-3 0.02 -1" width="0.05" height="0.02" depth="4"
        material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.8"></a-box>
      <a-box position="3 0.02 -1" width="0.05" height="0.02" depth="4"
        material="color: #a060e0; emissive: #a060e0; emissiveIntensity: 0.8"></a-box>
    `;
  },

  wireInteractions() {
    // If music-player component is available, wire up the headphones + crate
    const hp = document.getElementById('va-headphones');
    const crate = document.getElementById('va-vinyl-crate');

    [hp, crate].forEach(el => {
      if (!el) return;
      el.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
      });
      el.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
      });
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  VerseAlkemistStudio.init();
});

window.VerseAlkemistStudio = VerseAlkemistStudio;
