import sharp from 'sharp';
import { optimize } from 'svgo';
import fs from 'fs/promises';
import path from 'path';

const INPUT_DIR = 'src/assets';
const OUTPUT_DIR = 'src/assets/optimized';

const IMAGE_FORMATS = {
  jpeg: { quality: 85, progressive: true },
  png: { compressionLevel: 9, progressive: true },
  webp: { quality: 85, effort: 6 },
  avif: { quality: 80, effort: 6 },
};

const SVG_CONFIG = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: false,
        },
      },
    },
    'removeDimensions',
    'removeStyleElement',
    'removeScriptElement',
  ],
};

async function ensureDir(dir) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath);
  return (stats.size / 1024).toFixed(2);
}

async function optimizeImage(inputPath, outputDir) {
  const ext = path.extname(inputPath).toLowerCase();
  const filename = path.basename(inputPath, ext);
  const originalSizeKB = await getFileSize(inputPath);

  console.info(`Processing: ${filename}${ext} (${originalSizeKB} KB)`);

  if (ext === '.svg') {
    const svgContent = await fs.readFile(inputPath, 'utf-8');
    const result = optimize(svgContent, SVG_CONFIG);
    const outputPath = path.join(outputDir, `${filename}.svg`);
    await fs.writeFile(outputPath, result.data);
    const optimizedSizeKB = await getFileSize(outputPath);
    console.info(`  ✓ SVG: ${optimizedSizeKB} KB (${((1 - optimizedSizeKB / originalSizeKB) * 100).toFixed(1)}% reduction)`);
    return;
  }

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Generate WebP
  const webpPath = path.join(outputDir, `${filename}.webp`);
  await image
    .webp(IMAGE_FORMATS.webp)
    .toFile(webpPath);
  const webpSizeKB = await getFileSize(webpPath);
  console.info(`  ✓ WebP: ${webpSizeKB} KB`);

  // Generate AVIF
  const avifPath = path.join(outputDir, `${filename}.avif`);
  await image
    .avif(IMAGE_FORMATS.avif)
    .toFile(avifPath);
  const avifSizeKB = await getFileSize(avifPath);
  console.info(`  ✓ AVIF: ${avifSizeKB} KB`);

  // Optimize original format
  const optimizedPath = path.join(outputDir, `${filename}${ext}`);
  if (ext === '.jpg' || ext === '.jpeg') {
    await image
      .jpeg(IMAGE_FORMATS.jpeg)
      .toFile(optimizedPath);
  } else if (ext === '.png') {
    await image
      .png(IMAGE_FORMATS.png)
      .toFile(optimizedPath);
  }
  const optimizedSizeKB = await getFileSize(optimizedPath);
  console.info(`  ✓ ${ext.toUpperCase()}: ${optimizedSizeKB} KB (${((1 - optimizedSizeKB / originalSizeKB) * 100).toFixed(1)}% reduction)`);
}

async function processDirectory(inputDir, outputDir) {
  await ensureDir(outputDir);

  const entries = await fs.readdir(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    const inputPath = path.join(inputDir, entry.name);
    const outputPath = path.join(outputDir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(inputPath, outputPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.svg'].includes(ext)) {
        await optimizeImage(inputPath, outputDir);
      }
    }
  }
}

async function generateSrcset(outputDir) {
  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  const srcsetMap = {};

  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const basename = path.basename(entry.name, ext);

      if (!srcsetMap[basename]) {
        srcsetMap[basename] = {};
      }

      srcsetMap[basename][ext.slice(1)] = entry.name;
    }
  }

  const srcsetPath = path.join(outputDir, 'srcset.json');
  await fs.writeFile(srcsetPath, JSON.stringify(srcsetMap, null, 2));
  console.info('\n✓ Generated srcset.json');
}

async function main() {
  console.info('🖼️  Starting image optimization...\n');

  try {
    await processDirectory(INPUT_DIR, OUTPUT_DIR);
    await generateSrcset(OUTPUT_DIR);
    console.info('\n✅ Image optimization complete!');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

main();