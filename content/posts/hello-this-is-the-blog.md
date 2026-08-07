---
title: "Hello, this is the blog"
date: "2026-08-07"
summary: "A placeholder first post, written to prove the pipeline works. Real writing goes here later."
tags: ["meta", "placeholder"]
---

**This is a placeholder post.** It exists so the blog has something to render
while it is still being built — the words below are notes about the machinery,
not anybody's considered opinion on anything. It will be replaced by the first
real post.

## What this page is

`/writing` is a plain markdown blog bolted onto jawadOS. Posts live as files in
`content/posts/`, each one a markdown document with a small block of frontmatter
at the top:

```yaml
---
title: "Hello, this is the blog"
date: "2026-08-07"
summary: "One sentence for the index and the share card."
tags: ["meta"]
draft: false
---
```

The filename becomes the URL. Add a file, get a post — there is nothing else to
press.

## What it can render

Ordinary prose gets a comfortable measure and a proper heading scale. Inline
`code` sits in a tinted box, links [go somewhere](/) in the accent green, and
lists behave:

- Unordered lists, like this one.
- With more than one item, to prove the spacing.

1. Ordered lists too.
2. Numbered from one, unsurprisingly.

Block quotes get the accent rule down their left edge:

> A quote is set slightly larger than the body text and indented off a green
> rule, so it reads as a held-up thing rather than a stray paragraph.

Fenced code blocks scroll horizontally rather than pushing the page sideways,
which matters on a phone:

```ts
import { allPosts } from "@/lib/posts";

const posts = allPosts(); // newest first, drafts dropped in production
```

Tables, horizontal rules and images all pass through the same stylesheet.

---

## Drafts and the feed

Setting `draft: true` in the frontmatter hides a post in production while
leaving it visible on the dev server, so an unfinished piece can sit in the repo
without going live. Everything published is also available as
[RSS](/writing/rss.xml) if you would rather not visit a website to read a
website.

That is the whole system. The next post here should have something in it.
