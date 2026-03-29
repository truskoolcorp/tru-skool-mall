/* ═══════════════════════════════════════════════════════════
   TRU SKOOL MALL — Environment Upgrade
   PBR materials, environment mapping, GLTF model loading,
   reflective surfaces, post-processing
   ═══════════════════════════════════════════════════════════ */

const EnvironmentUpgrade = {

  // ─── Free GLTF model sources ───
  // Replace placeholder URLs with your own models from:
  //   - Sketchfab (sketchfab.com — search "mall interior", "clothing rack", "mannequin")
  //   - Poly Pizza (poly.pizza — free CC0 models)
  //   - Ready Player Me (for character avatars)
  //   - Blender (model your own storefronts)
  //
  // Model format: .glb (binary GLTF, smaller files)
  // Place files in assets/models/ and reference them below

  models: {
    // Mall structure
    'mall-corridor':     { url: 'assets/models/mall-corridor.glb',     scale: '1 1 1', pos: '0 0 -30' },
    // Store interiors
    'concrete-rose':     { url: 'assets/models/store-concrete-rose.glb', scale: '1 1 1', pos: '-10 0 -8' },
    'bijadi':            { url: 'assets/models/store-bijadi.glb',       scale: '1 1 1', pos: '10 0 -8' },
    'faithfully-faded':  { url: 'assets/models/store-ff.glb',           scale: '1 1 1', pos: '-10 0 -22' },
    'hoe':               { url: 'assets/models/store-hoe.glb',          scale: '1 1 1', pos: '10 0 -22' },
    'wanderlust':        { url: 'assets/models/store-wanderlust.glb',   scale: '1 1 1', pos: '-10 0 -38' },
    'cafe-sativa':       { url: 'assets/models/store-cafe.glb',         scale: '1 1 1', pos: '10 0 -38' },
    'verse-alkemist':    { url: 'assets/models/store-verse.glb',        scale: '1 1 1', pos: '0 0 -58' },
    // Furniture & props
    'mannequin':         { url: 'assets/models/mannequin.glb',          scale: '1 1 1' },
    'clothing-rack':     { url: 'assets/models/clothing-rack.glb',      scale: '1 1 1' },
    'display-case':      { url: 'assets/models/display-case.glb',       scale: '1 1 1' },
    'counter':           { url: 'assets/models/counter.glb',            scale: '1 1 1' },
    'cafe-table':        { url: 'assets/models/cafe-table.glb',         scale: '1 1 1' },
    'speaker-stack':     { url: 'assets/models/speaker.glb',            scale: '1 1 1' },
    // Characters
    'laviche-avatar':    { url: 'assets/models/laviche.glb',            scale: '1 1 1' },
    'ginger-avatar':     { url: 'assets/models/ginger.glb',             scale: '1 1 1' },
    'ahnika-avatar':     { url: 'assets/models/ahnika.glb',             scale: '1 1 1' },
  },

  // ─── Initialize ───
  init() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    this.registerComponents();
    this.upgradeMaterials(scene);
    this.addEnvironmentMap(scene);
    this.addReflectiveFloor(scene);
    this.loadAvailableModels(scene);
    this.addPostProcessing(scene);

    console.log('[Environment] Photorealistic upgrade initialized');
  },

  // ─── Register Custom A-Frame Components ───
  registerComponents() {
    // PBR material component with proper metalness/roughness
    if (!AFRAME.components['pbr-material']) {
      AFRAME.registerComponent('pbr-material', {
        schema: {
          color:     { type: 'color', default: '#ffffff' },
          metalness: { type: 'number', default: 0.0 },
          roughness: { type: 'number', default: 0.5 },
          emissive:  { type: 'color', default: '#000000' },
          emissiveIntensity: { type: 'number', default: 0 },
          envMapIntensity:   { type: 'number', default: 1.0 },
        },
        init: function() {
          const data = this.data;
          const mesh = this.el.getObject3D('mesh');
          if (!mesh) {
            this.el.addEventListener('model-loaded', () => this.applyMaterial());
            return;
          }
          this.applyMaterial();
        },
        applyMaterial: function() {
          const data = this.data;
          const mesh = this.el.getObject3D('mesh');
          if (!mesh) return;

          mesh.traverse(function(node) {
            if (node.isMesh && node.material) {
              node.material.color.set(data.color);
              node.material.metalness = data.metalness;
              node.material.roughness = data.roughness;
              node.material.emissive.set(data.emissive);
              node.material.emissiveIntensity = data.emissiveIntensity;
              node.material.envMapIntensity = data.envMapIntensity;
              node.material.needsUpdate = true;
            }
          });
        }
      });
    }

    // GLTF model loader with error handling
    if (!AFRAME.components['model-loader']) {
      AFRAME.registerComponent('model-loader', {
        schema: {
          src: { type: 'string' },
          scale: { type: 'vec3', default: { x: 1, y: 1, z: 1 } },
        },
        init: function() {
          var el = this.el;
          var src = this.data.src;
          var scale = this.data.scale;

          // Check if file exists first
          fetch(src, { method: 'HEAD' })
            .then(function(response) {
              if (response.ok) {
                el.setAttribute('gltf-model', src);
                el.setAttribute('scale', scale.x + ' ' + scale.y + ' ' + scale.z);
                console.log('[Model] Loaded:', src);
              } else {
                console.log('[Model] Not found (using primitives):', src);
              }
            })
            .catch(function() {
              console.log('[Model] Skipped:', src);
            });
        }
      });
    }
  },

  // ─── Upgrade Existing Materials to PBR ───
  upgradeMaterials(scene) {
    // Wait for scene to be fully loaded
    var self = this;
    var sceneEl = scene.object3D;

    setTimeout(function() {
      // Upgrade floor to polished marble look
      var floor = scene.querySelector('a-plane[position="0 0 -30"]');
      if (floor) {
        floor.setAttribute('material', {
          color: '#2a2a34',
          metalness: 0.15,
          roughness: 0.35,
          repeat: '15 40',
        });
      }

      // Upgrade ceiling
      var ceiling = scene.querySelector('a-plane[position="0 12 -30"]');
      if (ceiling) {
        ceiling.setAttribute('material', {
          color: '#181828',
          metalness: 0.1,
          roughness: 0.7,
        });
      }

      // Make gold accents more metallic
      scene.querySelectorAll('[material*="c9a84c"]').forEach(function(el) {
        var mat = el.getAttribute('material');
        if (mat) {
          el.setAttribute('material', Object.assign({}, mat, {
            metalness: 0.85,
            roughness: 0.15,
          }));
        }
      });

      // Make platinum/BiJaDi elements more reflective
      scene.querySelectorAll('[material*="e8d8c8"], [material*="d4c0a8"]').forEach(function(el) {
        var mat = el.getAttribute('material');
        if (mat) {
          el.setAttribute('material', Object.assign({}, mat, {
            metalness: 0.75,
            roughness: 0.2,
          }));
        }
      });

      console.log('[Environment] Materials upgraded to PBR');
    }, 2000);
  },

  // ─── Environment Map for Reflections ───
  addEnvironmentMap(scene) {
    // Create a simple cubemap-like environment using a gradient sky
    // This provides ambient reflections on metallic surfaces
    var sky = document.createElement('a-entity');
    sky.setAttribute('id', 'env-sky');

    // Use A-Frame environment component if available, otherwise gradient
    sky.innerHTML = '<a-gradient-sky material="shader: gradient; topColor: #0a0a18; bottomColor: #1a1a2a"></a-gradient-sky>';

    // Actually, let's use Three.js PMREMGenerator for proper reflections
    setTimeout(function() {
      var renderer = scene.renderer;
      var sceneObj = scene.object3D;

      if (renderer && typeof THREE !== 'undefined' && THREE.PMREMGenerator) {
        var pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();

        // Create a simple environment with colored lights
        var envScene = new THREE.Scene();
        envScene.background = new THREE.Color('#0a0a14');

        // Add colored lights to env scene for reflection color
        var light1 = new THREE.PointLight('#e8d0ff', 2, 100);
        light1.position.set(0, 10, 0);
        envScene.add(light1);

        var light2 = new THREE.PointLight('#c9a84c', 1, 50);
        light2.position.set(5, 5, 0);
        envScene.add(light2);

        var envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;

        // Apply to scene
        sceneObj.environment = envTexture;
        console.log('[Environment] Reflection environment map applied');

        pmremGenerator.dispose();
      }
    }, 3000);
  },

  // ─── Reflective Floor Overlay ───
  addReflectiveFloor(scene) {
    // Add a subtle reflective plane over the floor for a polished look
    var reflector = document.createElement('a-plane');
    reflector.setAttribute('position', '0 0.005 -30');
    reflector.setAttribute('rotation', '-90 0 0');
    reflector.setAttribute('width', '30');
    reflector.setAttribute('height', '80');
    reflector.setAttribute('material', {
      color: '#1a1a24',
      metalness: 0.3,
      roughness: 0.4,
      opacity: 0.15,
      transparent: true,
    });
    scene.appendChild(reflector);
  },

  // ─── Load Available GLTF Models ───
  loadAvailableModels(scene) {
    var self = this;

    // Check which models exist and load them
    Object.keys(this.models).forEach(function(key) {
      var model = self.models[key];
      if (!model.url || !model.pos) return;

      // Create entity with model-loader (it checks if file exists)
      var entity = document.createElement('a-entity');
      entity.setAttribute('id', 'model-' + key);
      entity.setAttribute('position', model.pos);
      entity.setAttribute('model-loader', {
        src: model.url,
        scale: model.scale || '1 1 1',
      });
      scene.appendChild(entity);
    });
  },

  // ─── Post-Processing Effects ───
  addPostProcessing(scene) {
    // Add bloom effect for emissive/neon elements
    setTimeout(function() {
      var renderer = scene.renderer;
      if (!renderer) return;

      // Enable tone mapping for HDR-like look
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      console.log('[Environment] Tone mapping enabled (ACES Filmic, exposure 1.2)');
    }, 2000);
  },

  // ─── Utility: Place a GLTF model at a position ───
  placeModel(modelUrl, position, rotation, scale) {
    var scene = document.querySelector('a-scene');
    if (!scene) return null;

    var entity = document.createElement('a-entity');
    entity.setAttribute('gltf-model', modelUrl);
    if (position) entity.setAttribute('position', position);
    if (rotation) entity.setAttribute('rotation', rotation);
    if (scale) entity.setAttribute('scale', scale);

    scene.appendChild(entity);
    return entity;
  },
};

// Auto-init after scene loads
document.addEventListener('DOMContentLoaded', function() {
  var scene = document.querySelector('a-scene');
  if (scene) {
    if (scene.hasLoaded) EnvironmentUpgrade.init();
    else scene.addEventListener('loaded', function() { EnvironmentUpgrade.init(); });
  }
});

window.EnvironmentUpgrade = EnvironmentUpgrade;
