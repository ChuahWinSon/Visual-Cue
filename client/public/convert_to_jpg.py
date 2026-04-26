from PIL import Image
from pathlib import Path

images_folder = Path("images")
converted = 0
skipped = 0

for file in images_folder.iterdir():
    if file.suffix.lower() in (".png", ".webp", ".bmp", ".gif", ".tiff"):
        img = Image.open(file).convert("RGB")
        new_path = file.with_suffix(".jpg")
        img.save(new_path, "JPEG", quality=90)
        file.unlink()  # delete the original
        print(f"Converted: {file.name} → {new_path.name}")
        converted += 1
    elif file.suffix.lower() in (".jpg", ".jpeg"):
        print(f"Skipped (already JPG): {file.name}")
        skipped += 1

print(f"\nDone. {converted} converted, {skipped} already JPG.")
