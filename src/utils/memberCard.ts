import { assetUrl } from './assets';

/**
 * Standard Code 39 character mapping (5 bars, 4 spaces; 3 wide, 6 narrow)
 * 0 = narrow, 1 = wide
 */
const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  'A': '100001001',
  'B': '001001001',
  'C': '101001000',
  'D': '000011001',
  'E': '100011000',
  'F': '001011000',
  'G': '000001101',
  'H': '100001100',
  'I': '001001100',
  'J': '000011100',
  'K': '100000011',
  'L': '001000011',
  'M': '101000010',
  'N': '000010011',
  'O': '100010010',
  'P': '001010010',
  'Q': '000000111',
  'R': '100000110',
  'S': '001000110',
  'T': '000010110',
  'U': '110000001',
  'V': '011000001',
  'W': '111000000',
  'X': '010010001',
  'Y': '110010000',
  'Z': '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  '*': '010010100', // Start / Stop character
  '$': '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010'
};

/**
 * Get unique member ID for a user
 */
export function getMemberId(user?: { id?: string; memberId?: string; phone?: string; email?: string } | null): string {
  if (!user || !user.id) return 'SN-JP-MEMBER-2026';
  if (user.memberId) return user.memberId;

  const raw = user.id.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let slug = raw;
  if (!slug && user.phone) {
    slug = user.phone.replace(/[^0-9]/g, '');
  }
  if (!slug && user.email) {
    slug = user.email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  if (!slug) {
    slug = 'MEMBER';
  }
  if (slug.length > 10) {
    slug = slug.substring(0, 10);
  }

  return `SN-JP-${slug}-2026`;
}

/**
 * Generate discrete bars array for Code 39 (to render SVG or Canvas with 100% scanning accuracy)
 */
export function getCode39BarcodeBars(text: string, narrowWidth = 2, wideWidth = 5, gapWidth = 2) {
  const cleanText = `*${text.toUpperCase().replace(/[^A-Z0-9\-.$/+% ]/g, '')}*`;
  const bars: { isBar: boolean; width: number }[] = [];

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];

    // 9 elements: alternating bar, space, bar, space, bar, space, bar, space, bar
    for (let p = 0; p < 9; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === '1';
      const width = isWide ? wideWidth : narrowWidth;
      bars.push({ isBar, width });
    }

    // Inter-character space
    if (i < cleanText.length - 1) {
      bars.push({ isBar: false, width: gapWidth });
    }
  }

  return bars;
}

/**
 * Download Member Card as PNG Image matching the exact card design
 */
export async function downloadMemberCardPng(options: {
  memberId: string;
  memberName: string;
  tier?: string;
  logoUrl?: string;
}) {
  const { memberId, memberName, tier = 'GOLD MEMBER', logoUrl = assetUrl('LOGO PUTIH SN TRANSPARANT.png') } = options;

  const canvas = document.createElement('canvas');
  const width = 1000;
  const height = 620;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Helper rounded rect
  const drawRoundedRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  };

  // 1. Draw Card Background with Clip
  ctx.save();
  drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 36);
  ctx.clip();

  // Gradient: Deep Crimson Red to Dark Burgundy
  const bgGradient = ctx.createLinearGradient(20, 20, width - 20, height - 20);
  bgGradient.addColorStop(0, '#c41230');
  bgGradient.addColorStop(0.5, '#850015');
  bgGradient.addColorStop(1, '#2a0208');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(20, 20, width - 40, height - 40);

  // Soft Radial Glow
  const radialGlow = ctx.createRadialGradient(width - 150, 80, 10, width - 150, 80, 350);
  radialGlow.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  radialGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(20, 20, width - 40, height - 40);

  // 2. Load and Draw Watermark Logo in Background (Subtle / Samar-samar)
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = logoUrl;
    await new Promise((resolve) => {
      logoImg.onload = resolve;
      logoImg.onerror = resolve;
    });

    if (logoImg.complete && logoImg.naturalWidth > 0) {
      // Draw watermark in exact center (Pure White, Visible and Elegant)
      ctx.save();
      ctx.globalAlpha = 0.35;
      const wmSize = 380;
      ctx.drawImage(logoImg, (width - wmSize) / 2, (height - wmSize) / 2, wmSize, wmSize);
      ctx.restore();

      // Draw Top-Left Brand Logo (White)
      ctx.save();
      ctx.drawImage(logoImg, 60, 52, 60, 60);
      ctx.restore();
    }
  } catch (e) {}

  ctx.restore(); // end clip

  // Draw Card Outer Gold Border
  ctx.save();
  drawRoundedRect(ctx, 20, 20, width - 40, height - 40, 36);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.restore();

  // 3. Header Texts
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
  ctx.fillText('SEMBAKO NUSANTARA', 135, 78);

  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('JAPAN DIASPORA CARD', 135, 100);

  // Top-Right Gold Badge
  drawRoundedRect(ctx, width - 230, 56, 170, 38, 19);
  ctx.fillStyle = '#FBBF24';
  ctx.fill();
  ctx.fillStyle = '#1C1917';
  ctx.font = '900 13px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tier.toUpperCase(), width - 145, 80);
  ctx.textAlign = 'left';
  ctx.restore();

  // 4. Member Info
  ctx.save();
  ctx.fillStyle = '#D6D3D1';
  ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
  ctx.fillText('NAMA ANGGOTA MEMBER:', 60, 160);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(memberName, 60, 200);

  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 18px monospace';
  ctx.letterSpacing = '3px';
  ctx.fillText(memberId, 60, 230);
  ctx.restore();

  // 5. White Barcode Container
  const bcBoxX = 60;
  const bcBoxY = 255;
  const bcBoxW = width - 120;
  const bcBoxH = 250;

  ctx.save();
  drawRoundedRect(ctx, bcBoxX, bcBoxY, bcBoxW, bcBoxH, 24);
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fill();
  ctx.restore();

  // 6. Draw Accurate, Scannable Code 39 Barcode
  const barcodeBars = getCode39BarcodeBars(memberId, 2.8, 6.8, 2.8);
  const totalBarcodeWidth = barcodeBars.reduce((sum, b) => sum + b.width, 0);
  let startX = bcBoxX + (bcBoxW - totalBarcodeWidth) / 2;
  const barTop = bcBoxY + 30;
  const barHeight = 135;

  ctx.save();
  ctx.fillStyle = '#000000';
  for (const bar of barcodeBars) {
    if (bar.isBar) {
      ctx.fillRect(startX, barTop, bar.width, barHeight);
    }
    startX += bar.width;
  }

  // Barcode Human-Readable Text underneath
  ctx.fillStyle = '#1C1917';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`*${memberId}*`, bcBoxX + bcBoxW / 2, barTop + barHeight + 35);
  ctx.restore();

  // 7. Footer - Masa Berlaku (Poin Reward Removed!)
  ctx.save();
  ctx.fillStyle = '#E7E5E4';
  ctx.font = '14px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Masa Berlaku: ', width - 150, height - 55);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
  ctx.fillText('Seumur Hidup', width - 60, height - 55);
  ctx.restore();

  // 8. Trigger Browser File Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kartu-Member-${memberId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
