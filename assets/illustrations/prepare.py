#!/usr/bin/env python3
"""Prepare candidate SVGs (single black path on white paper) for the portfolio.

Each source is one <path> of black fill whose white areas are simply holes, so the paper
already shows through. This script: bakes the layer translate, scales to a ~400 unit
canvas, drops chosen sub-paths (frames, scenery), drops specks, rounds to 1 decimal
(relative deltas from the rounded point, so no drift), recolours to ink #161616 and
strips every scrap of editor metadata.

usage: python3 prepare.py            (reads ../candidates, writes alongside)
"""
import re, sys, os, math

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'candidates')
INK = '#161616'
NUM = re.compile(r'[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?')

def parse_path(d):
    toks = re.findall(r'[A-Za-z]|' + NUM.pattern, d)
    i = 0; cmd = None; x = y = sx = sy = 0.0
    subs = []; cur = None
    def nums(n):
        nonlocal i
        v = [float(t) for t in toks[i:i + n]]; i += n; return v
    while i < len(toks):
        if re.match(r'[A-Za-z]', toks[i]): cmd = toks[i]; i += 1
        c = cmd
        if c in 'Zz':
            if cur: cur.append(('Z',)); x, y = sx, sy
            continue
        rel = c.islower(); C = c.upper()
        if C == 'M':
            a, b = nums(2)
            if rel: a += x; b += y
            x, y = a, b; sx, sy = x, y
            cur = [('M', x, y)]; subs.append(cur)
            cmd = 'l' if rel else 'L'
        elif C == 'L':
            a, b = nums(2)
            if rel: a += x; b += y
            x, y = a, b; cur.append(('L', x, y))
        elif C == 'H':
            a, = nums(1); x = a + x if rel else a; cur.append(('L', x, y))
        elif C == 'V':
            a, = nums(1); y = a + y if rel else a; cur.append(('L', x, y))
        elif C == 'C':
            v = nums(6)
            if rel: v = [v[k] + (x if k % 2 == 0 else y) for k in range(6)]
            cur.append(('C', *v)); x, y = v[4], v[5]
        else:
            raise SystemExit('unsupported ' + c)
    return subs

def pts(sub):
    out = []
    for s in sub:
        if s[0] == 'Z': continue
        out += [(s[k], s[k + 1]) for k in range(1, len(s), 2)]
    return out

def bbox(sub):
    p = pts(sub)
    xs = [a for a, _ in p]; ys = [b for _, b in p]
    return min(xs), min(ys), max(xs), max(ys)

def load(name):
    s = open(os.path.join(SRC, name + '.svg')).read()
    m = re.search(r'<g[^>]*transform="translate\(([-\d.]+),([-\d.]+)\)"', s)
    tx, ty = (float(m.group(1)), float(m.group(2))) if m else (0, 0)
    d = re.search(r'\sd="([^"]*)"', s).group(1)
    vb = [float(v) for v in re.search(r'viewBox="([^"]*)"', s).group(1).split()]
    subs = parse_path(d)
    for sub in subs:
        for k, s_ in enumerate(sub):
            if s_[0] == 'Z': continue
            sub[k] = (s_[0],) + tuple(v + (tx if j % 2 == 0 else ty) for j, v in enumerate(s_[1:]))
    return subs, vb

def emit(subs, crop, target, minarea=0.6):
    x0, y0, x1, y1 = crop
    sc = target / max(x1 - x0, y1 - y0)
    f = lambda v, o: (v - o) * sc
    out = []
    for sub in subs:
        bx0, by0, bx1, by1 = bbox(sub)
        if (bx1 - bx0) * (by1 - by0) * sc * sc < minarea: continue
        px = py = None; parts = []
        for s in sub:
            if s[0] == 'Z': parts.append('z'); continue
            q = [round(f(s[k], x0 if k % 2 == 1 else y0), 1) for k in range(1, len(s))]
            if s[0] == 'M':
                parts.append('M%s %s' % (fmt(q[0]), fmt(q[1]))); px, py = q[0], q[1]
            elif s[0] == 'L':
                dx, dy = round(q[0] - px, 1), round(q[1] - py, 1)
                if dx == 0 and dy == 0: continue
                parts.append('l%s %s' % (fmt(dx), fmt(dy))); px, py = q[0], q[1]
            else:
                if FLAT and flat(px, py, q):
                    dx, dy = round(q[4] - px, 1), round(q[5] - py, 1)
                    if dx or dy: parts.append('l%s %s' % (fmt(dx), fmt(dy)))
                    px, py = q[4], q[5]; continue
                r = [round(q[0] - px, 1), round(q[1] - py, 1), round(q[2] - px, 1), round(q[3] - py, 1), round(q[4] - px, 1), round(q[5] - py, 1)]
                if r[4] == 0 and r[5] == 0 and r[0] == 0 and r[1] == 0 and r[2] == 0 and r[3] == 0: continue
                parts.append('c' + ' '.join(fmt(v) for v in r)); px, py = q[4], q[5]
        out.append(''.join(parts))
    w, h = round((x1 - x0) * sc, 1), round((y1 - y0) * sc, 1)
    d = ''.join(out)
    d = re.sub(r' -', '-', d)
    return d, w, h

