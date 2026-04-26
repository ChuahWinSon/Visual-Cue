from pathlib import Path

images_folder = Path("images")

files = sorted(f for f in images_folder.iterdir() if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"))

lines = ["const IMAGE_DB = ["]
for i, file in enumerate(files, 1):
    label = file.stem.replace("-", " ").replace("_", " ").title()
    lines.append(f'  {{ id: "img{i:02d}", url: "/images/{file.name}", label: "{label}" }},')
lines.append("];")

output = "\n".join(lines)
print(output)

with open("image_db.js", "w") as f:
    f.write(output)

print(f"\n✓ {len(files)} images written to image_db.js")
