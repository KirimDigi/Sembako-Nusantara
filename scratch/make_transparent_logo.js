import fs from 'fs';
import path from 'path';

// Let's create a node script to remove white background from LOGO PUTIH SN.jpeg
async function run() {
  try {
    const sharp = (await import('sharp')).default;
    const inputPath = path.resolve('public/LOGO PUTIH SN.jpeg');
    const outputPath = path.resolve('public/logo-transparent.png');
    const rootOutputPath = path.resolve('logo-transparent.png');

    // Read image, get raw pixel data
    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Threshold for white background removal
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // If pixel is white or near-white (lighter than 240,240,240)
      if (r > 235 && g > 235 && b > 235) {
        data[i + 3] = 0; // set alpha to 0 (transparent)
      } else if (r > 220 && g > 220 && b > 220) {
        // Smooth feather edge
        const diff = (r + g + b) / 3;
        data[i + 3] = Math.max(0, Math.floor((255 - diff) * 5));
      }
    }

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(rootOutputPath);

    console.log('SUCCESS: Transparent logo saved to', outputPath);
  } catch (err) {
    console.error('Error with sharp:', err);
  }
}

run();
