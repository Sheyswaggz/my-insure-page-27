#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * Processes images in src/assets/images/, generates WebP versions,
 * compresses JPG/PNG files, and outputs to dist/assets/images/.
 * 
 * Features:
 * - Batch processing with parallel execution
 * - WebP generation with fallbacks
 * - Progressive JPEG optimization
 * - PNG compression with quality preservation
 * - Comprehensive error handling and logging
 * - Progress tracking and reporting
 * 
 * Usage: node scripts/optimize-images.js
 * 
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

/* Get current file directory for ES modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Configuration */
const CONFIG = Object.freeze({
  SOURCE_DIR: path.resolve(__dirname, '../src/assets/images'),
  OUTPUT_DIR: path.resolve(__dirname, '../dist/assets/images'),
  SUPPORTED_FORMATS: ['.jpg', '.jpeg', '.png'],
  WEBP_QUALITY: 85,
  JPEG_QUALITY: 85,
  PNG_QUALITY: 90,
  MAX_FILE_SIZE_KB: 200,
  PARALLEL_LIMIT: 4,
  PROGRESSIVE_JPEG: true,
  STRIP_METADATA: true,
});

/* Logging utilities */
const Logger = {
  info(message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 
      ? ` ${JSON.stringify(metadata)}` 
      : '';
    console.log(`[${timestamp}] [INFO] ${message}${metaStr}`);
  },

  warn(message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 
      ? ` ${JSON.stringify(metadata)}` 
      : '';
    console.warn(`[${timestamp}] [WARN] ${message}${metaStr}`);
  },

  error(message, error = null, metadata = {}) {
    const timestamp = new Date().toISOString();
    const errorStr = error ? ` Error: ${error.message}` : '';
    const metaStr = Object.keys(metadata).length > 0 
      ? ` ${JSON.stringify(metadata)}` 
      : '';
    console.error(`[${timestamp}] [ERROR] ${message}${errorStr}${metaStr}`);
    if (error && error.stack) {
      console.error(error.stack);
    }
  },

  success(message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 
      ? ` ${JSON.stringify(metadata)}` 
      : '';
    console.log(`[${timestamp}] [SUCCESS] ${message}${metaStr}`);
  },
};

/* Statistics tracking */
class OptimizationStats {
  constructor() {
    this.processed = 0;
    this.succeeded = 0;
    this.failed = 0;
    this.skipped = 0;
    this.totalOriginalSize = 0;
    this.totalOptimizedSize = 0;
    this.errors = [];
    this.startTime = Date.now();
  }

  recordSuccess(originalSize, optimizedSize) {
    this.processed++;
    this.succeeded++;
    this.totalOriginalSize += originalSize;
    this.totalOptimizedSize += optimizedSize;
  }

  recordFailure(filename, error) {
    this.processed++;
    this.failed++;
    this.errors.push({ filename, error: error.message });
  }

  recordSkip() {
    this.skipped++;
  }

  getSummary() {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const savedBytes = this.totalOriginalSize - this.totalOptimizedSize;
    const savedPercentage = this.totalOriginalSize > 0
      ? ((savedBytes / this.totalOriginalSize) * 100).toFixed(2)
      : 0;

    return {
      duration: `${duration}s`,
      processed: this.processed,
      succeeded: this.succeeded,
      failed: this.failed,
      skipped: this.skipped,
      originalSize: this.formatBytes(this.totalOriginalSize),
      optimizedSize: this.formatBytes(this.totalOptimizedSize),
      saved: this.formatBytes(savedBytes),
      savedPercentage: `${savedPercentage}%`,
      errors: this.errors,
    };
  }

  formatBytes(bytes) {
    if (bytes === 0) {
      return '0 B';
    }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

/* File system utilities */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
      Logger.info('Created directory', { path: dirPath });
    } else {
      throw error;
    }
  }
}

