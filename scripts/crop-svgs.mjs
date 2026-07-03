// Crops the raw Illustrator SVG exports (each sits in a huge, mostly-empty
// 1920x1080 canvas with an opaque background rect) down to a tight viewBox
// around the real artwork, and drops the background rect so the mark can be
// placed on any background. Run BEFORE optimize-svgs.mjs.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import svgPathBounds from 'svg-path-bounds';

const SRC_DIR = path.resolve('assets/brand-source');
const OUT_DIR = path.resolve('public/brand');

// Maps source artboard number -> semantic output name, confirmed by
// rasterizing each source file and visually inspecting its contents.
// The whole site is a single dark theme, so only the dark-background
// colorways are needed. (Artboards 11-16 were checked and are monochrome
// black-on-white variants with no icon badge + blue accent combo — not
// useful here.)
const FILE_MAP = {
  '02': 'wordmark-white', // "SILLETTI" wordmark only, white, for dark backgrounds
  '03': 'lockup-dark', // icon (blue badge) + "SILLETTIX" wordmark, white+blue text, for dark backgrounds — primary header/footer logo
  '04': 'icon-blue', // standalone icon, blue badge + black X — favicon / decorative hero motif source
  '06': 'wordmark-accent', // "SILLETTIX" wordmark only (no badge), white+blue text, for dark backgrounds
  '09': 'icon-white', // standalone icon, white badge + black X — for dark backgrounds needing a light badge
};

const PADDING_RATIO = 0.06;

function rectBounds(el) {
  const x = parseFloat(el.x ?? '0');
  const y = parseFloat(el.y ?? '0');
  const w = parseFloat(el.width ?? '0');
  const h = parseFloat(el.height ?? '0');
  return [x, y, x + w, y + h];
}

function parseAttrs(tag) {
  const attrs = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tag))) attrs[m[1]] = m[2];
  return attrs;
}

async function processFile(num, outName) {
  const srcPath = path.join(SRC_DIR, `FO729C90598C5 - rev 2-${num}.svg`);
  const raw = await readFile(srcPath, 'utf8');

  // Pull out <defs>...</defs> (color classes) to preserve verbatim.
  const defsMatch = raw.match(/<defs>[\s\S]*?<\/defs>/);
  const defs = defsMatch ? defsMatch[0] : '';

  // Collect every top-level <rect .../> and <path .../> tag (self-closing,
  // no transforms present in any source file — confirmed before writing this
  // script), whether directly under <svg> or nested one level inside <g>.
  const elementTags = [...raw.matchAll(/<(rect|path)\b[^>]*\/>/g)].map((m) => m[0]);

  const kept = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (const tag of elementTags) {
    const attrs = parseAttrs(tag);
    const isRect = tag.startsWith('<rect');

    if (isRect) {
      const [x0, y0, x1, y1] = rectBounds(attrs);
      const area = (x1 - x0) * (y1 - y0);
      // The oversized background rect covers >90% of the 1920x1080 canvas —
      // drop it so the exported mark has a transparent background.
      if (area > 0.9 * 1920 * 1080) continue;
      minX = Math.min(minX, x0); minY = Math.min(minY, y0);
      maxX = Math.max(maxX, x1); maxY = Math.max(maxY, y1);
      kept.push(tag);
    } else {
      const d = attrs.d;
      if (!d) continue;
      const [x0, y0, x1, y1] = svgPathBounds(d);
      minX = Math.min(minX, x0); minY = Math.min(minY, y0);
      maxX = Math.max(maxX, x1); maxY = Math.max(maxY, y1);
      kept.push(tag);
    }
  }

  if (!kept.length || !Number.isFinite(minX)) {
    throw new Error(`No artwork bounds found for ${srcPath}`);
  }

  const w = maxX - minX;
  const h = maxY - minY;
  const padX = w * PADDING_RATIO;
  const padY = h * PADDING_RATIO;
  const vbX = minX - padX;
  const vbY = minY - padY;
  const vbW = w + padX * 2;
  const vbH = h + padY * 2;

  const out = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX.toFixed(2)} ${vbY.toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}">\n  ${defs}\n  ${kept.join('\n  ')}\n</svg>\n`;

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${outName}.svg`);
  await writeFile(outPath, out, 'utf8');
  console.log(`cropped ${num} -> ${path.relative(process.cwd(), outPath)} (viewBox ${vbX.toFixed(1)} ${vbY.toFixed(1)} ${vbW.toFixed(1)} ${vbH.toFixed(1)})`);
}

async function main() {
  for (const [num, outName] of Object.entries(FILE_MAP)) {
    await processFile(num, outName);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
