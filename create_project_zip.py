import os
import zipfile
import shutil

ROOT_DIR = "/app/applet"
ZIP_FILENAME = "sensei-bm-projek-lengkap.zip"
OUTPUT_ROOT_ZIP = os.path.join(ROOT_DIR, ZIP_FILENAME)
DIST_DIR = os.path.join(ROOT_DIR, "dist")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

# Exclude unnecessary bloated folders like node_modules, git, cache
EXCLUDE_DIRS = {
    "node_modules",
    ".git",
    ".vite",
    ".cache",
    "__pycache__"
}

print(f"Creating ZIP archive: {OUTPUT_ROOT_ZIP}...")

with zipfile.ZipFile(OUTPUT_ROOT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(ROOT_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith(".")]

        for file in files:
            # Skip the zip file itself and temp files
            if file == ZIP_FILENAME or file.endswith(".tmp") or file.endswith(".swp"):
                continue

            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, ROOT_DIR)
            zf.write(full_path, arcname=rel_path)

print(f"Archive created successfully: {os.path.getsize(OUTPUT_ROOT_ZIP)} bytes")

# Copy to dist/ and public/
dist_zip = os.path.join(DIST_DIR, ZIP_FILENAME)
public_zip = os.path.join(PUBLIC_DIR, ZIP_FILENAME)

shutil.copyfile(OUTPUT_ROOT_ZIP, dist_zip)
shutil.copyfile(OUTPUT_ROOT_ZIP, public_zip)

print(f"Copied to {dist_zip}")
print(f"Copied to {public_zip}")