async function getImageFiles(directory) {
  try {
    await fs.access(directory);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Source directory does not exist: ${directory}`);
    }
    throw error;
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const imageFiles = [];

  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.SUPPORTED_FORMATS.includes(ext)) {
        imageFiles.push(path.join(directory, entry.name));
      }
    }
  }

  return imageFiles;
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    Logger.error('Failed to get file size', error, { path: filePath });
    return 0;
  }
}

/* Image optimization functions */
async function optimizeImage(inputPath, outputPath, format) {
  const ext = path.extname(inputPath).toLowerCase();
  let pipeline = sharp(inputPath);

  /* Strip metadata if configured */
  if (CONFIG.STRIP_METADATA) {
    pipeline = pipeline.rotate(); // Auto-rotate based on EXIF, then strip
  }

  /* Apply format-specific optimizations */
  if (format === 'webp') {
    pipeline = pipeline.webp({
      quality: CONFIG.WEBP_QUALITY,
      effort: 6, // Higher effort for better compression
    });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: CONFIG.JPEG_QUALITY,
      progressive: CONFIG.PROGRESSIVE_JPEG,
      mozjpeg: true, // Use mozjpeg for better compression
    });
  } else if (ext === '.png') {
    pipeline = pipeline.png({
      quality: CONFIG.PNG_QUALITY,
      compressionLevel: 9,
      adaptiveFiltering: true,
    });
  }

  await pipeline.toFile(outputPath);
}

async function processImage(inputPath, outputDir, stats) {
  const filename = path.basename(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  const nameWithoutExt = path.basename(inputPath, ext);

  Logger.info('Processing image', { file: filename });

  try {
    /* Get original file size */
    const originalSize = await getFileSize(inputPath);

    /* Generate output paths */
    const optimizedPath = path.join(outputDir, filename);
    const webpPath = path.join(outputDir, `${nameWithoutExt}.webp`);

    /* Optimize original format */
    await optimizeImage(inputPath, optimizedPath, ext.slice(1));
    const optimizedSize = await getFileSize(optimizedPath);

    /* Generate WebP version */
    await optimizeImage(inputPath, webpPath, 'webp');
    const webpSize = await getFileSize(webpPath);

    /* Check if optimized file exceeds size limit */
    const optimizedSizeKB = optimizedSize / 1024;
    const webpSizeKB = webpSize / 1024;

    if (optimizedSizeKB > CONFIG.MAX_FILE_SIZE_KB) {
      Logger.warn('Optimized file exceeds size limit', {
        file: filename,
        size: `${optimizedSizeKB.toFixed(2)} KB`,
        limit: `${CONFIG.MAX_FILE_SIZE_KB} KB`,
      });
    }

    /* Record statistics */
    stats.recordSuccess(originalSize, optimizedSize + webpSize);

    Logger.success('Image optimized', {
      file: filename,
      original: stats.formatBytes(originalSize),
      optimized: stats.formatBytes(optimizedSize),
      webp: stats.formatBytes(webpSize),
      saved: stats.formatBytes(originalSize - optimizedSize),
    });

    return {
      success: true,
      filename,
      originalSize,
      optimizedSize,
      webpSize,
    };
  } catch (error) {
    stats.recordFailure(filename, error);
    Logger.error('Failed to process image', error, { file: filename });
    return {
      success: false,
      filename,
      error: error.message,
    };
  }
}

/* Parallel processing with concurrency limit */
async function processImagesInParallel(imageFiles, outputDir, stats) {
  const results = [];
  const queue = [...imageFiles];
  const inProgress = new Set();

  while (queue.length > 0 || inProgress.size > 0) {
    /* Start new tasks up to parallel limit */
    while (queue.length > 0 && inProgress.size < CONFIG.PARALLEL_LIMIT) {
      const imagePath = queue.shift();
      const promise = processImage(imagePath, outputDir, stats)
        .then((result) => {
          inProgress.delete(promise);
          return result;
        })
        .catch((error) => {
          inProgress.delete(promise);
          Logger.error('Unexpected error in parallel processing', error);
          return {
            success: false,
            filename: path.basename(imagePath),
            error: error.message,
          };
        });

      inProgress.add(promise);
      results.push(promise);
    }

    /* Wait for at least one task to complete */
    if (inProgress.size > 0) {
      await Promise.race(inProgress);
    }
  }

  return Promise.all(results);
}

/* Validation functions */
function validateConfiguration() {
  const errors = [];

  if (!CONFIG.SOURCE_DIR) {
    errors.push('SOURCE_DIR is not configured');
  }

  if (!CONFIG.OUTPUT_DIR) {
    errors.push('OUTPUT_DIR is not configured');
  }

  if (CONFIG.WEBP_QUALITY < 1 || CONFIG.WEBP_QUALITY > 100) {
    errors.push('WEBP_QUALITY must be between 1 and 100');
  }

  if (CONFIG.JPEG_QUALITY < 1 || CONFIG.JPEG_QUALITY > 100) {
    errors.push('JPEG_QUALITY must be between 1 and 100');
  }

  if (CONFIG.PNG_QUALITY < 1 || CONFIG.PNG_QUALITY > 100) {
    errors.push('PNG_QUALITY must be between 1 and 100');
  }

  if (CONFIG.PARALLEL_LIMIT < 1) {
    errors.push('PARALLEL_LIMIT must be at least 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/* Main execution */
async function main() {
  Logger.info('Starting image optimization', {
    sourceDir: CONFIG.SOURCE_DIR,
    outputDir: CONFIG.OUTPUT_DIR,
    parallelLimit: CONFIG.PARALLEL_LIMIT,
  });

  const stats = new OptimizationStats();

  try {
    /* Validate configuration */
    validateConfiguration();

    /* Ensure output directory exists */
    await ensureDirectory(CONFIG.OUTPUT_DIR);

    /* Get all image files */
    const imageFiles = await getImageFiles(CONFIG.SOURCE_DIR);

    if (imageFiles.length === 0) {
      Logger.warn('No images found to process', {
        directory: CONFIG.SOURCE_DIR,
        supportedFormats: CONFIG.SUPPORTED_FORMATS,
      });
      return;
    }

    Logger.info('Found images to process', { count: imageFiles.length });

    /* Process images in parallel */
    await processImagesInParallel(imageFiles, CONFIG.OUTPUT_DIR, stats);

    /* Print summary */
    const summary = stats.getSummary();
    Logger.success('Image optimization completed', summary);

    /* Exit with error code if any failures */
    if (stats.failed > 0) {
      Logger.error('Some images failed to process', null, {
        failedCount: stats.failed,
        errors: summary.errors,
      });
      process.exit(1);
    }
  } catch (error) {
    Logger.error('Image optimization failed', error);
    process.exit(1);
  }
}

/* Handle unhandled rejections */
process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled rejection', reason instanceof Error ? reason : new Error(String(reason)));
  process.exit(1);
});

/* Handle uncaught exceptions */
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception', error);
  process.exit(1);
});

/* Execute main function */
main();