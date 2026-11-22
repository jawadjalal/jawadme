# Licences: 3D assets in public/world

Every third-party input that ends up in a shipped 3D asset under `public/world/`, with its source and licence.

## pillar/waymarker.glb and pillar/lightmap.ktx2 (the footer waymarker, PBR)

Built headless in Blender (footer pillar take P2, "pbr-fit" export): painted albedo and normal maps as KTX2 (ETC1S/UASTC) in the GLB, meshopt geometry, and its light baked into lightmap.ktx2 (512², ETC1S) on the second UV set. All geometry is modelled procedurally: plinth, post, arms, plaques, lantern, brazier, candles and pomegranate; the flames are drawn at runtime by the site's shader flame. The only external inputs are the textures and icon outlines below. Nothing from Supergiant or Joyco is used or referenced. The lettering on the "book a call" and "email" arms is set in the site's own display face, Mastermind Display (src/fonts).

| Asset | Use | Source | Licence |
|---|---|---|---|
| ambientCG Wood035 (1K-JPG) | timber post, arms and plaque boards | https://ambientcg.com/view?id=Wood035 | CC0 1.0, https://docs.ambientcg.com/license/ |
| ambientCG Metal017 (1K-JPG) | bronze frames, collars, lantern, brazier; gilt inlays | https://ambientcg.com/view?id=Metal017 | CC0 1.0 |
| ambientCG Rock030 (1K-JPG) | stone plinth, rubble, candle wax, ground dirt | https://ambientcg.com/view?id=Rock030 | CC0 1.0 |
| ambientCG PavingStones070 (1K-JPG) | cobbles on the ground | https://ambientcg.com/view?id=PavingStones070 | CC0 1.0 |
| simple-icons 16.38.0: x, github, instagram, tiktok, youtube | carved icon inlays | https://cdn.jsdelivr.net/npm/simple-icons@16.38.0/icons/<slug>.svg | CC0 1.0. The marks remain their owners' trademarks. |

The textures were converted to greyscale, run through hand-set colour ramps and painted over in Blender.

Tools, none of which ship: Blender 5.2.4 (GPL; output not covered), @gltf-transform/cli 4.5.1 (MIT).

## basis/ (KTX2 transcoder)

basis_transcoder.js and basis_transcoder.wasm, copied from three.js 0.187.0 (three/examples/jsm/libs/basis), built from Binomial's basis_universal. three.js: MIT. basis_universal: Apache-2.0, https://github.com/BinomialLLC/basis_universal.

## flame/flame-16x96.webp

Frames of the site's own shader flame (src/components/world/kit/flame.ts), rendered and packed by the flipbook tools. No external inputs.
