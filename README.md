# jawadjalal.com

Personal site. Next.js 15, React 19, Tailwind 3, TypeScript.

## Running it

```bash
npm install
npm run dev
```

## Where things are

| You want to change | Edit |
|---|---|
| Any word on the page | `src/lib/profile.ts` |
| Colours, type, the ruled column | `src/app/globals.css` |
| The icon set | `src/components/Icon.tsx` |
| Page structure | `src/app/page.tsx` |

Everything the page says lives in `src/lib/profile.ts`. The page, the share
card and the JSON-LD all read from it, so there is one place to change a fact
and no way for those three to disagree.

## The pieces with behaviour

- **`Streamed.tsx`** types a block out when you scroll to it. The text is
  server-rendered in full and this replays over it, so crawlers, no-JS readers
  and reduced-motion readers get the finished paragraph. Un-typed characters
  are `visibility: hidden` rather than sliced out, which keeps the paragraph
  its finished height and keeps the IntersectionObserver able to see it.
- **`prose.tsx`** parses `:icon:` and `:icon:{phrase}` tokens out of the copy
  in `profile.ts`. A phrase gets a tinted ground and its glyph; the words stay
  in the page's ordinary ink. Five hues, one per icon, assigned in that file.
- **`Preview.tsx`** is the hover card. Every screenshot is a local file listed
  in `profile.ts`, never a fetch of a caller-supplied URL.
- **`Cursor.tsx`**, **`DotField.tsx`**, **`Rotator.tsx`** are the pointer, the
  dot band and the rotating title. All three no-op on touch or reduced motion.

## House style

No em dashes. A comma, a full stop or a colon does the job.

## Outstanding

`public/logos/nooli.png` and `public/design/nooli.png` are placeholders.
Drop the real Nooli logo in at both paths (40px square is enough for the
logo; the design one is the hover card, so 1200x630 reads best).
