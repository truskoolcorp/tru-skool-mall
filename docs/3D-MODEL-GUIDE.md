# 3D Model Sourcing Guide for Tru Skool Mall

## Quick Start: Get the Mall Looking Photorealistic

### Option 1: Free Models from Sketchfab (Recommended)

Search for these on [sketchfab.com](https://sketchfab.com) with the filter "Downloadable" + "CC" license:

| What to Search | Where to Place | Notes |
|---|---|---|
| "mall interior corridor" | `assets/models/mall-corridor.glb` | Replace the entire box-based corridor |
| "clothing store interior" | `assets/models/store-concrete-rose.glb` etc. | One per store, or recolor the same model |
| "mannequin display" | `assets/models/mannequin.glb` | Place in clothing stores |
| "clothing rack metal" | `assets/models/clothing-rack.glb` | Faithfully Faded, Concrete Rose |
| "glass display case" | `assets/models/display-case.glb` | BiJaDi, H.O.E. |
| "coffee shop counter" | `assets/models/counter.glb` | Cafe Sativa |
| "cafe table chair" | `assets/models/cafe-table.glb` | Cafe Sativa |
| "speaker tower" | `assets/models/speaker.glb` | Verse Alkemist |
| "DJ turntable" | Use in Verse Alkemist store | Replace primitive booth |
| "globe world" | Wanderlust store | Replace primitive sphere |

### Download Steps:
1. Find model on Sketchfab
2. Click "Download 3D Model"
3. Choose **glTF** format (.glb preferred — single binary file)
4. Place in `assets/models/`
5. The `environment-upgrade.js` auto-loads any model file that exists

### Option 2: Poly Pizza (CC0, no attribution needed)
- https://poly.pizza
- Search similar terms
- Download as .glb

### Option 3: Ready Player Me (for character avatars)
- https://readyplayer.me
- Create avatars that look like Laviche, Ginger, and Ahnika
- Export as .glb
- Place as `assets/models/laviche.glb`, `ginger.glb`, `ahnika.glb`

### Option 4: Commission or Build in Blender
For fully custom photorealistic storefronts:
- Use Blender (free) to model custom interiors
- Export as .glb with textures baked in
- Target <5MB per store model for web performance

## File Size Guidelines

| Model Type | Target Size | Max Polygons |
|---|---|---|
| Full store interior | 2-5 MB | 50K-100K tris |
| Furniture (rack, table) | 200KB-1MB | 5K-20K tris |
| Character avatar | 1-3 MB | 20K-50K tris |
| Small props (mug, cap) | 50-200KB | 1K-5K tris |
| Full corridor | 5-10 MB | 100K-200K tris |

## How Models Load

The `environment-upgrade.js` module uses a `model-loader` component that:
1. Checks if the .glb file exists via a HEAD request
2. If found, loads and renders it at the specified position
3. If not found, silently falls back to the existing primitive geometry

This means you can add models one at a time — each one replaces its corresponding primitives automatically.

## Texture Tips for Web

- Use JPG textures (not PNG) for diffuse/color maps — smaller files
- Keep textures at 1024x1024 or 2048x2048 max
- Bake lighting into textures where possible (lightmaps)
- Use Draco compression: `gltf-pipeline -i model.gltf -o model.glb --draco.compressMeshes`

## Environment Map

For realistic reflections, add an HDR environment map:
1. Download a free HDRI from https://polyhaven.com/hdris (search "indoor" or "studio")
2. Convert to cubemap or equirectangular JPG
3. The `environment-upgrade.js` already sets up a basic procedural env map
4. For better results, load a real HDR in Three.js (advanced)
