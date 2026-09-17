#!/usr/bin/env python3
"""OCR 1940 Census Georgia Table 5 (PDF pages 21-23) into per-column text.

Table 5 is three panels per page. Each panel has four fields:
place name, county, 1940 population, 1930 population.
Page 21 holds Table 4 above and Table 5 on the lower third.

Requires system binaries: pdfimages, magick (ImageMagick), tesseract.
No Python packages beyond the stdlib.
"""
from __future__ import annotations

import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Usage: python3 scripts/ocr/ocr-table5.py <census1940-ga.pdf> <out-dir>
PDF = Path(os.environ.get("CC03_PDF", "census1940-ga.pdf"))
OUT = Path(os.environ.get("CC03_OCR_DIR", "table5-ocr"))
if len(sys.argv) >= 3:
    PDF, OUT = Path(sys.argv[1]), Path(sys.argv[2])
WORK = Path(os.environ.get("CC03_OCR_WORK", "/tmp/cc03-ocr-work"))

# Crop boxes are origin-top-left pixels on the extracted 400 dpi 1-bit scans.
# Each panel: (x, y, w, h) covering place+county+1940+1930.
# Field splits inside a panel: x-offsets of the three vertical rules
# (place|county, county|1940, 1940|1930) relative to panel x.
PAGES = [
    {
        "scan": "scan-000.png",  # PDF page 21, print p.254
        "page": 21,
        "note": "Table 5 occupies the lower third; Table 4 is above.",
        "panels": [
            {"id": "p21-panel1", "box": (380, 3040, 890, 1260), "rules": (274, 566, 716)},
            {"id": "p21-panel2", "box": (1248, 3040, 960, 1260), "rules": (324, 622, 777)},
            {"id": "p21-panel3", "box": (2188, 3040, 1020, 1260), "rules": (361, 648, 805)},
        ],
    },
    {
        "scan": "scan-001.png",  # PDF page 22, print p.255
        "page": 22,
        "note": "Full Table 5 continuation.",
        "panels": [
            {"id": "p22-panel1", "box": (390, 740, 980, 3520), "rules": (325, 638, 798)},
            {"id": "p22-panel2", "box": (1355, 740, 990, 3520), "rules": (335, 653, 814)},
            {"id": "p22-panel3", "box": (2335, 740, 1100, 3520), "rules": (339, 647, 807)},
        ],
    },
    {
        "scan": "scan-004.png",  # PDF page 23, print p.256
        "page": 23,
        "note": "Full Table 5 continuation through Zebulon.",
        "panels": [
            {"id": "p23-panel1", "box": (370, 730, 900, 3540), "rules": (276, 570, 722)},
            {"id": "p23-panel2", "box": (1248, 730, 960, 3540), "rules": (325, 626, 782)},
            {"id": "p23-panel3", "box": (2190, 730, 1140, 3540), "rules": (338, 649, 809)},
        ],
    },
]

FIELDS = ("place", "county", "pop1940", "pop1930")
PAD = 8  # extra pixels on each side of a field crop


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def extract_scans():
    WORK.mkdir(parents=True, exist_ok=True)
    if not (WORK / "scan-000.png").exists():
        run(
            ["pdfimages", "-f", "21", "-l", "23", "-png", str(PDF), str(WORK / "scan")],
            cwd=WORK,
        )


def crop(src: Path, box, dest: Path):
    x, y, w, h = box
    run(["magick", str(src), "-crop", f"{w}x{h}+{x}+{y}", "+repage", str(dest)])


def field_boxes(panel):
    px, py, pw, ph = panel["box"]
    r1, r2, r3 = panel["rules"]
    xs = [0, r1, r2, r3, pw]
    boxes = []
    for i in range(4):
        x0 = max(0, xs[i] - PAD)
        x1 = min(pw, xs[i + 1] + PAD)
        boxes.append((px + x0, py, x1 - x0, ph))
    return boxes


