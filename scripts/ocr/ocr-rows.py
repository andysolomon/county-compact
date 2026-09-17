#!/usr/bin/env python3
"""Row-level re-OCR of Table 5 population columns (CC-03 seat verification).

Input: table5-ocr/crops/<panel>.png (1-bit panel crops from ocr-table5.py).
1. Detect the panel's narrow vertical rules from the column ink profile; the
   rightmost pair spaced 130-190 px apart (with room for a 1930 column after it) bounds the 1940 column, and the
   next rule (or the same width again) bounds the 1930 column.
2. Row bands (34 px) centred on the line centres of the whole-column
   tesseract pass (raw/<panel>-<field>-psm6.tsv, word boxes 18-70 px tall),
   plus any single-line ink run in the column not already covered.
Optional args: panel ids to redo (default all nine).
3. OCR each row band at 1x, 2x, 3x with tesseract --psm 7 and a
   digits/comma whitelist.
Writes table5-ocr/raw/<panel>-<field>-rows.tsv: cy top bottom v1x v2x v3x
(y in panel pixels, same origin as the place/county field TSVs).
Requires: magick, tesseract. Stdlib only.
"""
import subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

# Usage: CC03_OCR_DIR=<out-dir> python3 scripts/ocr/ocr-rows.py [panel ...]
OUT = Path(os.environ.get("CC03_OCR_DIR", "table5-ocr"))
PANELS = [f"p{p}-panel{i}" for p in (21, 22, 23) for i in (1, 2, 3)]
INSET = 6
VPAD = 0
SCALES = (1, 2, 3)


def load_pgm(png: Path):
    data = subprocess.run(["magick", str(png), "-depth", "8", "pgm:-"], capture_output=True, check=True).stdout
    parts = data.split(maxsplit=4)
    w, h = int(parts[1]), int(parts[2])
    px = parts[4]
    px = px[len(px) - w * h:]
    return w, h, px


def rule_peaks(w, h, px):
    """x positions of narrow vertical rules: column ink share that is a local
    max and exceeds the mean of the columns 6-10 px to either side by >= 0.2."""
    c = [sum(1 for y in range(h) if px[y * w + x] < 128) / h for x in range(w)]
    peaks = []
    for x in range(10, w - 10):
        side = max(sum(c[x - 10:x - 5]) / 5, sum(c[x + 6:x + 11]) / 5)
        if c[x] == max(c[x - 3:x + 4]) and c[x] - side >= 0.2:
            if not peaks or x - peaks[-1] > 3:
                peaks.append(x)
    return peaks


def tsv_line_centers(tsv: Path, min_h=18, max_h=70, tol=12):
    """Line centres from the whole-column tesseract TSV, ignoring word boxes
    shorter than a digit (dot specks). Tall boxes (up to 70 px) are kept: a
    brace beside a number inflates the box but its centre stays on the row."""
    ws = []
    for line in tsv.read_text(encoding="utf-8", errors="replace").splitlines()[1:]:
        p = line.split("\t")
        if len(p) < 12 or p[0] != "5" or not p[11].strip():
            continue
        top, hh = int(p[7]), int(p[9])
        if min_h <= hh <= max_h:
            ws.append(top + hh / 2)
    groups = []
    for cy in sorted(ws):
        if groups and abs(cy - sum(groups[-1]) / len(groups[-1])) <= tol:
            groups[-1].append(cy)
        else:
            groups.append([cy])
    return [sum(g) / len(g) for g in groups]


def ink_run_centers(w, h, px, x0, x1, min_h=18, max_h=40):
    """Centres of single-line ink runs (y-runs with ink, 18-40 px tall)."""
    ink = [any(px[y * w + x] < 128 for x in range(x0, x1)) for y in range(h)]
    out, start = [], None
    for y, on in enumerate(ink + [False]):
        if on and start is None:
            start = y
        elif not on and start is not None:
            if min_h <= y - start <= max_h:
                out.append((start + y - 1) / 2)
            start = None
    return out


def row_bands(tsv, w, h, px, x0, x1, half=17):
    centers = tsv_line_centers(tsv) if tsv.exists() else []
    for cy in ink_run_centers(w, h, px, x0, x1):
        if all(abs(cy - c) > 12 for c in centers):
            centers.append(cy)
    return [(max(0, round(c - half)), min(h - 1, round(c + half))) for c in sorted(centers)]


def ocr_band(png, x0, x1, top, bottom, scale, tmp, tag):
    t = max(0, top - VPAD)
    hh = bottom + VPAD - t + 1
    img = tmp / f"{tag}.png"
    subprocess.run(["magick", str(png), "-crop", f"{x1 - x0}x{hh}+{x0}+{t}", "+repage",
                    "-resize", f"{scale * 100}%", "-bordercolor", "white", "-border", "20", str(img)], check=True)
    r = subprocess.run(["tesseract", str(img), "stdout", "--psm", "7", "--dpi", str(400 * scale),
                        "-c", "tessedit_char_whitelist=0123456789, "], capture_output=True, text=True)
    return " ".join(r.stdout.split())


def main():
    tmp = Path(tempfile.mkdtemp(prefix="cc03-rows-"))
    with ThreadPoolExecutor(max_workers=12) as ex:
        only = set(sys.argv[1:])
        for panel in [p for p in PANELS if not only or p in only]:
            png = OUT / "crops" / f"{panel}.png"
            w, h, px = load_pgm(png)
            peaks = rule_peaks(w, h, px)
            # 1940|1930 split: rightmost rule pair spaced like a population column.
            pair = None
            for i in range(len(peaks) - 1):
                if peaks[i] > 0.5 * w and 130 <= peaks[i + 1] - peaks[i] <= 190 and peaks[i + 1] + 130 <= w:
                    pair = (peaks[i], peaks[i + 1])
            if pair is None:
                print(f"{panel}: no population rule pair in {peaks}", file=sys.stderr)
                return 1
            r2, r3 = pair
            nxt = [x for x in peaks if 130 <= x - r3 <= 200]
            right = nxt[0] if nxt else min(w, r3 + (r3 - r2) + 10)
            c40 = (r2 + 3 + INSET, r3 - 2 - INSET)
            c30 = (r3 + 3 + INSET, right - 2 - INSET)
            print(f"{panel}: rules {peaks} pop1940 x{c40} pop1930 x{c30}", flush=True)
            for field, (x0, x1) in (("pop1940", c40), ("pop1930", c30)):
                bands = row_bands(OUT / "raw" / f"{panel}-{field}-psm6.tsv", w, h, px, x0, x1)
                futs = [[ex.submit(ocr_band, png, x0, x1, a, b, s, tmp, f"{panel}-{field}-{i}-{s}") for s in SCALES]
                        for i, (a, b) in enumerate(bands)]
                rows = ["cy\ttop\tbottom\tv1x\tv2x\tv3x"]
                for (a, b), fs in zip(bands, futs):
                    rows.append("\t".join([f"{(a + b) / 2:.1f}", str(a), str(b)] + [f.result() for f in fs]))
                (OUT / "raw" / f"{panel}-{field}-rows.tsv").write_text("\n".join(rows) + "\n", encoding="utf-8")
                print(f"  {field}: {len(bands)} rows", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
