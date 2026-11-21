# Licences: 3D assets in public/world

Every third-party input that ends up in a shipped 3D asset under `public/world/`, with its source and licence.

## pillar/waymarker.glb (the footer waymarker)

Built headless in Blender. All geometry is modelled procedurally: plinth, post, arms, plaques, lantern, brazier, candles and flames. The only external inputs are the textures and icon outlines below. Nothing from Supergiant or Joyco is used or referenced. The lettering on the "book a call" and "email" arms is set in the site's own display face, Mastermind Display (src/fonts).

| Asset | Use | Source | Licence |
|---|---|---|---|
| ambientCG Wood035 (1K-JPG) | post and arm boards | https://ambientcg.com/view?id=Wood035 | CC0 1.0, https://docs.ambientcg.com/license/ |
| ambientCG Metal017 (1K-JPG) | bronze frames, collars, lantern, brazier | https://ambientcg.com/view?id=Metal017 | CC0 1.0 |
| ambientCG Rock030 (1K-JPG) | stone plinth, rubble | https://ambientcg.com/view?id=Rock030 | CC0 1.0 |
| ambientCG PavingStones070 (1K-JPG) | cobbles on the ground | https://ambientcg.com/view?id=PavingStones070 | CC0 1.0 |
| simple-icons 16.38.0: x, github, instagram, tiktok, youtube | carved icon inlays | https://cdn.jsdelivr.net/npm/simple-icons@16.38.0/icons/<slug>.svg | CC0 1.0. The marks remain their owners' trademarks. |

The textures were converted to greyscale, run through hand-set colour ramps, and baked into one atlas.

Tools, none of which ship: Blender 5.2.4 (GPL; output not covered), @gltf-transform/cli 4.5.1 (MIT).
