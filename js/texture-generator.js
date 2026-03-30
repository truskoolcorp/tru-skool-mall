/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Procedural Texture Generator
   Creates realistic textures via Canvas API.
   No external downloads — everything generated at runtime.
   ═══════════════════════════════════════════════════════════ */

const TextureGen = {

  textures: {},
  _ready: false,

  init() {
    // Generate all textures as Three.js CanvasTextures
    this.genTex('floor-marble',   512, 512, this.drawMarble);
    this.genTex('floor-tile',     512, 512, this.drawTile);
    this.genTex('wall-concrete',  512, 512, this.drawConcrete);
    this.genTex('wall-plaster',   256, 256, this.drawPlaster);
    this.genTex('wood-dark',      256, 256, this.drawWoodDark);
    this.genTex('wood-light',     256, 256, this.drawWoodLight);
    this.genTex('metal-brushed',  256, 256, this.drawMetalBrushed);
    this.genTex('metal-gold',     256, 256, this.drawMetalGold);
    this.genTex('fabric-dark',    128, 128, this.drawFabricDark);
    this.genTex('leather-brown',  256, 256, this.drawLeather);
    this.genTex('carpet-dark',    256, 256, this.drawCarpet);
    this.genTex('glass-frosted',  128, 128, this.drawGlass);

    this._ready = true;
    console.log('[TextureGen] 12 procedural textures generated');

    // Apply to corridor after a short delay
    setTimeout(() => this.applyCorridorTextures(), 600);
  },

  genTex(id, w, h, drawFn) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    var ctx = c.getContext('2d');
    drawFn(ctx, w, h);

    // Three.js texture for direct application
    var tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    this.textures[id] = tex;

    // Also create an A-Frame asset image so src: #tex-... references work
    var img = document.createElement('img');
    img.id = 'tex-' + id;
    img.src = c.toDataURL('image/jpeg', 0.85);
    img.setAttribute('crossorigin', 'anonymous');
    var assets = document.querySelector('a-assets');
    if (!assets) {
      assets = document.createElement('a-assets');
      document.querySelector('a-scene').prepend(assets);
    }
    assets.appendChild(img);
  },

  // Apply a texture to an A-Frame element via Three.js
  applyTo(el, texId, repeatX, repeatY, opts) {
    if (!el || !this.textures[texId]) return;
    var mesh = el.getObject3D('mesh');
    if (!mesh) {
      // Retry after mesh is ready
      el.addEventListener('loaded', () => this.applyTo(el, texId, repeatX, repeatY, opts));
      return;
    }

    var tex = this.textures[texId].clone();
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX || 1, repeatY || 1);
    tex.needsUpdate = true;

    mesh.traverse(function(child) {
      if (child.isMesh && child.material) {
        child.material.map = tex;
        if (opts && opts.roughness !== undefined) child.material.roughness = opts.roughness;
        if (opts && opts.metalness !== undefined) child.material.metalness = opts.metalness;
        child.material.needsUpdate = true;
      }
    });
  },

  // ─── Apply textures to main corridor geometry ───
  applyCorridorTextures() {
    var self = this;

    // Floor — marble
    var floor = document.getElementById('corridor-floor');
    if (floor) self.applyTo(floor, 'floor-marble', 8, 16, { roughness: 0.3, metalness: 0.1 });

    // Ceiling — plaster
    var ceiling = document.getElementById('corridor-ceiling');
    if (ceiling) self.applyTo(ceiling, 'wall-plaster', 4, 8, { roughness: 0.9, metalness: 0.05 });

    // Walls — concrete
    document.querySelectorAll('.corridor-wall').forEach(function(wall) {
      self.applyTo(wall, 'wall-concrete', 4, 2, { roughness: 0.8, metalness: 0.05 });
    });

    console.log('[TextureGen] Textures applied to corridor');
  },

  // ─── MARBLE (white with grey veins) ───
  drawMarble(ctx, w, h) {
    // Base
    ctx.fillStyle = '#e8e0d8';
    ctx.fillRect(0, 0, w, h);
    // Veins
    ctx.strokeStyle = 'rgba(160,150,140,0.3)';
    ctx.lineWidth = 1.5;
    for (var i = 0; i < 30; i++) {
      ctx.beginPath();
      var x = Math.random() * w;
      var y = Math.random() * h;
      ctx.moveTo(x, y);
      for (var j = 0; j < 6; j++) {
        x += (Math.random() - 0.5) * 80;
        y += (Math.random() - 0.5) * 80;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    // Subtle noise
    for (var px = 0; px < 2000; px++) {
      var v = 200 + Math.random() * 40;
      ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v-10) + ',0.15)';
      ctx.fillRect(Math.random()*w, Math.random()*h, 3, 3);
    }
    // Grid lines (tile gaps)
    ctx.strokeStyle = 'rgba(180,170,160,0.4)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx < w; gx += w/4) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (var gy = 0; gy < h; gy += h/4) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
  },

  // ─── TILE (dark geometric floor) ───
  drawTile(ctx, w, h) {
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(0, 0, w, h);
    var ts = w / 8;
    for (var tx = 0; tx < 8; tx++) {
      for (var ty = 0; ty < 8; ty++) {
        var shade = ((tx + ty) % 2 === 0) ? '#22222a' : '#1a1a22';
        ctx.fillStyle = shade;
        ctx.fillRect(tx*ts + 1, ty*ts + 1, ts - 2, ts - 2);
      }
    }
    ctx.strokeStyle = 'rgba(200,180,140,0.08)';
    ctx.lineWidth = 1;
    for (var gx = 0; gx <= w; gx += ts) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
    }
    for (var gy = 0; gy <= h; gy += ts) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
    }
  },

  // ─── CONCRETE (industrial wall) ───
  drawConcrete(ctx, w, h) {
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, 0, w, h);
    // Noise grain
    for (var i = 0; i < 8000; i++) {
      var v = 30 + Math.random() * 30;
      ctx.fillStyle = 'rgba(' + v + ',' + v + ',' + (v+5) + ',0.3)';
      ctx.fillRect(Math.random()*w, Math.random()*h, 2 + Math.random()*3, 2 + Math.random()*3);
    }
    // Subtle stains
    for (var s = 0; s < 5; s++) {
      var grad = ctx.createRadialGradient(
        Math.random()*w, Math.random()*h, 0,
        Math.random()*w, Math.random()*h, 60 + Math.random()*80
      );
      grad.addColorStop(0, 'rgba(40,35,30,0.2)');
      grad.addColorStop(1, 'rgba(40,35,30,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }
  },

  // ─── PLASTER (smooth wall) ───
  drawPlaster(ctx, w, h) {
    ctx.fillStyle = '#28262e';
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < 3000; i++) {
      var v = 35 + Math.random() * 15;
      ctx.fillStyle = 'rgba(' + v + ',' + (v-2) + ',' + (v+3) + ',0.15)';
      ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
    }
  },

  // ─── DARK WOOD ───
  drawWoodDark(ctx, w, h) {
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#2a1810');
    grad.addColorStop(0.3, '#3a2218');
    grad.addColorStop(0.7, '#2a1810');
    grad.addColorStop(1, '#3a2218');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Wood grain
    ctx.strokeStyle = 'rgba(60,40,20,0.3)';
    ctx.lineWidth = 0.5;
    for (var y = 0; y < h; y += 3 + Math.random()*4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (var x = 0; x < w; x += 10) {
        ctx.lineTo(x, y + (Math.random()-0.5)*2);
      }
      ctx.stroke();
    }
  },

  // ─── LIGHT WOOD ───
  drawWoodLight(ctx, w, h) {
    var grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#b89870');
    grad.addColorStop(0.5, '#c8a880');
    grad.addColorStop(1, '#b89870');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(150,120,80,0.3)';
    ctx.lineWidth = 0.5;
    for (var y = 0; y < h; y += 2 + Math.random()*3) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (var x = 0; x < w; x += 8) {
        ctx.lineTo(x, y + (Math.random()-0.5)*1.5);
      }
      ctx.stroke();
    }
  },

  // ─── BRUSHED METAL ───
  drawMetalBrushed(ctx, w, h) {
    ctx.fillStyle = '#555560';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(120,120,130,0.15)';
    ctx.lineWidth = 0.5;
    for (var y = 0; y < h; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, y + (Math.random()-0.5)*0.5);
      ctx.lineTo(w, y + (Math.random()-0.5)*0.5);
      ctx.stroke();
    }
  },

  // ─── GOLD METAL ───
  drawMetalGold(ctx, w, h) {
    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c9a84c');
    grad.addColorStop(0.3, '#e8c870');
    grad.addColorStop(0.5, '#ddb858');
    grad.addColorStop(0.7, '#c9a84c');
    grad.addColorStop(1, '#a88838');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(200,180,100,0.2)';
    ctx.lineWidth = 0.3;
    for (var y = 0; y < h; y += 1) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  },

  // ─── DARK FABRIC ───
  drawFabricDark(ctx, w, h) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 2) {
      for (var x = 0; x < w; x += 2) {
        var v = 20 + Math.random() * 15;
        ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';
        ctx.fillRect(x, y, 2, 2);
      }
    }
  },

  // ─── LEATHER ───
  drawLeather(ctx, w, h) {
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < 5000; i++) {
      var v = 60 + Math.random() * 30;
      ctx.fillStyle = 'rgba(' + v + ',' + (v-15) + ',' + (v-25) + ',0.12)';
      var sz = 1 + Math.random() * 2;
      ctx.fillRect(Math.random()*w, Math.random()*h, sz, sz);
    }
  },

  // ─── CARPET ───
  drawCarpet(ctx, w, h) {
    ctx.fillStyle = '#1a1520';
    ctx.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 1) {
      for (var x = 0; x < w; x += 1) {
        var v = 20 + Math.random() * 12;
        ctx.fillStyle = 'rgb(' + v + ',' + (v-5) + ',' + (v+5) + ')';
        ctx.fillRect(x, y, 1, 1);
      }
    }
  },

  // ─── FROSTED GLASS ───
  drawGlass(ctx, w, h) {
    ctx.fillStyle = 'rgba(200,210,220,0.15)';
    ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < 1000; i++) {
      ctx.fillStyle = 'rgba(220,230,240,' + (Math.random()*0.08) + ')';
      ctx.fillRect(Math.random()*w, Math.random()*h, 3, 3);
    }
  },
};

// Auto-init
document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    var start = function() { setTimeout(function() { TextureGen.init(); }, 800); };
    if (scene.hasLoaded) start();
    else scene.addEventListener('loaded', start);
  }
});

window.TextureGen = TextureGen;
console.log('%c[Tru Skool Mall] Texture Generator loaded', 'color: #c9a84c');