def tesseract(image: Path, out_base: Path, psm: int, whitelist: str | None, dpi: int = 400):
    cmd = [
        "tesseract",
        str(image),
        str(out_base),
        "--psm",
        str(psm),
        "--dpi",
        str(dpi),
        "-c",
        "tessedit_create_tsv=1",
        "-c",
        "tessedit_create_txt=1",
    ]
    if whitelist:
        cmd.extend(["-c", f"tessedit_char_whitelist={whitelist}"])
    run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def parse_tsv(path: Path):
    rows = []
    text = path.read_text(encoding="utf-8", errors="replace")
    for line in text.splitlines()[1:]:
        parts = line.split("\t")
        if len(parts) < 12:
            continue
        try:
            level = int(parts[0])
        except ValueError:
            continue
        if level != 5:
            continue
        word = parts[11]
        if word.strip() == "":
            continue
        conf = float(parts[10]) if parts[10] not in ("", "-1") else 0.0
        left, top, width, height = map(int, parts[6:10])
        rows.append(
            {
                "text": word,
                "conf": conf,
                "left": left,
                "top": top,
                "width": width,
                "height": height,
                "cy": top + height / 2,
            }
        )
    return rows


def cluster_lines(words, y_tol=18):
    if not words:
        return []
    words = sorted(words, key=lambda w: (w["cy"], w["left"]))
    lines = []
    cur = [words[0]]
    cy = words[0]["cy"]
    for w in words[1:]:
        if abs(w["cy"] - cy) <= y_tol:
            cur.append(w)
            cy = sum(x["cy"] for x in cur) / len(cur)
        else:
            lines.append(cur)
            cur = [w]
            cy = w["cy"]
    lines.append(cur)
    return lines


def line_text(words):
    words = sorted(words, key=lambda w: w["left"])
    return " ".join(w["text"] for w in words), min(w["conf"] for w in words), sum(w["cy"] for w in words) / len(words)


HEADER_RE = re.compile(
    r"(city|town|village|county|1940|1930|table|population|georgia|continued)",
    re.I,
)


def is_header(text: str) -> bool:
    t = re.sub(r"[^A-Za-z0-9 *]+", " ", text).strip().lower()
    if not t:
        return True
    if HEADER_RE.search(t) and len(t) < 40:
        return True
    return t in {"or", "of", "the"}


def ocr_field(image: Path, dest_stem: Path, kind: str, psm: int):
    whitelist = "0123456789,() *†" if kind.startswith("pop") else None
    tesseract(image, dest_stem, psm, whitelist)
    tsv = dest_stem.with_suffix(".tsv")
    words = parse_tsv(tsv) if tsv.exists() else []
    lines = []
    for group in cluster_lines(words):
        text, conf, cy = line_text(group)
        if is_header(text):
            continue
        lines.append({"text": text, "conf": conf, "cy": cy})
    return lines


def align_fields(field_lines, y_tol=22):
    """Zip the four field line-lists into records by vertical center."""
    records = []
    used = [set() for _ in field_lines]
    # Use place-name lines as anchors.
    for i, place in enumerate(field_lines[0]):
        rec = {"place": place["text"], "cy": place["cy"], "fields": [place]}
        for f_idx in range(1, 4):
            best_j = None
            best_d = y_tol + 1
            for j, line in enumerate(field_lines[f_idx]):
                if j in used[f_idx]:
                    continue
                d = abs(line["cy"] - place["cy"])
                if d < best_d:
                    best_d = d
                    best_j = j
            if best_j is not None:
                used[f_idx].add(best_j)
                rec["fields"].append(field_lines[f_idx][best_j])
            else:
                rec["fields"].append({"text": "", "conf": 0, "cy": place["cy"]})
        records.append(rec)
    return records


