#!/usr/bin/env python3
"""Sync logo assets from assets/ to native iOS and Android resources."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
IOS_PROJ = ROOT / "ios" / "BJSTRAT"
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"

SPLASH_SIZES = {
    "drawable-mdpi": 288,
    "drawable-hdpi": 432,
    "drawable-xhdpi": 576,
    "drawable-xxhdpi": 864,
    "drawable-xxxhdpi": 1152,
}

ADAPTIVE_FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

LEGACY_LAUNCHER_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}


def resize_image(source: Path, size: int) -> Image.Image:
    image = Image.open(source).convert("RGBA")
    return image.resize((size, size), Image.Resampling.LANCZOS)


def save_png(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="PNG", optimize=True)


def save_webp(image: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, format="WEBP", quality=90, method=6)


def sync_ios(icon: Path, splash: Path) -> None:
    app_icon = IOS_PROJ / "Images.xcassets" / "AppIcon.appiconset" / "App-Icon-1024x1024@1x.png"
    save_png(resize_image(icon, 1024), app_icon)

    splash_dir = IOS_PROJ / "Images.xcassets" / "SplashScreenLogo.imageset"
    splash_image = Image.open(splash).convert("RGBA")
    for filename in ("image.png", "image@2x.png", "image@3x.png"):
        save_png(splash_image, splash_dir / filename)


def sync_android(icon: Path, adaptive: Path, splash: Path) -> None:
    for folder, size in SPLASH_SIZES.items():
        save_png(
            resize_image(splash, size),
            ANDROID_RES / folder / "splashscreen_logo.png",
        )

    for folder, size in ADAPTIVE_FOREGROUND_SIZES.items():
        save_webp(
            resize_image(adaptive, size),
            ANDROID_RES / folder / "ic_launcher_foreground.webp",
        )

    for folder, size in LEGACY_LAUNCHER_SIZES.items():
        resized = resize_image(icon, size)
        save_webp(resized, ANDROID_RES / folder / "ic_launcher.webp")
        save_webp(resized, ANDROID_RES / folder / "ic_launcher_round.webp")


def main() -> None:
    icon = ASSETS / "icon.png"
    adaptive = ASSETS / "adaptive-icon.png"
    splash = ASSETS / "splash-icon.png"

    for path in (icon, adaptive, splash):
        if not path.exists():
            raise SystemExit(f"Missing asset: {path}")

    if IOS_PROJ.exists():
        sync_ios(icon, splash)
        print(f"Synced iOS assets in {IOS_PROJ.relative_to(ROOT)}")

    if ANDROID_RES.exists():
        sync_android(icon, adaptive, splash)
        print(f"Synced Android assets in {ANDROID_RES.relative_to(ROOT)}")

    print("Done. assets/ is now the source for splash, startup, and production icons.")


if __name__ == "__main__":
    main()
