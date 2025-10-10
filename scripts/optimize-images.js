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
 * Usage: node scripts/optimize-images.js [options]
 * Options:
 *   --quality <number>  JPEG/WebP quality (1-100, default: 85)
 *   --parallel <number> Parallel processing limit (default: 4)
 *   --dry-run          Show what would be done without processing
 *   --verbose          Enable detailed logging
 * 
 * @requires sharp ^0.33.0
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

/* Script metadata */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Configuration with defaults */
const CONFIG = {
  sourceDir: path.resolve(__dirname, '../src/assets/images'),
  outputDir: path.resolve(__dirname, '../dist/assets/images'),
  quality: {
    jpeg: 85,
    webp: 85,
    png: 90,
  },
  maxParallel: 4,
  supportedFormats: ['.jpg', '.jpeg', '.png'],
  maxFileSizeKB: 200,
  dryRun: false,
  verbose: false,
};

/* Logging utilities */
const Logger = {
  info: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] ${message}`, CONFIG.verbose && Object.keys(data).length > 0 ? data : '');
  },
  
  warn: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] ${message}`, CONFIG.verbose && Object.keys(data).length > 0 ? data : '');
  },
  
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] ${message}`);
    if (error && CONFIG.verbose) {
      console.error('Error details:', error);
    }
  },
  
  success: (message, data = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SUCCESS] ${message}`, CONFIG.verbose && Object.keys(data).length > 0 ? data : '');
  },
  
  progress: (current, total, message = '') => {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) ${message}`);
    if (current === total) {
      process.stdout.write('\n');
    }
  },
};

/* Statistics tracking */
class OptimizationStats {
  constructor() {
    this.processed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.totalOriginalSize = 0;
    this.totalOptimizedSize = 0;
    this.startTime = Date.now();
    this.errors = [];
  }

  addProcessed(originalSize, optimizedSize) {
    this.processed++;
    this.totalOriginalSize += originalSize;
    this.totalOptimizedSize += optimizedSize;
  }

  addFailed(filename, error) {
    this.failed++;
    this.errors.push({ filename, error: error.message });
  }

  addSkipped() {
    this.skipped++;
  }

  getSavingsPercentage() {
    if (this.totalOriginalSize === 0) {
      return 0;
    }
    return Math.round(((this.totalOriginalSize - this.totalOptimizedSize) / this.totalOriginalSize) * 100);
  }

  getDuration() {
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  report() {
    const duration = this.getDuration();
    const savings = this.getSavingsPercentage();
    const originalSizeMB = (this.totalOriginalSize / 1024 / 1024).toFixed(2);
    const optimizedSizeMB = (this.totalOptimizedSize / 1024 / 1024).toFixed(2);

    Logger.info('\n=== Optimization Summary ===');
    Logger.info(`Duration: ${duration}s`);
    Logger.info(`Processed: ${this.processed} images`);
    Logger.info(`Failed: ${this.failed} images`);
    Logger.info(`Skipped: ${this.skipped} images`);
    Logger.info(`Original size: ${originalSizeMB} MB`);
    Logger.info(`Optimized size: ${optimizedSizeMB} MB`);
    Logger.info(`Savings: ${savings}% (${(this.totalOriginalSize - this.totalOptimizedSize) / 1024 / 1024} MB)`);

    if (this.errors.length > 0) {
      Logger.warn('\nErrors encountered:');
      this.errors.forEach(({ filename, error }) => {
        Logger.error(`  - ${filename}: ${error}`);
      });
    }
  }
}

/* Argument parsing */
function parseArguments() {
  const args = process.argv.slice(2);
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--quality':
        const quality = parseInt(args[++i], 10);
        if (isNaN(quality) || quality < 1 || quality > 100) {
          throw new Error('Quality must be a number between 1 and 100');
        }
        CONFIG.quality.jpeg = quality;
        CONFIG.quality.webp = quality;
        break;
        
      case '--parallel':
        const parallel = parseInt(args[++i], 10);
        if (isNaN(parallel) || parallel < 1) {
          throw new Error('Parallel must be a positive number');
        }
        CONFIG.maxParallel = parallel;
        break;
        
      case '--dry-run':
        CONFIG.dryRun = true;
        break;
        
      case '--verbose':
        CONFIG.verbose = true;
        break;
        
      case '--help':
      case '-h':
        console.log(`
Image Optimization Script

Usage: node scripts/optimize-images.js [options]

Options:
  --quality <number>   JPEG/WebP quality (1-100, default: 85)
  --parallel <number>  Parallel processing limit (default: 4)
  --dry-run           Show what would be done without processing
  --verbose           Enable detailed logging
  --help, -h          Show this help message

