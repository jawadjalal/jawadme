# Turns the monid ink sketches into 1-bit pixel art for the site.
# Line art is box-filtered down to the cell grid, then thresholded by coverage,
# so a marker line lands as one or two whole cells instead of grey fuzz.
from PIL import Image, ImageOps
import numpy as np, sys, os
OUT = '../public/px'
def ink(path):
    g = ImageOps.grayscale(Image.open(path).convert('RGB'))
    return 1.0 - np.asarray(g, dtype=np.float32) / 255.0      # 1 = ink
def trim(a, pad=8, t=0.25):
    ys, xs = np.where(a > t)
    y0, y1, x0, x1 = max(ys.min()-pad,0), min(ys.max()+pad, a.shape[0]), max(xs.min()-pad,0), min(xs.max()+pad, a.shape[1])
    return a[y0:y1, x0:x1]
def cells(a, cw, thr=0.22, dx=0, dy=0):
    h, w = a.shape
    ch = max(1, round(h * cw / w))
    if dx or dy: a = np.roll(np.roll(a, dy, 0), dx, 1)
    im = Image.fromarray((a * 255).astype(np.uint8)).resize((cw, ch), Image.BOX)
    return (np.asarray(im, dtype=np.float32) / 255.0) > thr
def save(mask, rgb, name, frames=None):
    h, w = mask.shape
    out = np.zeros((h, w, 4), np.uint8); out[mask] = (*rgb, 255)
    Image.fromarray(out).save(f'{OUT}/{name}.png', optimize=True)
def sprite(masks, rgb, name):
    h = max(m.shape[0] for m in masks); w = max(m.shape[1] for m in masks)
    out = np.zeros((h, w * len(masks), 4), np.uint8)
    for i, m in enumerate(masks):
        sub = out[:m.shape[0], i*w:i*w+m.shape[1]]; sub[m] = (*rgb, 255)
    Image.fromarray(out).save(f'{OUT}/{name}.png', optimize=True)
    return w, h
PAPER = (243, 241, 234); BLUE = (46, 59, 255); INK = (13, 13, 15)
if __name__ == '__main__':
    import json
    meta = {}
    # doodles: 3x3 sheets, two boil frames each (half-cell phase shift)
    names = {'sheetA': ['floppy','cursor','pencil','controller','cube','phone','plane','bulb','tea'],
             'sheetB': ['bus','pigeon','bigben','rocket','laptop','postbox','sketchbook','console','plant']}
    for sheet, keys in names.items():
        a = ink(f'src/{sheet}.png'); S = a.shape[0] // 3
        for i, k in enumerate(keys):
            r, c = divmod(i, 3)
            cell = trim(a[r*S:(r+1)*S, c*S:(c+1)*S])
            cw = 44 if cell.shape[1] >= cell.shape[0] else max(20, round(44 * cell.shape[1] / cell.shape[0]))
            f1 = cells(cell, cw); f2 = cells(cell, cw, dx=5, dy=3)
            meta[k] = sprite([f1, f2], PAPER, f'd-{k}')
            # a small blue version for the tiles and the inline icons
            t = cells(cell, 24 if cell.shape[1] >= cell.shape[0] else max(10, round(24 * cell.shape[1] / cell.shape[0])), thr=0.2)
            save(t, PAPER, f'i-{k}'); save(t, BLUE, f'b-{k}'); save(t, INK, f'k-{k}')
    # the hero sketch, kept as a soft grey texture: the shader does the cells
    a = trim(ink('src/hero2.png'), pad=16)
    Image.fromarray((a*255).astype(np.uint8)).resize((1024, round(1024*a.shape[0]/a.shape[1])), Image.BOX).save(f'{OUT}/hero-ink.png', optimize=True)
    meta['hero'] = a.shape[::-1]
    # still pixel versions for no-WebGL and for the footer scene
    save(cells(a, 220), BLUE, 'hero-still')
    b = trim(ink('src/hero3.png'), pad=16); save(cells(b, 260), PAPER, 'scene')
    meta['scene'] = cells(b, 260).shape[::-1]
    # his portrait: the ink memoji on white, then cells
    im = Image.open('../public/design/jawad-ink.webp').convert('RGBA'); bg = Image.new('RGBA', im.size, 'white'); bg.alpha_composite(im)
    bg.convert('RGB').save('/tmp/jink.png'); p = trim(ink('/tmp/jink.png'), pad=10)
    for cw, thr in ((96, 0.2),):
        m = cells(p, cw, thr=thr); save(m, INK, 'face'); meta['face'] = m.shape[::-1]
    m = cells(p, 56, thr=0.24); save(m, INK, 'face-sm'); meta['face-sm'] = m.shape[::-1]
    json.dump(meta, open('meta.json','w'))
    print(meta)
