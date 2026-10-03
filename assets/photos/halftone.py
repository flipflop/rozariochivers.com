#!/usr/bin/env python3
"""Pre-render the talk photos as 1950s two-ink halftones: a black dot screen at 45 degrees on
paper, over a flat sky-blue under-print taken from a posterised mid-tone mask and printed 3px
out of register.  usage: python3 halftone.py   (writes *-halftone.png next to the sources)"""
import numpy as np
from PIL import Image, ImageFilter, ImageOps, ImageEnhance
from scipy.ndimage import median_filter, shift as nd_shift

PAPER = np.array([0xF1, 0xEC, 0xDF], float)
INK = np.array([0x16, 0x16, 0x16], float)
BLUE = np.array([0x7D, 0xB6, 0xD8], float)

JOBS = {
    # name: (crop box in source px, output width, dot pitch in output px, tone gamma)
    'talk-aws-beers-with-engineers-2023': ((0, 135, 780, 720), 1400, 5.2, 0.62),
    'talk-terem-design-systems-2024': ((0, 40, 1000, 750), 1400, 5.2, 0.8),
}

def render(src, crop, width, pitch, gamma, reg=(5, -3)):
    im = Image.open(src).convert('L').crop(crop)
    h = round(im.height * width / im.width)
    im = im.resize((width, h), Image.LANCZOS)
    im = ImageOps.autocontrast(im, cutoff=1)
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=120, threshold=2))
    lum = np.asarray(im, float) / 255.0
    lum = np.clip((lum - 0.02) / 0.9, 0, 1) ** gamma     # lift mid-tones so slide text reads
    dark = 1 - lum
    # --- ink screen, 45 degrees -------------------------------------------------
    yy, xx = np.mgrid[0:h, 0:width].astype(float)
    t = np.pi / 4
    u = xx * np.cos(t) + yy * np.sin(t)
    v = -xx * np.sin(t) + yy * np.cos(t)
    thr = 0.5 - 0.25 * (np.cos(2 * np.pi * u / pitch) + np.cos(2 * np.pi * v / pitch))
    # let the lightest tones drop out entirely (paper) and the darkest fill solid
    d = np.clip((dark - 0.03) / 0.80, 0, 1)
    ink = np.clip((d - thr) * 7 + 0.5, 0, 1)
    # --- blue under-print: posterised mid-tones, flattened, offset ----------------
    mid = ((dark > 0.16) & (dark < 0.62)).astype(np.uint8) * 255
    mid = Image.fromarray(mid).filter(ImageFilter.GaussianBlur(3))
    mid = np.asarray(mid, float) / 255
    mid = median_filter((mid > 0.5).astype(np.uint8), size=9).astype(float)
    mid = nd_shift(mid, (reg[1], reg[0]), order=0, mode='constant')
    mid = np.clip(np.asarray(Image.fromarray((mid * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), float) / 255, 0, 1)
    out = PAPER[None, None, :] * (1 - mid[..., None]) + BLUE[None, None, :] * mid[..., None]
    out = out * (1 - ink[..., None]) + INK[None, None, :] * ink[..., None]
    return Image.fromarray(out.round().astype(np.uint8))

if __name__ == '__main__':
    for name, (crop, w, p, g) in JOBS.items():
        img = render(f'{name}.jpg', crop, w, p, g)
        img.quantize(48, dither=Image.NONE).save(f"{name}-halftone.png", optimize=True)
        print(name, img.size)