FLAT = True
def flat(px, py, q):
    ex, ey = q[4] - px, q[5] - py; L = math.hypot(ex, ey) or 1e-9
    return all(abs((q[k] - px) * ey - (q[k + 1] - py) * ex) / L < 0.12 for k in (0, 2))

def fmt(v):
    s = ('%.1f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def write(name, d, w, h, clip=None):
    c = ''
    body = '<path fill="%s" d="%s"/>' % (INK, d)
    if clip:
        c = '<clipPath id="c"><path d="M%sz"/></clipPath>' % 'L'.join('%s %s' % (fmt(a), fmt(b)) for a, b in clip)
        body = '<g clip-path="url(#c)">' + body + '</g>'
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" width="%s" height="%s">%s%s</svg>') % (fmt(w), fmt(h), fmt(w), fmt(h), c, body)
    open(os.path.join(HERE, name + '.svg'), 'w').write(svg)
    print('%-44s %6.1f KB  %sx%s' % (name, len(svg) / 1024, fmt(w), fmt(h)))

# ---- per-file edits -------------------------------------------------------
def inside(b, r):  # bbox b wholly inside rect r
    return b[0] >= r[0] and b[1] >= r[1] and b[2] <= r[2] and b[3] <= r[3]

def main(report=False):
    jobs = {}
    for name in ['figure_well-dressed-gentleman-1923', 'figure_vintage-typing-man', 'figure_man-on-candlestick-telephone',
                 'figure_classic-phone-couple', 'typewriter_remington-portable']:
        subs, vb = load(name)
        if report:
            print('==', name, vb, len(subs))
            for k, s in enumerate(subs):
                b = bbox(s); a = (b[2] - b[0]) * (b[3] - b[1])
                if a > 0.02 * vb[2] * vb[3] or '-r' in sys.argv: print(k, [round(v, 1) for v in b], len(s))
            continue
        jobs[name] = (subs, vb)
    return jobs

if __name__ == '__main__':
    if '--report' in sys.argv: main(True); sys.exit()

# Output-unit polygon (400-unit canvas) hugging the gentleman, excluding the house, grass,
# bushes and car that are drawn into the same outline. Scenery that touches his coat edge
# can't be separated from the single path, so a clip is used instead of sub-path removal.
GENT_CLIP = [(34, 0), (104, 0), (104, 27), (97, 34), (95, 45), (106, 50), (114, 56), (121, 66), (133, 82),
             (146, 100), (155, 119), (160, 135), (154, 143), (130, 142), (118, 141), (116, 150), (116, 222),
             (118, 400), (40, 400), (40, 222), (41, 150), (42, 138), (50, 134), (56, 126), (56, 110), (57, 90),
             (55, 78), (58, 70), (62, 58), (60, 53), (54, 50), (46, 44), (46, 31), (34, 28)]

def run():
    T = 400
    def job(name, out, crop=None, drop=lambda k, b: False, clip=None, minarea=0.6, T=T):
        subs, vb = load(name)
        sc = 400 / max(vb[2], vb[3])   # crops are given in 400-unit canvas coordinates
        subs = [s for k, s in enumerate(subs) if not drop(k, bbox(s))]
        cr = tuple(v / sc for v in crop) if crop else (0, 0, vb[2], vb[3])
        # keep only sub-paths that touch the crop
        subs = [s for s in subs if not (bbox(s)[2] < cr[0] or bbox(s)[0] > cr[2] or bbox(s)[3] < cr[1] or bbox(s)[1] > cr[3])]
        d, w, h = emit(subs, cr, T, minarea)
        if clip:
            clip = [(a - crop[0], b - crop[1]) for a, b in clip]
        write(out, d, w, h, clip)
        return w, h
    job('figure_well-dressed-gentleman-1923', 'figure_well-dressed-gentleman-1923', crop=(34, 0, 160, 400), clip=GENT_CLIP)
    # typing man: the rectangular frame is part of one connected outline; crop 2.8mm inside it
    job('figure_vintage-typing-man', 'figure_vintage-typing-man', crop=(7, 8, 396, 318))
    job('figure_man-on-candlestick-telephone', 'figure_man-on-candlestick-telephone', drop=lambda k, b: k == 0 and False)
    # couple: keep the woman and her wall telephone (left 45%)
    job("figure_classic-phone-couple", "figure_classic-phone-couple", crop=(0, 0, 166, 214), T=180, minarea=2)
    job('typewriter_remington-portable', 'typewriter_remington-portable')

if __name__ == '__main__':
    if '--report' in sys.argv: main(True); sys.exit()
    run()