def merge_continuation(records):
    """Join wrapped place names (e.g. Chalybeate / Springs) and brace-counties."""
    merged = []
    i = 0
    while i < len(records):
        rec = records[i]
        place = rec["fields"][0]["text"]
        county = rec["fields"][1]["text"]
        p40 = rec["fields"][2]["text"]
        p30 = rec["fields"][3]["text"]
        # Wrapped place: next row has empty/low county and this row has no pops.
        if i + 1 < len(records):
            nxt = records[i + 1]
            nplace = nxt["fields"][0]["text"]
            ncounty = nxt["fields"][1]["text"]
            np40 = nxt["fields"][2]["text"]
            np30 = nxt["fields"][3]["text"]
            this_has_pop = bool(re.search(r"\d", p40 + p30))
            next_has_pop = bool(re.search(r"\d", np40 + np30))
            # two-line place name: first line has no population
            if (not this_has_pop) and next_has_pop and not re.search(r"[A-Za-z]{3}", county):
                place = f"{place} {nplace}".strip()
                county = ncounty or county
                p40, p30 = np40, np30
                rec = nxt
                i += 1
            # two-county brace continuation: county-only next line
            elif this_has_pop and not next_has_pop and re.search(r"[{}]", county + ncounty + nplace):
                extra = ncounty or nplace
                county = f"{county} {extra}".strip()
                i += 1
        merged.append(
            {
                "place": place,
                "county": county,
                "pop1940": p40,
                "pop1930": p30,
                "cy": rec["cy"],
            }
        )
        i += 1
    return merged


def write_panel_files(panel_id: str, records, raw_dir: Path):
    lines = []
    for r in records:
        lines.append(f"{r['place']}\t{r['county']}\t{r['pop1940']}\t{r['pop1930']}")
    (OUT / f"{panel_id}.txt").write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def main():
    if not PDF.exists():
        print(f"missing PDF: {PDF}", file=sys.stderr)
        sys.exit(1)
    OUT.mkdir(parents=True, exist_ok=True)
    extract_scans()
    crops_dir = OUT / "crops"
    raw_dir = OUT / "raw"
    crops_dir.mkdir(exist_ok=True)
    raw_dir.mkdir(exist_ok=True)

    commands = []
    all_records = []
    for page in PAGES:
        src = WORK / page["scan"]
        for panel in page["panels"]:
            panel_box = panel["box"]
            panel_img = crops_dir / f"{panel['id']}.png"
            crop(src, panel_box, panel_img)
            # Full-panel OCR (psm 6 and 4) kept as the 'per column' text.
            for psm in (6, 4):
                dest = raw_dir / f"{panel['id']}-psm{psm}"
                tesseract(panel_img, dest, psm, None)
                commands.append(
                    f"tesseract {panel_img.name} {dest.name} --psm {psm} --dpi 400"
                )
            # Field crops for structured parse.
            field_lines = []
            for kind, box in zip(FIELDS, field_boxes(panel)):
                img = crops_dir / f"{panel['id']}-{kind}.png"
                crop(src, box, img)
                dest = raw_dir / f"{panel['id']}-{kind}-psm6"
                psm = 6
                lines = ocr_field(img, dest, kind, psm)
                # Retry psm 4 if a field looks empty.
                if len(lines) < 5:
                    dest4 = raw_dir / f"{panel['id']}-{kind}-psm4"
                    lines4 = ocr_field(img, dest4, kind, 4)
                    if len(lines4) > len(lines):
                        lines = lines4
                field_lines.append(lines)
                (OUT / f"{panel['id']}-{kind}.txt").write_text(
                    "\n".join(L["text"] for L in lines) + "\n", encoding="utf-8"
                )
            records = merge_continuation(align_fields(field_lines))
            write_panel_files(panel["id"], records, raw_dir)
            for r in records:
                r["panel"] = panel["id"]
                r["page"] = page["page"]
            all_records.extend(records)
            print(f"{panel['id']}: {len(records)} rows", flush=True)

    combined = ["place\tcounty\tpop1940\tpop1930\tpanel\tpage"]
    for r in all_records:
        combined.append(
            f"{r['place']}\t{r['county']}\t{r['pop1940']}\t{r['pop1930']}\t{r['panel']}\t{r['page']}"
        )
    (OUT / "table5-places.tsv").write_text("\n".join(combined) + "\n", encoding="utf-8")
    (OUT / "COMMANDS.txt").write_text(
        "pdfimages -f 21 -l 23 -png census1940-ga.pdf scan\n"
        + "Then magick -crop each panel and each of the four fields; tesseract --psm 6 and --psm 4.\n"
        + "See docs/cc-03-crossings-settlements/seat-verification.md for the exact boxes.\n",
        encoding="utf-8",
    )
    print(f"wrote {len(all_records)} rows to {OUT / 'table5-places.tsv'}")


if __name__ == "__main__":
    main()
