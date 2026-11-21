"""The lettering: one face and one mark, drawn from Geist (SIL OFL 1.1, src/fonts/OFL-Geist.txt).

The face (src/fonts/Mastermind-Display.woff2) is Geist mixed point by point from two weights: every x from 850 and
every y from 300, so stems stay full while joins and horizontals thin out, the contrast of an upright broad nib. On top
of that it carries the drawn touches that hold up at heading sizes: a pen-entry spur where a stem starts at the
x-height (i j m n p r u), a slanted flag on the ascenders (b d h k l) and ink drops for the tittles.

The mark (mark.ts) is "design mastermind" shaped in that face, plus the pieces only the name gets: a g whose tail runs
back under the word, a hairline tie from the s terminal into the t's stem, an r whose arm joins the m and a lift off the last
d; mark(face, full=False) gives the name without them, for a mark set under about 28 px. ink.ts holds the marginalia.

Needs fonttools, uharfbuzz and skia-pathops. From the repo root: python -P src/components/ds/display/letter.py"""
import io, json, math, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.recordingPen import DecomposingRecordingPen, RecordingPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools import subset
import uharfbuzz as hb
import pathops

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "../../../.."))
SRC = os.path.join(ROOT, "src/fonts/Geist-var.woff2")
FACE = os.path.join(ROOT, "src/fonts/Mastermind-Display.woff2")
HEAVY, LIGHT = 850, 300
# Extra sidebearing baked into every advance, so the headings' own tracking (set for Geist) holds in the wider face.
TRACK = 26
XH, ASC = 530, 710
CHARS = "".join(chr(c) for c in range(0x20, 0x7F)) + "\u00a0\u00a9\u00d7\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026\u2190\u2192\u2197"


def poly(pts):
    p = pathops.Path()
    pen = p.getPen()
    pen.moveTo(pts[0])
    for q in pts[1:]:
        pen.lineTo(q)
    pen.closePath()
    p.simplify()
    return p


def rect(x0, y0, x1, y1):
    return poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)])


def bez(c, t):
    m = 1 - t
    return tuple(m * m * m * c[0][k] + 3 * m * m * t * c[1][k] + 3 * m * t * t * c[2][k] + t * t * t * c[3][k] for k in (0, 1))


def dbez(c, t):
    m = 1 - t
    return tuple(3 * m * m * (c[1][k] - c[0][k]) + 6 * m * t * (c[2][k] - c[1][k]) + 3 * t * t * (c[3][k] - c[2][k]) for k in (0, 1))


A, B = 92, 31


def nib(ctrl, env, a=A, b=B, n=72):
    """A stroke laid with an elliptical nib (half-width a across, half-height b): upright travel lays a full stem, level
    travel a hairline, the same contrast as the face. env(t) scales the nib: pressure, and the lift at either end."""
    left, right = [], []
    for i in range(n + 1):
        t = i / n
        (px, py), (tx, ty) = bez(ctrl, t), dbez(ctrl, t)
        l = math.hypot(tx, ty) or 1e-9
        nx, ny = -ty / l, tx / l
        d = math.sqrt(a * a * nx * nx + b * b * ny * ny) or 1e-9
        k = env(t)
        ox, oy = a * a * nx / d * k, b * b * ny / d * k
        left.append((px + ox, py + oy))
        right.append((px - ox, py - oy))
    return poly(left + right[::-1])


def lift(a=0.0, b=0.3, floor=0.0, swell=0.0):
    def env(u):
        k = 1.0
        if a and u < a:
            k = floor + (1 - floor) * math.sin(u / a * math.pi / 2)
        if b and u > 1 - b:
            k = min(k, floor + (1 - floor) * math.sin((1 - u) / b * math.pi / 2))
        return k * (1 + swell * math.sin(u * math.pi))
    return env


def drop(cx, cy, r=82, tip=150, angle=58, n=40):
    """An ink drop: a round with its tail flicked out toward angle (degrees)."""
    phi = math.radians(angle)
    t0 = math.acos(r / tip)
    pts = [(cx + tip * math.cos(phi), cy + tip * math.sin(phi))]
    for i in range(n + 1):
        th = phi + t0 + (2 * math.pi - 2 * t0) * i / n
        pts.append((cx + r * math.cos(th), cy + r * math.sin(th)))
    return poly(pts)


