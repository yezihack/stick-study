"""Regenerate Android launcher icons with an equal-margin triangle.

The triangle is placed so all three corners sit the same distance from their
nearest edge (apex->top, base-left->left/bottom, base-right->right/bottom).
A true equilateral triangle cannot satisfy this in a square, so the shape is a
slightly wider isosceles triangle. Border thickness and dot proportions match
the original logo.
"""
import os
from PIL import Image, ImageDraw

SAKURA = (192, 84, 74, 255)   # #c0544a
GOLD = (184, 150, 42, 255)    # #b8962a
CREAM = (244, 240, 232, 255)  # #f4f0e8
TRANSPARENT = (0, 0, 0, 0)

INNER_SCALE = 0.625           # inner triangle = 62.5% of outer about centroid
DOT_W_RATIO = 0.0758          # dot radius relative to triangle width
SS = 4                        # supersampling factor

ROOT = os.path.join(os.path.dirname(__file__), "..", "android", "app", "src",
                    "main", "res")


def tri_points(W, m):
    apex = (W / 2, m)
    bl = (m, W - m)
    br = (W - m, W - m)
    return apex, bl, br


def scale_about(pts, c, k):
    return [(c[0] + k * (x - c[0]), c[1] + k * (y - c[1])) for (x, y) in pts]


def render(N, f, mode):
    """mode: 'fg' (transparent), 'square' (cream full), 'round' (cream circle)."""
    W = N * SS
    m = f * W
    outer = list(tri_points(W, m))
    c = (sum(p[0] for p in outer) / 3, sum(p[1] for p in outer) / 3)
    inner = scale_about(outer, c, INNER_SCALE)
    tri_w = W - 2 * m
    dot_r = DOT_W_RATIO * tri_w

    img = Image.new("RGBA", (W, W), TRANSPARENT)
    d = ImageDraw.Draw(img)

    if mode == "square":
        d.rectangle([0, 0, W, W], fill=CREAM)
    elif mode == "round":
        d.ellipse([0, 0, W - 1, W - 1], fill=CREAM)

    hole = TRANSPARENT if mode == "fg" else CREAM
    d.polygon(outer, fill=SAKURA)
    d.polygon(inner, fill=hole)
    d.ellipse([c[0] - dot_r, c[1] - dot_r, c[0] + dot_r, c[1] + dot_r], fill=GOLD)

    return img.resize((N, N), Image.LANCZOS)


# margin fractions tuned to keep the same triangle width as the originals
CONF = {
    "ic_launcher_foreground": (0.2095, "fg"),
    "ic_launcher": (0.17, "square"),
    "ic_launcher_round": (0.17, "round"),
}


def main():
    count = 0
    for dirpath, _, files in os.walk(ROOT):
        for name in files:
            if not name.endswith(".png"):
                continue
            stem = name[:-4]
            if stem not in CONF:
                continue
            path = os.path.join(dirpath, name)
            N = Image.open(path).size[0]
            f, mode = CONF[stem]
            render(N, f, mode).save(path)
            print("wrote", os.path.relpath(path, ROOT), N)
            count += 1
    print("total", count)


if __name__ == "__main__":
    main()
