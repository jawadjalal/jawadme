# Loader B words

Four real Arabic words, written without vowel marks, each drawn as one shaped run (never as separate letters). They arrive one or two at a time, then تصميم comes apart into sparks that gather into the name. The Captain approved the list; Jawad can still object.

| Arabic | Transliteration | English | Why it is here |
| --- | --- | --- | --- |
| ضياء | ḍiyāʾ | radiance, glow | the light the sparks give off |
| نور | nūr | light | the plain word for light |
| خط | khaṭṭ | line, stroke; also calligraphy | the mark is lettering; "khatt" is also the word for the art of writing |
| تصميم | taṣmīm | design | the last word to arrive, and the one the mark means |

First visit shows all four in this order: ضياء، نور، خط, a beat of black, then تصميم. A repeat visit shows ضياء, a beat of black, then تصميم.
Font: Aref Ruqaa Bold (SIL OFL 1.1, aliftype), subset to these four words with its init/medi/fina/calt shaping kept (9.8 KB).

## Swapping a word
The words live in one array, `WORD_AR` at the top of `LoaderB.tsx`. Change an entry, update the table above, then rebuild the font:

```
pip install fonttools brotli
node src/components/loader/subset-font.mjs
```

The script reads `WORD_AR` from the component, downloads Aref Ruqaa Bold, subsets it with the shaping features kept, writes `aref-ruqaa-b.woff2` and fails if it passes 25 KB. Check a new word's shaping in the browser before shipping it.