Examples:
  node scripts/optimize-images.js
  node scripts/optimize-images.js --quality 90 --parallel 8
  node scripts/optimize-images.js --dry-run --verbose
        `);
        process.exit(0);
        break;
        
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
}

/* File system utilities */
async function ensureDirectory(dirPath) {
  try {
    await fs.access(dirPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
      Logger.info(`Created directory: ${dirPath}`);
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
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      const subFiles = await getImageFiles(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.supportedFormats.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    Logger.error(`Failed to get file size for ${filePath}`, error);
    return 0;
  }
}

/* Image optimization functions */
async function optimizeImage(inputPath, outputDir, stats) {
  const filename = path.basename(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  const nameWithoutExt = path.basename(inputPath, ext);
  
  try {
    Logger.info(`Processing: ${filename}`, { verbose: CONFIG.verbose });

    /* Get original file size */
    const originalSize = await getFileSize(inputPath);

    /* Calculate relative path to maintain directory structure */
    const relativePath = path.relative(CONFIG.sourceDir, path.dirname(inputPath));
    const targetDir = path.join(outputDir, relativePath);
    await ensureDirectory(targetDir);

    /* Load image with Sharp */
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    Logger.info(`Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`, {
      verbose: CONFIG.verbose,
    });

    let totalOptimizedSize = 0;

    /* Generate WebP version */
    const webpPath = path.join(targetDir, `${nameWithoutExt}.webp`);
    if (!CONFIG.dryRun) {
      await image
        .clone()
        .webp({ 
          quality: CONFIG.quality.webp,
          effort: 6,
        })
        .toFile(webpPath);
      
      const webpSize = await getFileSize(webpPath);
      totalOptimizedSize += webpSize;
      
      Logger.info(`Generated WebP: ${webpPath} (${(webpSize / 1024).toFixed(2)} KB)`, {
        verbose: CONFIG.verbose,
      });
    } else {
      Logger.info(`[DRY RUN] Would generate WebP: ${webpPath}`);
    }

    /* Optimize original format */
    const optimizedPath = path.join(targetDir, filename);
    
    if (!CONFIG.dryRun) {
      if (ext === '.png') {
        await image
          .clone()
          .png({
            quality: CONFIG.quality.png,
            compressionLevel: 9,
            adaptiveFiltering: true,
          })
          .toFile(optimizedPath);
      } else {
        /* JPEG optimization */
        await image
          .clone()
          .jpeg({
            quality: CONFIG.quality.jpeg,
            progressive: true,
            mozjpeg: true,
          })
          .toFile(optimizedPath);
      }

      const optimizedSize = await getFileSize(optimizedPath);
      totalOptimizedSize += optimizedSize;

      Logger.info(`Optimized ${ext.toUpperCase()}: ${optimizedPath} (${(optimizedSize / 1024).toFixed(2)} KB)`, {
        verbose: CONFIG.verbose,
      });

      /* Check if optimized file exceeds size budget */
      const optimizedSizeKB = optimizedSize / 1024;
      if (optimizedSizeKB > CONFIG.maxFileSizeKB) {
        Logger.warn(`File exceeds size budget: ${filename} (${optimizedSizeKB.toFixed(2)} KB > ${CONFIG.maxFileSizeKB} KB)`);
      }

      stats.addProcessed(originalSize, totalOptimizedSize);
      
      const savings = Math.round(((originalSize - totalOptimizedSize) / originalSize) * 100);
      Logger.success(`Completed: ${filename} (saved ${savings}%)`);
    } else {
      Logger.info(`[DRY RUN] Would optimize: ${optimizedPath}`);
      stats.addProcessed(originalSize, originalSize);
    }

  } catch (error) {
    Logger.error(`Failed to process ${filename}`, error);
    stats.addFailed(filename, error);
    throw error;
  }
}

/* Parallel processing with concurrency control */
async function processImagesInParallel(files, outputDir, stats) {
  const queue = [...files];
  const workers = [];
  let completed = 0;

  const processNext = async () => {
    while (queue.length > 0) {
      const file = queue.shift();
      if (!file) {
        break;
      }

      try {
        await optimizeImage(file, outputDir, stats);
      } catch (error) {
        /* Error already logged in optimizeImage */
      }

      completed++;
      Logger.progress(completed, files.length, path.basename(file));
    }
  };

  /* Create worker pool */
  for (let i = 0; i < Math.min(CONFIG.maxParallel, files.length); i++) {
    workers.push(processNext());
  }

  /* Wait for all workers to complete */
  await Promise.all(workers);
}

/* Main execution */
async function main() {
  try {
    Logger.info('Starting image optimization process...');
    
    /* Parse command line arguments */
    parseArguments();

    if (CONFIG.dryRun) {
      Logger.warn('DRY RUN MODE - No files will be modified');
    }

    Logger.info('Configuration:', {
      sourceDir: CONFIG.sourceDir,
      outputDir: CONFIG.outputDir,
      quality: CONFIG.quality,
      maxParallel: CONFIG.maxParallel,
      dryRun: CONFIG.dryRun,
    });

    /* Ensure output directory exists */
    if (!CONFIG.dryRun) {
      await ensureDirectory(CONFIG.outputDir);
    }

    /* Get all image files */
    Logger.info('Scanning for images...');
    const imageFiles = await getImageFiles(CONFIG.sourceDir);

    if (imageFiles.length === 0) {
      Logger.warn('No images found to process');
      return;
    }

    Logger.info(`Found ${imageFiles.length} images to process`);

    /* Initialize statistics */
    const stats = new OptimizationStats();

    /* Process images in parallel */
    await processImagesInParallel(imageFiles, CONFIG.outputDir, stats);

    /* Report results */
    stats.report();

    /* Exit with appropriate code */
    if (stats.failed > 0) {
      Logger.error(`Optimization completed with ${stats.failed} errors`);
      process.exit(1);
    } else {
      Logger.success('All images optimized successfully!');
      process.exit(0);
    }

  } catch (error) {
    Logger.error('Fatal error during optimization', error);
    process.exit(1);
  }
}

/* Handle uncaught errors */
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  Logger.error('Unhandled rejection', reason);
  process.exit(1);
});

/* Execute main function */
main();