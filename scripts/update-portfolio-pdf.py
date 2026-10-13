"""Update the existing image-based reader; never rewrite the supplied PDF.

Requires Python with pypdf and Pillow, plus Poppler's pdftoppm and Node.js.
Usage: python scripts/update-portfolio-pdf.py SOURCE.pdf --expected-pages 38
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF = "assets/documents/wang-zengzeng-portfolio.pdf"
CONTENT = "portfolio-pdf-content.json"
MANIFEST = "portfolio-pdf-source.json"


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def write_json(file, value):
    file.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--expected-pages", type=int, required=True)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    reader = PdfReader(source)
    if reader.is_encrypted or len(reader.pages) != args.expected_pages:
        raise ValueError("PDF is encrypted or its page count differs from --expected-pages.")
    for tool in ("pdftoppm", "node"):
        if not shutil.which(tool):
            raise RuntimeError(f"Missing required tool: {tool}")
    # Preserve even mixed CRLF/LF line endings in the hand-maintained homepage.
    index = (ROOT / "index.html").read_bytes().decode("utf-8")
    index, count = re.subn(r"在线阅读 · \d+ 页", f"在线阅读 · {len(reader.pages)} 页", index)
    if count != 1:
        raise ValueError("Expected exactly one portfolio page-count label in index.html.")
    index, count = re.subn(r'(class="contact-download contact-download--view" href=")[^"]+',
                           lambda m: m.group(1) + "/portfolio", index)
    if count != 1:
        raise ValueError("Expected exactly one portfolio reader button.")
    current_html = (ROOT / "portfolio.html").read_text(encoding="utf-8")
    if len(re.findall(r'<dialog class="lightbox"[\s\S]*?</dialog>', current_html)) != 1:
        raise ValueError("Expected the existing shared reader lightbox.")

    # Render everything before touching any existing project files.
    work = Path(tempfile.mkdtemp(prefix="wzz-pdf-update-"))
    staged = work / "generated"
    images = staged / "assets/images"
    images.mkdir(parents=True)
    (staged / PDF).parent.mkdir(parents=True)
    shutil.copyfile(source, staged / PDF)
    source_hash = sha(source)
    pages = []
    for number in range(1, len(reader.pages) + 1):
        prefix = work / "render"
        subprocess.run(["pdftoppm", "-f", str(number), "-l", str(number), "-singlefile",
                        "-scale-to-x", "1920", "-scale-to-y", "-1", "-png",
                        str(staged / PDF), str(prefix)], check=True, capture_output=True)
        with Image.open(prefix.with_suffix(".png")) as rendered:
            image = rendered.convert("RGB")
        width, height = image.size
        page = {"title": f"第{number:02d}页", "original": f"assets/images/portfolio-pdf-{number:02d}.jpg",
                "width": width, "height": height, "strips": []}
        image.save(staged / page["original"], quality=95, subsampling=0, optimize=True)
        for strip_number, top in enumerate(range(0, height, 2400), 1):
            bottom = min(top + 2400, height)
            src = f"assets/images/portfolio-pdf-{number:02d}-{strip_number:02d}.webp"
            image.crop((0, top, width, bottom)).save(staged / src, quality=92, method=6)
            page["strips"].append({"src": src, "width": width, "height": bottom - top})
        pages.append(page)
        print(f"Rendered {number}/{len(reader.pages)}: {width}x{height}", flush=True)
    if sha(source) != source_hash or sha(staged / PDF) != source_hash:
        raise ValueError("Source PDF changed while rendering.")
    write_json(staged / CONTENT, pages)
    assets = [p["original"] for p in pages] + [s["src"] for p in pages for s in p["strips"]]
    write_json(staged / MANIFEST, {
        "pdf": PDF, "sha256": source_hash, "pageCount": len(pages),
        "renderWidth": 1920, "stripHeight": 2400,
        "contentSha256": hashlib.sha256((staged / CONTENT).read_bytes().replace(b"\r\n", b"\n")).hexdigest(),
        "assets": {asset: sha(staged / asset) for asset in assets}
    })
    (staged / "index.html").write_bytes(index.encode("utf-8"))

    # Keep recoverable copies outside the repository, including obsolete slices.
    backup = work / "previous"
    old_assets = set("assets/images/" + p.name for p in (ROOT / "assets/images").glob("portfolio-pdf-*")
                     if re.fullmatch(r"portfolio-pdf-\d+(?:-\d+)?\.(?:jpg|webp)", p.name))
    replacements = assets + [PDF, CONTENT, MANIFEST, "index.html"]
    for name in sorted(set(replacements) | old_assets | {"portfolio.html"}):
        target = ROOT / name
        if target.exists():
            (backup / name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(target, backup / name)
    for name in replacements:
        shutil.copyfile(staged / name, ROOT / name)
    obsolete = sorted(old_assets - set(assets))
    for name in obsolete:
        archived = work / "obsolete" / name
        archived.parent.mkdir(parents=True, exist_ok=True)
        (ROOT / name).rename(archived)
    subprocess.run(["node", "-e", "const fs=require('fs'); const html=fs.readFileSync('portfolio.html','utf8'); "
                    "require('./portfolio-pdf.cjs').writePortfolioDocument(html.match(/<dialog class=\"lightbox\"[\\s\\S]*?<\\/dialog>/)[0]);"],
                   cwd=ROOT, check=True)
    print(json.dumps({"pages": len(pages), "images": len(assets), "sha256": source_hash,
                      "backup": str(backup), "archivedObsolete": obsolete}, ensure_ascii=True))


if __name__ == "__main__":
    main()
