#!/usr/bin/env python3
"""Generate BJ STRAT ace-of-spades logo assets."""

from __future__ import annotations

import io
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"

BG = "#0d0d18"
CARD = "#ffffff"
INK = "#141414"
STROKE = "#3a3a4a"


def spade_path(cx: float, cy: float, size: float) -> str:
    s = size / 2
    return (
        f"M {cx} {cy - s} "
        f"C {cx - s * 0.92} {cy - s * 0.18}, {cx - s * 0.72} {cy + s * 0.52}, {cx} {cy + s * 0.16} "
        f"C {cx + s * 0.72} {cy + s * 0.52}, {cx + s * 0.92} {cy - s * 0.18}, {cx} {cy - s} "
        f"M {cx - s * 0.24} {cy + s * 0.56} "
        f"L {cx} {cy + s} "
        f"L {cx + s * 0.24} {cy + s * 0.56} "
        f"Z"
    )


def ace_card_svg(*, dark_bg: bool) -> str:
    bg_rect = (
        f'<rect x="0" y="0" width="100" height="100" rx="22" fill="{BG}"/>'
        if dark_bg
        else ""
    )
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  {bg_rect}
  <rect x="10" y="8" width="80" height="84" rx="10" fill="{CARD}" stroke="{STROKE}" stroke-width="1.2"/>
  <text x="18" y="24" font-size="14" font-weight="700" font-family="Georgia, 'Times New Roman', serif" fill="{INK}">A</text>
  <path d="{spade_path(18, 34, 10)}" fill="{INK}"/>
  <g transform="rotate(180 50 50)">
    <text x="18" y="24" font-size="14" font-weight="700" font-family="Georgia, 'Times New Roman', serif" fill="{INK}">A</text>
    <path d="{spade_path(18, 34, 10)}" fill="{INK}"/>
  </g>
  <path d="{spade_path(50, 46, 52)}" fill="{INK}"/>
</svg>"""


def render_png(svg: str, size: int) -> Image.Image:
    png_bytes = cairosvg.svg2png(bytestring=svg.encode(), output_width=size, output_height=size)
    return Image.open(io.BytesIO(png_bytes)).convert("RGBA")


def save_png(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.suffix.lower() == ".webp":
        img.save(path, format="WEBP", quality=95)
    else:
        img.save(path, format="PNG", optimize=True)


def main() -> None:
    icon_svg = ace_card_svg(dark_bg=True)
    foreground_svg = ace_card_svg(dark_bg=False)

    icon_1024 = render_png(icon_svg, 1024)
    foreground_1024 = render_png(foreground_svg, 1024)

    save_png(icon_1024, ASSETS / "icon.png")
    save_png(foreground_1024, ASSETS / "adaptive-icon.png")
    save_png(foreground_1024, ASSETS / "splash-icon.png")
    save_png(render_png(foreground_svg, 48), ASSETS / "favicon.png")

    ios_icon = ROOT / "ios/blackjackstrategy/Images.xcassets/AppIcon.appiconset/App-Icon-1024x1024@1x.png"
    save_png(icon_1024, ios_icon)

    splash_ios = ROOT / "ios/blackjackstrategy/Images.xcassets/SplashScreenLogo.imageset"
    for name in ("image.png", "image@2x.png", "image@3x.png"):
        save_png(foreground_1024, splash_ios / name)

    splash_sizes = {
        "drawable-mdpi": 288,
        "drawable-hdpi": 432,
        "drawable-xhdpi": 576,
        "drawable-xxhdpi": 864,
        "drawable-xxxhdpi": 1152,
    }
    for folder, size in splash_sizes.items():
        save_png(
            render_png(foreground_svg, size),
            ROOT / f"android/app/src/main/res/{folder}/splashscreen_logo.png",
        )

    mipmap_sizes = {
        "mipmap-mdpi": 108,
        "mipmap-hdpi": 162,
        "mipmap-xhdpi": 216,
        "mipmap-xxhdpi": 324,
        "mipmap-xxxhdpi": 432,
    }
    for folder, size in mipmap_sizes.items():
        fg = render_png(foreground_svg, size)
        save_png(fg, ROOT / f"android/app/src/main/res/{folder}/ic_launcher_foreground.webp")

    legacy_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, size in legacy_sizes.items():
        fg = render_png(foreground_svg, size)
        composite = Image.new("RGBA", (size, size), CARD)
        composite.alpha_composite(fg)
        save_png(composite, ROOT / f"android/app/src/main/res/{folder}/ic_launcher.webp")
        save_png(composite, ROOT / f"android/app/src/main/res/{folder}/ic_launcher_round.webp")

    print("Generated ace logo assets.")


if __name__ == "__main__":
    main()
