const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const COLOR_A = [109, 93, 252]; // #6d5dfc
const COLOR_B = [239, 93, 168]; // #ef5da8

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;
  let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + abx * t;
  const cy = ay + aby * t;
  return Math.hypot(px - cx, py - cy);
}

function roundedRectAlpha(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius);
  const cy = Math.min(Math.max(y, radius), size - radius);
  const d = Math.hypot(x - cx, y - cy);
  if (x >= radius && x <= size - radius) return 1;
  if (y >= radius && y <= size - radius) return 1;
  return d <= radius ? 1 : d <= radius + 1 ? radius + 1 - d : 0;
}

function generateIcon(size, filename) {
  const png = new PNG({ width: size, height: size });
  const radius = size * 0.22;
  const thickness = Math.max(size * 0.09, 2);

  const p1 = [size * 0.27, size * 0.53];
  const p2 = [size * 0.44, size * 0.7];
  const p3 = [size * 0.75, size * 0.32];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      const bgAlpha = roundedRectAlpha(x, y, size, radius);

      const t = (x + y) / (2 * size);
      const r = lerp(COLOR_A[0], COLOR_B[0], t);
      const g = lerp(COLOR_A[1], COLOR_B[1], t);
      const b = lerp(COLOR_A[2], COLOR_B[2], t);

      const dSeg1 = distToSegment(x, y, p1[0], p1[1], p2[0], p2[1]);
      const dSeg2 = distToSegment(x, y, p2[0], p2[1], p3[0], p3[1]);
      const onCheck = Math.min(dSeg1, dSeg2) <= thickness / 2;

      if (onCheck && bgAlpha > 0) {
        png.data[idx] = 255;
        png.data[idx + 1] = 255;
        png.data[idx + 2] = 255;
        png.data[idx + 3] = 255;
      } else {
        png.data[idx] = Math.round(r);
        png.data[idx + 1] = Math.round(g);
        png.data[idx + 2] = Math.round(b);
        png.data[idx + 3] = Math.round(255 * bgAlpha);
      }
    }
  }

  const outPath = path.join(__dirname, '..', 'public', filename);
  png.pack().pipe(fs.createWriteStream(outPath));
  console.log('Generated', outPath);
}

generateIcon(32, 'favicon-32x32.png');
generateIcon(16, 'favicon-16x16.png');
generateIcon(180, 'apple-touch-icon.png');
generateIcon(192, 'icons/icon-192.png');
generateIcon(512, 'icons/icon-512.png');
generateIcon(512, 'icons/maskable-512.png');
