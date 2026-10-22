/**
 * Copy existing Fermi artwork to same-origin public assets during build.
 * Keeps original pixels; a failed download never breaks the PWA build.
 * Assets are fetched only when missing (or FERMI_REFRESH_IMAGES=1).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.join(process.cwd(), "public", "images", "fermi");
const raw = "https://raw.githubusercontent.com/wanderwerkhoven-afk/Fermi-PWA";
const assets = [
  ["fermi-name-page.png", `${raw}/main/Fermi-name-page.png`],
  ["voorzitter-container.png", `${raw}/b119114b57460146413d68fee5b32ccae0350249/Voorzitter-container.png`],
  ["secretaris-container.png", `${raw}/b119114b57460146413d68fee5b32ccae0350249/Secretaris-container.png`],
  ["penningmeester-container.png", `${raw}/b119114b57460146413d68fee5b32ccae0350249/Penningmeester-container.png`],
];
await mkdir(root, { recursive: true });
for (const [filename, url] of assets) {
  const target = path.join(root, filename);
  if (process.env.FERMI_REFRESH_IMAGES !== "1") {
    try { if ((await readFile(target)).length > 100) continue; } catch {}
  }
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 100 || !bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
      throw new Error("Invalid PNG response");
    }
    await writeFile(target, bytes);
    console.log(`Fermi artwork: ${filename} (${Math.round(bytes.length/1024)} KiB)`);
  } catch (error) {
    console.warn(`Fermi artwork: ${filename} unavailable; using remote fallback (${error.message})`);
  }
}

const presets = [
  ["fermi-name-page.png", 900],
  ["voorzitter-container.png", 700],
  ["secretaris-container.png", 700],
  ["penningmeester-container.png", 700],
];
for (const [filename, width] of presets) {
  const source = path.join(root, filename);
  const destination = path.join(root, filename.replace(/\.png$/i, ".webp"));
  try {
    const input = await readFile(source);
    const output = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, alphaQuality: 90 })
      .toBuffer();
    await writeFile(destination, output);
    console.log(`WebP: ${path.basename(destination)} ${Math.round(input.length / 1024)} KiB -> ${Math.round(output.length / 1024)} KiB`);
  } catch (error) {
    throw new Error(`Unable to generate required WebP ${filename}: ${error.message}`);
  }
}
