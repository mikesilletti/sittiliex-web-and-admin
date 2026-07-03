// Generates raster favicons from the cropped blue icon mark.
// Run after crop-svgs.mjs (needs public/brand/icon-blue.svg to exist).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'public/brand/icon-blue.svg';

async function main() {
  await mkdir('src/app', { recursive: true });
  await sharp(SRC).resize(512, 512).png().toFile('src/app/icon.png');
  await sharp(SRC).resize(180, 180).png().toFile('src/app/apple-icon.png');
  console.log('favicons written to src/app/icon.png and src/app/apple-icon.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
