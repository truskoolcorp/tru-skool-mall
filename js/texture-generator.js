/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Static Texture Loader
   Textures are pre-generated JPG files in assets/textures/.
   This module verifies they loaded and provides helpers.
   ═══════════════════════════════════════════════════════════ */

const TextureGen = {
  _ready: false,

  init() {
    var ids = ['tex-marble','tex-concrete','tex-wood-dark','tex-wood-light','tex-carpet','tex-leather','tex-metal','tex-plaster'];
    var loaded = 0;
    ids.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) loaded++;
    });
    this._ready = true;
    console.log('[TextureGen] ' + loaded + '/' + ids.length + ' static textures available');
  }
};

document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    var start = function() { setTimeout(function() { TextureGen.init(); }, 2000); };
    if (scene.hasLoaded) start();
    else scene.addEventListener('loaded', start);
  }
});

window.TextureGen = TextureGen;
