# World texture slots

The home page's world (src/components/world/scene.ts) is fully procedural until a painted map lands here. To fill a
slot, put the file in this folder and name it in manifest.json (for example `"stone": "stone.webp"`). Empty slots
are `null` and are never requested.

| slot  | size        | what to paint |
|-------|-------------|---------------|
| stone | 1024 x 1024, tiling | warm worn marble/limestone, hand-painted brush texture, mid value; multiplies the column, arch and pediment colour |
| floor | 1024 x 1024, tiling | dark flagstone wash without grout lines (the grid is drawn in the shader), painterly variation |
| far   | 1024 x 1024, tiling | cold blue-grey stone for the far bank, lit by souls |
| sky   | 2048 x 896  | the underworld's vault behind everything: dark warm ink, faint distant ruins and cavern rock, no figures, original |

Original work only: nothing from Supergiant's games.
