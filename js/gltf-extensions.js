/* ═══════════════════════════════════════════════════════════════
   GLTFLoader extension registration

   Optimized GLBs (output of tools/optimize-glbs.js) use:
     - EXT_meshopt_compression  (mesh compression, ~50% size cut)
     - EXT_texture_webp         (WebP textures, ~75% size cut)
     - KHR_mesh_quantization    (smaller vertex attributes)

   A-Frame's bundled three.js GLTFLoader supports KHR_mesh_quantization
   natively, but EXT_meshopt_compression requires registering the
   Meshopt decoder explicitly. WebP loads fine in modern browsers but
   needs the EXT_texture_webp plugin.

   Without this file: optimized GLBs load but render as INVISIBLE
   (geometry decode fails silently, scene appears empty).

   This file must load AFTER A-Frame and BEFORE any code that calls
   gltf-model. In index.html / per-room scenes, place after aframe-
   extras and before custom prop loaders.

   Background: this is a known gotcha — A-Frame doesn't auto-register
   optional GLTFLoader extensions because most apps don't need them,
   and the decoders are non-trivial in size (Meshopt WASM ~80KB).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Wait until A-Frame and THREE are available
  function init() {
    if (!window.AFRAME || !window.THREE) {
      // A-Frame loads asynchronously — retry shortly
      return setTimeout(init, 50);
    }

    // Dynamically import the Meshopt decoder. Using the CDN-hosted UMD
    // build means we don't have to add a build step or bundle anything.
    const meshoptScript = document.createElement('script');
    meshoptScript.src = 'https://cdn.jsdelivr.net/npm/meshoptimizer@0.20.0/meshopt_decoder.js';
    meshoptScript.onload = () => {
      if (!window.MeshoptDecoder) {
        console.error('[GLTFExt] MeshoptDecoder failed to load — optimized GLBs will not render');
        return;
      }

      // Patch the global GLTFLoader prototype so EVERY new loader
      // instance (including A-Frame's internal one for gltf-model)
      // gets the Meshopt decoder for free.
      const origLoad = THREE.GLTFLoader.prototype.load;
      THREE.GLTFLoader.prototype.load = function (...args) {
        // Idempotent: only set if not already set
        if (!this.meshoptDecoder) {
          this.setMeshoptDecoder(window.MeshoptDecoder);
        }
        return origLoad.apply(this, args);
      };

      console.log('[GLTFExt] ✓ Meshopt decoder registered');
    };
    meshoptScript.onerror = () => {
      console.error('[GLTFExt] Failed to load Meshopt decoder from CDN');
    };
    document.head.appendChild(meshoptScript);
  }

  init();
})();
