/* ═══════════════════════════════════════════════════════════════════
   TRU SKOOL MALL — Legacy Loader Shim

   environment-upgrade.js and model-placer.js predate the store-rooms.js
   system and spawn duplicate GLBs at old primitive positions. Rather
   than deleting them (and losing their material/PBR tweaks), this shim
   runs FIRST and neutralizes the parts that conflict with store-rooms.

   What it does:
   - Overrides EnvironmentUpgrade.loadAvailableModels   → no-op
   - Overrides ModelPlacer.init                          → no-op
   - Keeps PBR materials, tone mapping, env maps        → still run
   - Keeps the doorway-signs component                  → still run

   Load order in index.html:
     <script src="js/environment-upgrade.js"></script>
     <script src="js/model-placer.js"></script>
     <script src="js/store-rooms.js"></script>
     <script src="js/mall-tuner.js"></script>
     <script src="js/doorway-signs.js"></script>
     <script src="js/legacy-shim.js"></script>   <-- add this LAST
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  function log(msg) { console.log('[LegacyShim] ' + msg); }

  function neutralize() {
    // ─── 1. Block EnvironmentUpgrade from spawning store GLBs ───
    if (window.EnvironmentUpgrade) {
      window.EnvironmentUpgrade.loadAvailableModels = function () {
        log('loadAvailableModels blocked (handled by store-rooms.js)');
      };
      window.EnvironmentUpgrade.addReflectiveFloor = function () {
        log('addReflectiveFloor blocked (was creating visual noise on marble)');
      };
    }

    // ─── 2. Block ModelPlacer entirely ───
    if (window.ModelPlacer) {
      window.ModelPlacer.init = function () {
        log('ModelPlacer.init blocked (handled by store-rooms.js)');
      };
      window.ModelPlacer.tryLoadFurniture = function () {};
    }

    // ─── 3. Clean up anything already spawned by legacy loaders ───
    // These have id patterns that identify them. Remove any entity whose
    // id starts with "model-" (EnvironmentUpgrade.loadAvailableModels) and
    // any top-level <a-entity> with gltf-model pointing to files we know
    // are store rooms.
    var removed = 0;
    var scene = document.querySelector('a-scene');
    if (!scene) return;

    // EnvironmentUpgrade tags entities as id="model-<key>"
    Array.prototype.forEach.call(
      document.querySelectorAll('[id^="model-"]'),
      function (el) {
        el.parentNode && el.parentNode.removeChild(el);
        removed++;
      }
    );

    // Legacy store-*.glb direct placements
    var legacySrcs = [
      'assets/models/store-concrete-rose.glb',
      'assets/models/store-bijadi.glb',
      'assets/models/store-ff.glb',
      'assets/models/store-hoe.glb',
      'assets/models/store-wanderlust.glb',
      'assets/models/store-cafe.glb',
      'assets/models/store-verse.glb',
      // ModelPlacer top-level furniture that should now live inside GLB rooms:
      'assets/models/turntable.glb',
      'assets/models/globe.glb',
    ];
    Array.prototype.forEach.call(scene.children, function (el) {
      if (!el.getAttribute) return;
      var src = el.getAttribute('gltf-model');
      if (src && legacySrcs.indexOf(src) !== -1) {
        // Don't touch entities inside store-room-container (those are live rooms)
        if (el.parentNode && el.parentNode.id === 'store-room-container') return;
        el.parentNode && el.parentNode.removeChild(el);
        removed++;
      }
    });

    log('Removed ' + removed + ' legacy-spawned entities');

    // Run again after a delay in case loaders fire late
    setTimeout(function () {
      var late = 0;
      Array.prototype.forEach.call(
        document.querySelectorAll('[id^="model-"]'),
        function (el) {
          el.parentNode && el.parentNode.removeChild(el);
          late++;
        }
      );
      if (late) log('Removed ' + late + ' late legacy entities');
    }, 5000);
  }

  function boot() {
    neutralize();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