def to_path(rec, dx=0.0):
    p = pathops.Path()
    pen = p.getPen()
    for op, pts in rec:
        getattr(pen, op)(*[None if q is None else (q[0] + dx, q[1]) for q in pts])
    return p


def union(paths):
    out = paths[0]
    for p in paths[1:]:
        out = pathops.op(out, p, pathops.PathOp.UNION)
    out.simplify()
    return out


def minus(p, cuts):
    for q in cuts:
        p = pathops.op(p, q, pathops.PathOp.DIFFERENCE)
    return p


def contours(rec):
    out, cur = [], []
    for op, pts in rec:
        cur.append((op, pts))
        if op in ("closePath", "endPath"):
            out.append(cur)
            cur = []
    return out


def on_points(contour):
    return [q for op, pts in contour if pts for q in pts[-1:] if q is not None]


def top_stem(rec, height):
    """The leftmost flat top at the given height: the (left, right) of the stem that starts there."""
    best = None
    for c in contours(rec):
        pts = on_points(c)
        for p, q in zip(pts, pts[1:] + pts[:1]):
            if abs(p[1] - height) < 6 and abs(q[1] - height) < 6 and 120 < abs(p[0] - q[0]) < 260:
                l, r = sorted((p[0], q[0]))
                if best is None or l < best[0]:
                    best = (l, r)
    return best


def touched(name, rec):
    """A glyph with the face's drawn touches, or None when it keeps Geist's own drawing."""
    ch = {"i": "i", "j": "j", "m": "m", "n": "n", "p": "p", "r": "r", "u": "u", "b": "b", "d": "d", "h": "h", "k": "k", "l": "l"}.get(name)
    if not ch:
        return None
    path = to_path(rec)
    adds, cuts = [], []
    if ch in "ij":
        for c in contours(rec):
            ys = [q[1] for q in on_points(c)]
            if min(ys) > XH + 40:
                xs = [q[0] for q in on_points(c)]
                cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
                cuts.append(rect(min(xs) - 30, min(ys) - 30, max(xs) + 30, max(ys) + 30))
                adds.append(drop(cx, cy + 6))
    if ch in "ijmnpru":
        s = top_stem(rec, XH)
        if s:
            l, r = s
            cuts.append(poly([(l - 38, XH - 31), (r, XH + 36), (r, XH + 200), (l - 38, XH + 200)]))
            adds.append(poly([(l, XH - 110), (l - 30, XH - 28), (r, XH + 36), (r, XH - 110)]))
    if ch in "bdhkl":
        s = top_stem(rec, ASC)
        if s:
            l, r = s
            cuts.append(rect(l - 40, ASC - 70, r + 10, ASC + 60))
            adds.append(poly([(l, ASC - 110), (l - 30, ASC - 28), (r, ASC + 32), (r, ASC - 110)]))
    return union([minus(path, cuts)] + adds)


