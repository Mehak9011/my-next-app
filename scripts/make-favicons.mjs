/**
 * Generates the site icons from one square source image.
 *
 *   node scripts/make-favicons.mjs [source]
 *
 * Outputs (all committed, so no tooling is needed at build time):
 *   app/favicon.ico       16 / 32 / 48 PNG-in-ICO — legacy fallback + tab icon
 *   app/apple-icon.png    180×180 — iOS / iPadOS home screen
 *
 * The source WebP itself stays at public/images/favicon.webp and is declared
 * in app/layout.tsx metadata (icon for modern browsers).
 *
 * `sharp` ships inside the Next.js install — no extra dependency was added.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = process.argv[2] ?? path.join(root, "public/images/favicon.webp");
const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;

/** Packs PNG buffers into a single .ico container (Vista+ PNG entries). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(16 * entries.length);
  let offset = header.length + directory.length;

  entries.forEach((entry, index) => {
    const base = index * 16;
    // 0 means 256px in the ICO spec.
    directory.writeUInt8(entry.size >= 256 ? 0 : entry.size, base);
    directory.writeUInt8(entry.size >= 256 ? 0 : entry.size, base + 1);
    directory.writeUInt8(0, base + 2); // palette colours
    directory.writeUInt8(0, base + 3); // reserved
    directory.writeUInt16LE(1, base + 4); // colour planes
    directory.writeUInt16LE(32, base + 6); // bits per pixel
    directory.writeUInt32LE(entry.data.length, base + 8);
    directory.writeUInt32LE(offset, base + 12);
    offset += entry.data.length;
  });

  return Buffer.concat([header, directory, ...entries.map((e) => e.data)]);
}

const input = await readFile(source);
const meta = await sharp(input).metadata();

if (!meta.width || !meta.height) {
  throw new Error(`Could not read "${source}" as an image`);
}

const entries = [];
for (const size of ICO_SIZES) {
  const data = await sharp(input)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  entries.push({ size, data });
}

await writeFile(path.join(root, "app/favicon.ico"), buildIco(entries));
await sharp(input)
  .resize(APPLE_SIZE, APPLE_SIZE, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toFile(path.join(root, "app/apple-icon.png"));

console.log(
  `Icons generated from ${path.relative(root, source)} (${meta.width}×${meta.height}) → ` +
    `app/favicon.ico [${ICO_SIZES.join(", ")}px], app/apple-icon.png [${APPLE_SIZE}px]`
);
