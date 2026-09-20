import fs from 'fs';
import path from 'path';

async function processMascotPromo() {
  try {
    const sharp = (await import('sharp')).default;
    const inputPath = path.resolve('public/mascot-promo.jpg');
    const outputPath = path.resolve('public/mascot-promo.png');
    const rootOutputPath = path.resolve('mascot-promo.png');

    const { data, info } = await sharp(inputPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    // We do a Flood-Fill (BFS) starting from all 4 borders (outer edges)
    // to remove the background, subtle drop shadows, and outer white sticker margin
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Check if pixel is background (near white, grey shadow, or edge)
    // Outside pixels are typically r,g,b > 220 or subtle grey drop shadow (r,g,b > 200 with low color saturation)
    function isBackground(x, y) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Very light / white pixel
      if (r > 230 && g > 230 && b > 230) return true;

      // Soft drop shadow near the sticker border (grayish, r,g,b between 190 and 240, diff < 20)
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      if (minC > 185 && (maxC - minC) < 18) {
        return true;
      }

      return false;
    }

    // Add all border pixels to queue
    for (let x = 0; x < width; x++) {
      queue.push([x, 0]);
      queue.push([x, height - 1]);
      visited[0 * width + x] = 1;
      visited[(height - 1) * width + x] = 1;
    }
    for (let y = 0; y < height; y++) {
      queue.push([0, y]);
      queue.push([width - 1, y]);
      visited[y * width + 0] = 1;
      visited[y * width + (width - 1)] = 1;
    }

    let head = 0;
    while (head < queue.length) {
      const [cx, cy] = queue[head++];
      const pIdx = (cy * width + cx) * 4;

      if (isBackground(cx, cy)) {
        data[pIdx + 3] = 0; // Make transparent

        // Check 4 neighbors
        const neighbors = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nPos = ny * width + nx;
            if (!visited[nPos]) {
              visited[nPos] = 1;
              if (isBackground(nx, ny)) {
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
    }

    // Soft anti-aliasing / feathering around outer boundary
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pIdx = (y * width + x) * 4;
        if (data[pIdx + 3] > 0) {
          // Check if any neighbor is transparent
          const hasTransparentNeighbor =
            data[((y - 1) * width + x) * 4 + 3] === 0 ||
            data[((y + 1) * width + x) * 4 + 3] === 0 ||
            data[(y * width + (x - 1)) * 4 + 3] === 0 ||
            data[(y * width + (x + 1)) * 4 + 3] === 0;

          if (hasTransparentNeighbor) {
            const r = data[pIdx];
            const g = data[pIdx + 1];
            const b = data[pIdx + 2];
            if (r > 210 && g > 210 && b > 210) {
              data[pIdx + 3] = 180; // Feather
            }
          }
        }
      }
    }

    await sharp(data, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png({ quality: 100 })
      .toFile(outputPath);

    await sharp(data, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
      .png({ quality: 100 })
      .toFile(rootOutputPath);

    console.log('SUCCESS: mascot-promo.png created at', outputPath);
  } catch (err) {
    console.error('Error generating transparent mascot promo:', err);
  }
}

processMascotPromo();