def build_face():
    heavy = instantiateVariableFont(TTFont(SRC), {"wght": HEAVY})
    light = instantiateVariableFont(TTFont(SRC), {"wght": LIGHT})
    gh, gl = heavy["glyf"], light["glyf"]
    for name in heavy.getGlyphOrder():
        a, b = gh[name], gl[name]
        if a.isComposite() or a.numberOfContours <= 0:
            continue
        if len(a.coordinates) != len(b.coordinates):
            raise SystemExit("point mismatch in " + name)
        a.coordinates = type(a.coordinates)([(x, y) for (x, _), (_, y) in zip(a.coordinates, b.coordinates)])
        a.program = None
    gs = heavy.getGlyphSet()
    for name in heavy.getGlyphOrder():
        rec = DecomposingRecordingPen(gs)
        gs[name].draw(rec)
        p = touched(name, rec.value)
        if p is None:
            continue
        tt = TTGlyphPen(None)
        p.draw(Cu2QuPen(tt, max_err=1.0, reverse_direction=False))
        g = tt.glyph()
        g.recalcBounds(heavy["glyf"])
        heavy["glyf"][name] = g
        heavy["hmtx"][name] = (heavy["hmtx"][name][0], g.xMin)
    for name in heavy.getGlyphOrder():
        g = heavy["glyf"][name]
        adv, lsb = heavy["hmtx"][name]
        if g.numberOfContours > 0:
            g.coordinates.translate((TRACK // 2, 0))
            g.recalcBounds(heavy["glyf"])
        heavy["hmtx"][name] = (adv + TRACK, lsb + TRACK // 2 if g.numberOfContours else lsb)
    for t in ("fpgm", "prep", "cvt ", "hdmx", "LTSH", "VDMX", "gasp", "STAT"):
        if t in heavy:
            del heavy[t]
    heavy["OS/2"].usWeightClass = 800
    names = heavy["name"]
    for rec in list(names.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 25):
            names.removeNames(nameID=rec.nameID)
    for nid, s in ((1, "Mastermind Display"), (2, "Regular"), (3, "Mastermind Display; Geist 1.800 mixed 850/300"), (4, "Mastermind Display"), (6, "MastermindDisplay-Regular")):
        names.setName(s, nid, 3, 1, 0x409)
    names.setName("Mastermind Display is a modified version of Geist (Vercel, SIL OFL 1.1), lettered for jawadjalal.com.", 10, 3, 1, 0x409)
    names.setName("This Font Software is licensed under the SIL Open Font License, Version 1.1.", 13, 3, 1, 0x409)
    names.setName("https://openfontlicense.org", 14, 3, 1, 0x409)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "ccmp", "locl"]
    opts.name_IDs = [0, 1, 2, 3, 4, 5, 6, 10, 13, 14]
    opts.hinting = False
    sub = subset.Subsetter(opts)
    sub.populate(text=CHARS)
    sub.subset(heavy)
    heavy.flavor = "woff2"
    heavy.save(FACE)
    heavy.flavor = None
    buf = io.BytesIO()
    heavy.save(buf)
    return TTFont(io.BytesIO(buf.getvalue())), buf.getvalue()


def stroke_pts(pts, env, a, b):
    """A stroke along sampled centre points (same nib as nib())."""
    n = len(pts) - 1
    left, right = [], []
    for i, (px, py) in enumerate(pts):
        qx, qy = pts[min(i + 1, n)]
        rx, ry = pts[max(i - 1, 0)]
        tx, ty = qx - rx, qy - ry
        l = math.hypot(tx, ty) or 1e-9
        nx, ny = -ty / l, tx / l
        d = math.sqrt(a * a * nx * nx + b * b * ny * ny) or 1e-9
        k = env(i / n)
        ox, oy = a * a * nx / d * k, b * b * ny / d * k
        left.append((px + ox, py + oy))
        right.append((px - ox, py - oy))
    return poly(left + right[::-1])


def shape(hbf, text):
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbf, buf, {})
    return [(i.codepoint, p.x_advance) for i, p in zip(buf.glyph_infos, buf.glyph_positions)]


# Pair adjustments for the name at display size, in font units, by the index of the right-hand letter.
KERN = {"design": {5: -28}, "mastermind": {6: -24}}


def bounds(p):
    return p.bounds


def core(p):
    """The x extent of a letter inside the x-height band, where its neighbours are judged."""
    band = pathops.op(p, rect(-5000, 120, 20000, 420), pathops.PathOp.INTERSECTION)
    b = band.bounds
    return b[0], b[2]


def mark(face, full=True):
    order = face.getGlyphOrder()
    gs = face.getGlyphSet()
    words = []
    for t in ("design", "mastermind"):
        x = 0
        X, recs = [], []
        for k, (gid, adv) in enumerate(shape(HBF, t)):
            x += KERN[t].get(k, 0)
            X.append(x)
            r = DecomposingRecordingPen(gs)
            gs[order[gid]].draw(r)
            recs.append(r.value)
            x += adv - TRACK
        w = x
        O = [v + TRACK // 2 for v in X]
        add = {i: [] for i in range(len(t))}
        cut = {i: [] for i in range(len(t))}
        if full and t == "design":
            g = O[4]
            cut[4].append(rect(g - 40, -260, g + 640, 12))
            add[4].append(nib(((g + 504, 40), (g + 504, -110), (g + 400, -146), (g + 230, -150)), lambda u: 1))
            add[4].append(nib(((g + 262, -148), (g - 150, -152), (g - 700, -150), (g - 980, -70)), lift(b=0.72, swell=0.28)))
        if full and t == "mastermind":
            xs, xt, xr, xm, xd = O[2], O[3], O[5], O[6], O[9]
            add[3].append(nib(((xs + 470, 398), (xs + 600, 392), (xt + 50, 412), (xt + 150, 444)), lift(a=0, b=0, floor=1), a=34, b=21))
            add[5].append(poly([(xr + 396, 466), (xm + 60, 418), (xm + 82, 519), (xr + 396, 530)]))
            add[9].append(nib(((xd + 503, 90), (xd + 505, -50), (xd + 690, -44), (xd + 820, 70)), lift(b=0.6, floor=0.02)))
        g = []
        for i, rec in enumerate(recs):
            p = minus(to_path(rec, X[i]), cut[i])
            g.append(union([p] + add[i]) if add[i] else p)
        words.append({"t": t, "w": w, "g": g, "X": X})
    return words


def svg(path):
    rec = RecordingPen()
    path.draw(rec)
    pen = SVGPathPen(None, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
    for op, pts in rec.value:
        getattr(pen, op)(*[None if q is None else (q[0], -q[1]) for q in pts])
    return pen.getCommands()


def gaps(words):
    for w in words:
        cs = [core(p) for p in w["g"]]
        print(w["t"], " ".join("%s%s:%d" % (w["t"][i], w["t"][i + 1], cs[i + 1][0] - cs[i][1]) for i in range(len(cs) - 1)))


def emit(words, const, path):
    allb = [p.bounds for w in words for p in w["g"]]
    asc = math.ceil((max(b[3] for b in allb) + 20) / 10) * 10
    desc = math.ceil((-min(b[1] for b in allb) + 20) / 10) * 10
    data = [{"t": w["t"], "w": round(max(w["w"], max(p.bounds[2] for p in w["g"]) + 20)), "g": [svg(p) for p in w["g"]]} for w in words]
    head = "// Generated by letter.py. Do not edit by hand.\n"
    head += "/** The name lettered: one path per letter, 1000 units to the em, baseline at 0, y down; asc and desc bound the\n *  drawing above and below the baseline, w is each word's advance. */\nexport type Mark = { asc: number; desc: number; words: { t: string; w: number; g: string[] }[] };\n\n"
    with open(path, "w") as fh:
        fh.write(head + "export const %s: Mark = { asc: %d, desc: %d, words: %s };\n" % (const, asc, desc, json.dumps(data, separators=(",", ":"))))
    return asc, desc


def ink():
    """Marginalia: a scribbled underline (two passes, the second shorter) and a loose ring drawn round a counter."""
    pen_a, pen_b = 22, 15
    n = 90
    under1 = [(14 + 972 * t, 62 - 22 * t + 7 * math.sin(t * 9.0)) for t in (i / n for i in range(n + 1))]
    under2 = [(930 - 760 * t, 58 + 30 * t + 5 * math.sin(t * 7.0 + 1)) for t in (i / n for i in range(n + 1))]
    hook = [(986 - 56 * t * t, 40 + 18 * t) for t in (i / 12 for i in range(13))]
    u = union([stroke_pts(under1, lift(a=0.04, b=0.06, floor=0.4), pen_a, pen_b), stroke_pts(hook, lambda v: 1, pen_a, pen_b), stroke_pts(under2, lift(a=0.03, b=0.35, floor=0.1), pen_a, pen_b)])
    m = 160
    ring = []
    for i in range(m + 1):
        t = i / m
        th = math.radians(200) - t * math.radians(395)
        rx = 470 + 18 * math.sin(t * 5.0)
        ry = 205 + 14 * math.cos(t * 4.0)
        ring.append((500 + rx * math.cos(th) + 12 * t, 250 + ry * math.sin(th) - 22 * t))
    r = stroke_pts(ring, lift(a=0.05, b=0.12, floor=0.25), 30, 22)

    def d(p):
        rec = RecordingPen()
        p.draw(rec)
        pen = SVGPathPen(None, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
        for op, pts in rec.value:
            getattr(pen, op)(*pts)
        return pen.getCommands()
    with open(os.path.join(HERE, "ink.ts"), "w") as fh:
        fh.write("// Generated by letter.py. Do not edit by hand.\n/** Marginalia strokes, drawn with the mark's nib: each is a path in a viewBox of w by h. */\nexport const INK = %s;\n" % json.dumps({"under": {"w": 1000, "h": 110, "d": d(u)}, "ring": {"w": 1000, "h": 500, "d": d(r)}}, separators=(",", ":")))


if __name__ == "__main__":
    face, raw = build_face()
    HBF = hb.Font(hb.Face(hb.Blob(raw)))
    full = mark(face, True)
    gaps(full)
    print("mark", emit(full, "MARK", os.path.join(HERE, "mark.ts")))
    ink()
    print("face", os.path.getsize(FACE))
