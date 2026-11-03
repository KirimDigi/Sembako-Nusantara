/**
 * Receipt PDF Generator for Sembako Nusantara Jepang
 * 
 * Generates high-definition, thermal receipt PDF documents natively in pure TypeScript
 * with full CJK / Japanese Kanji/Kana & Indonesian typography support.
 * 
 * Features:
 * - High-DPI supersampling (2x resolution) for crisp text & barcodes
 * - Automatically adapts layout & language based on currency (JPY = Japanese, IDR = Indonesian)
 * - Outputs valid standard ISO 32000-1 PDF (application/pdf) with zero external library bloat
 * - Filename convention: "Struk Sembako Nusantara DD-MM-YYYY.pdf"
 */

import { POSTransaction } from '../types';

export interface ReceiptPdfResult {
  pdfBlob: Blob;
  pdfBase64: string;
  filename: string;
  dataUrl: string;
}

/**
 * Generate PDF Receipt from a POSTransaction
 * @param tx POSTransaction data
 * @param languageOverride Optional language override ('JP' | 'ID')
 */
export async function generateReceiptPdf(
  tx: POSTransaction,
  languageOverride?: 'JP' | 'ID'
): Promise<ReceiptPdfResult> {
  // Determine language: JPY -> Japanese, IDR -> Indonesian
  const isJp = languageOverride ? languageOverride === 'JP' : tx.currency === 'JPY';

  // Format date for filename: DD-MM-YYYY
  const txDate = tx.date ? new Date(tx.date) : new Date();
  const day = String(txDate.getDate()).padStart(2, '0');
  const month = String(txDate.getMonth() + 1).padStart(2, '0');
  const year = txDate.getFullYear();
  const filename = `Struk Sembako Nusantara ${day}-${month}-${year}.pdf`;

  // Calculate canvas dimensions
  const scale = 2; // 2x supersampling for razor sharp vector-like text
  const baseWidth = 560; // 560px approx 72mm-80mm thermal receipt
  
  // Calculate total height dynamically based on items & content
  const headerHeight = isJp ? 180 : 170;
  const metaHeight = 120;
  const itemsHeight = 40 + (tx.items.length * 44);
  const totalsHeight = 170;
  const notesHeight = tx.notes ? 45 : 0;
  const footerHeight = 160;
  const totalHeight = headerHeight + metaHeight + itemsHeight + totalsHeight + notesHeight + footerHeight;

  // Create off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is not available');
  }

  // Scale context for high-DPI
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, baseWidth, totalHeight);

  // Fonts
  const primaryFont = '"Meiryo", "Yu Gothic", "Hiragino Kaku Gothic ProN", "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const monoFont = '"Courier New", Courier, Consolas, monospace';

  let currentY = 24;

  // Helper: Draw dashed line
  const drawDashedLine = (y: number, color = '#a8a29e') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(baseWidth - 20, y);
    ctx.stroke();
    ctx.restore();
  };

  // Helper: Draw double solid line
  const drawDoubleLine = (y: number, color = '#1c1917') => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(20, y);
    ctx.lineTo(baseWidth - 20, y);
    ctx.stroke();
    ctx.moveTo(20, y + 3);
    ctx.lineTo(baseWidth - 20, y + 3);
    ctx.stroke();
    ctx.restore();
  };

  // 1. HEADER (Store Logo & Info)
  ctx.textAlign = 'center';
  
  // Crimson Accent Brand Dot / Icon
  ctx.fillStyle = '#c41230';
  ctx.beginPath();
  ctx.arc(baseWidth / 2, currentY + 6, 8, 0, Math.PI * 2);
  ctx.fill();
  currentY += 28;

  // Store Main Name
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold 20px ${primaryFont}`;
  ctx.fillText('SEMBAKO NUSANTARA JEPANG', baseWidth / 2, currentY);
  currentY += 22;

  // Subtitle / Store Tagline
  ctx.font = `bold 12px ${primaryFont}`;
  ctx.fillStyle = '#78716c';
  if (isJp) {
    ctx.fillText('センバコ・ヌサンタラ日本 (東京本店 / 蒲田)', baseWidth / 2, currentY);
  } else {
    ctx.fillText('Pusat Belanja Sembako & Halal Food Nusantara di Jepang', baseWidth / 2, currentY);
  }
  currentY += 18;

  // Store Address & Phone
  ctx.font = `10px ${primaryFont}`;
  ctx.fillStyle = '#57534e';
  ctx.fillText('〒144-0051 東京都大田区西蒲田5丁目9-16 (Tokyo, Ota-ku)', baseWidth / 2, currentY);
  currentY += 15;
  ctx.fillText('TEL: 03-5678-9012  •  WhatsApp: 0895-3293-32135', baseWidth / 2, currentY);
  currentY += 15;

  if (isJp) {
    ctx.font = `bold 10px ${monoFont}`;
    ctx.fillStyle = '#44403c';
    ctx.fillText('インボイス登録番号: T1234567890123 (適格簡易請求書)', baseWidth / 2, currentY);
    currentY += 20;
  } else {
    currentY += 8;
  }

  // 2. RECEIPT TITLE BANNER
  ctx.fillStyle = '#c41230';
  ctx.fillRect(20, currentY, baseWidth - 40, 26);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold 13px ${primaryFont}`;
  if (isJp) {
    ctx.fillText('【 領  収  証 】 (お買上票)', baseWidth / 2, currentY + 18);
  } else {
    ctx.fillText('STRUK BUKTI TRANSAKSI KASIR', baseWidth / 2, currentY + 18);
  }
  currentY += 36;

  // 3. RECEIPT METADATA (Receipt No, Date, Cashier, Customer)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#44403c';
  ctx.font = `11px ${primaryFont}`;

  const dateStr = isJp
    ? `${year}年${month}月${day}日 ${txDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} (JST)`
    : `${day}/${month}/${year} ${txDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} JST`;

  // Row 1: No. Struk & Date
  ctx.fillText(isJp ? `伝票番号: #${tx.receiptNumber || tx.id}` : `No. Struk: #${tx.receiptNumber || tx.id}`, 20, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(dateStr, baseWidth - 20, currentY);
  currentY += 18;

  // Row 2: Cashier & Register
  ctx.textAlign = 'left';
  ctx.fillText(isJp ? `レジ担当: ${tx.cashierName || 'レジ1'}` : `Kasir: ${tx.cashierName || 'Kasir 1'}`, 20, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(isJp ? '端末: POS-01' : 'Terminal: POS-01', baseWidth - 20, currentY);
  currentY += 18;

  // Row 3: Customer Name
  ctx.textAlign = 'left';
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold 11px ${primaryFont}`;
  const custName = tx.customerName || (isJp ? '店頭来店客 (非会員)' : 'Walk-in Customer');
  ctx.fillText(isJp ? `お客様名: ${custName} 様` : `Pelanggan: ${custName}`, 20, currentY);
  currentY += 16;

  drawDashedLine(currentY);
  currentY += 14;

  // 4. ITEMS TABLE HEADER
  ctx.fillStyle = '#78716c';
  ctx.font = `bold 10px ${primaryFont}`;
  ctx.textAlign = 'left';
  ctx.fillText(isJp ? '品名 / 仕様' : 'Nama Produk / Item', 20, currentY);
  ctx.textAlign = 'center';
  ctx.fillText(isJp ? '数量' : 'Qty', 330, currentY);
  ctx.textAlign = 'right';
  ctx.fillText(isJp ? '単価' : 'Harga', 420, currentY);
  ctx.fillText(isJp ? '金額' : 'Subtotal', baseWidth - 20, currentY);
  currentY += 12;

  drawDashedLine(currentY);
  currentY += 16;

  // 5. ITEMS LIST
  const exchangeRate = tx.exchangeRate || 115.11;
  const isIdrTx = tx.currency === 'IDR';

  tx.items.forEach((item, index) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1c1917';
    ctx.font = `bold 11px ${primaryFont}`;
    
    // Truncate product name if too long
    let nameText = `${index + 1}. ${item.productName}`;
    if (nameText.length > 30) {
      nameText = nameText.slice(0, 29) + '…';
    }
    ctx.fillText(nameText, 20, currentY);

    // Qty
    ctx.textAlign = 'center';
    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = '#44403c';
    ctx.fillText(`${item.quantity}`, 330, currentY);

    // Price & Subtotal
    ctx.textAlign = 'right';
    if (isIdrTx) {
      const itemPriceIdr = Math.round(item.price * exchangeRate);
      const itemSubtotalIdr = Math.round(item.subtotal * exchangeRate);
      ctx.fillText(`Rp ${itemPriceIdr.toLocaleString()}`, 420, currentY);
      ctx.font = `bold 11px ${monoFont}`;
      ctx.fillStyle = '#1c1917';
      ctx.fillText(`Rp ${itemSubtotalIdr.toLocaleString()}`, baseWidth - 20, currentY);
    } else {
      ctx.fillText(`¥${item.price.toLocaleString()}`, 420, currentY);
      ctx.font = `bold 11px ${monoFont}`;
      ctx.fillStyle = '#1c1917';
      ctx.fillText(`¥${item.subtotal.toLocaleString()}`, baseWidth - 20, currentY);
    }

    currentY += 24;
  });

  currentY += 4;
  drawDashedLine(currentY);
  currentY += 16;

  // 6. TOTALS & TAX BREAKDOWN
  const totalPhysicalQty = tx.items.reduce((sum, item) => sum + item.quantity, 0);

  // Item count summary row
  ctx.textAlign = 'left';
  ctx.font = `10px ${primaryFont}`;
  ctx.fillStyle = '#57534e';
  ctx.fillText(
    isJp
      ? `お買上点数: ${tx.items.length} 品目 (${totalPhysicalQty} 個)`
      : `Jumlah Item: ${tx.items.length} Item (${totalPhysicalQty} pcs)`,
    20,
    currentY
  );
  currentY += 16;

  // Subtotal
  ctx.font = `11px ${primaryFont}`;
  ctx.fillStyle = '#44403c';
  ctx.fillText(isJp ? '小計 (税抜)' : 'Subtotal Item', 20, currentY);
  ctx.textAlign = 'right';
  ctx.font = `11px ${monoFont}`;
  if (isIdrTx) {
    const subIdr = Math.round(tx.subtotal * exchangeRate);
    ctx.fillText(`Rp ${subIdr.toLocaleString()}`, baseWidth - 20, currentY);
  } else {
    ctx.fillText(`¥${tx.subtotal.toLocaleString()}`, baseWidth - 20, currentY);
  }
  currentY += 18;

  // Discount (if any)
  if (tx.discountAmount > 0) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#047857';
    ctx.font = `11px ${primaryFont}`;
    ctx.fillText(isJp ? '特別割引 / 値引' : 'Potongan Diskon Kasir', 20, currentY);
    ctx.textAlign = 'right';
    ctx.font = `bold 11px ${monoFont}`;
    if (isIdrTx) {
      const discIdr = Math.round(tx.discountAmount * exchangeRate);
      ctx.fillText(`-Rp ${discIdr.toLocaleString()}`, baseWidth - 20, currentY);
    } else {
      ctx.fillText(`-¥${tx.discountAmount.toLocaleString()}`, baseWidth - 20, currentY);
    }
    currentY += 18;
  }

  // Tax (8% JCT / Consumption Tax)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#57534e';
  ctx.font = `11px ${primaryFont}`;
  ctx.fillText(isJp ? '内消費税等 (8% 軽減税率対象)' : 'Pajak Konsumsi (8% Makanan / Sembako)', 20, currentY);
  ctx.textAlign = 'right';
  ctx.font = `11px ${monoFont}`;
  if (isIdrTx) {
    const taxIdr = Math.round(tx.taxAmount * exchangeRate);
    ctx.fillText(`Rp ${taxIdr.toLocaleString()}`, baseWidth - 20, currentY);
  } else {
    ctx.fillText(`¥${tx.taxAmount.toLocaleString()}`, baseWidth - 20, currentY);
  }
  currentY += 16;

  // Double separator line for Grand Total
  drawDoubleLine(currentY);
  currentY += 18;

  // GRAND TOTAL (TOTAL BAYAR / 合計金額)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#c41230';
  ctx.font = `bold 15px ${primaryFont}`;
  ctx.fillText(isJp ? 'お支払い合計金額 (税込)' : 'TOTAL PEMBAYARAN', 20, currentY);
  ctx.textAlign = 'right';
  ctx.font = `bold 17px ${monoFont}`;
  if (isIdrTx) {
    const totalIdr = tx.amountPaidOriginal || Math.round(tx.totalAmount * exchangeRate);
    ctx.fillText(`Rp ${totalIdr.toLocaleString()}`, baseWidth - 20, currentY);
  } else {
    ctx.fillText(`¥${tx.totalAmount.toLocaleString()}`, baseWidth - 20, currentY);
  }
  currentY += 20;

  drawDoubleLine(currentY);
  currentY += 16;

  // Payment Method & Change
  const payMethodMapJp: Record<string, string> = {
    Cash: '現金 (お預かり)',
    'Credit Card': 'クレジットカード',
    PayPay: 'PayPay QR決済',
    'JPQR / QRIS': 'JPQR / JAPAN QRIS',
    'LINE Pay': 'LINE Pay',
    'IC Card': '交通系ICカード'
  };
  const payMethodMapId: Record<string, string> = {
    Cash: 'Uang Tunai Diterima',
    'Credit Card': 'Kartu Kredit',
    PayPay: 'PayPay QR',
    'JPQR / QRIS': 'JPQR / QRIS',
    'LINE Pay': 'LINE Pay',
    'IC Card': 'Kartu IC'
  };

  const payLabel = isJp ? (payMethodMapJp[tx.paymentMethod] || tx.paymentMethod) : (payMethodMapId[tx.paymentMethod] || tx.paymentMethod);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#44403c';
  ctx.font = `11px ${primaryFont}`;
  ctx.fillText(isJp ? `支払方法 (${payLabel})` : `Bayar (${payLabel})`, 20, currentY);
  ctx.textAlign = 'right';
  ctx.font = `11px ${monoFont}`;
  if (isIdrTx) {
    const paidIdr = tx.amountPaidOriginal || Math.round(tx.amountPaid * exchangeRate);
    ctx.fillText(`Rp ${paidIdr.toLocaleString()}`, baseWidth - 20, currentY);
  } else {
    ctx.fillText(`¥${tx.amountPaid.toLocaleString()}`, baseWidth - 20, currentY);
  }
  currentY += 18;

  // Change amount
  ctx.textAlign = 'left';
  ctx.font = `bold 11px ${primaryFont}`;
  ctx.fillStyle = '#1c1917';
  ctx.fillText(isJp ? 'お釣り' : 'Kembalian', 20, currentY);
  ctx.textAlign = 'right';
  ctx.font = `bold 12px ${monoFont}`;
  if (isIdrTx) {
    const chgIdr = tx.changeAmountOriginal || Math.round(tx.changeAmount * exchangeRate);
    ctx.fillText(`Rp ${chgIdr.toLocaleString()}`, baseWidth - 20, currentY);
  } else {
    ctx.fillText(`¥${tx.changeAmount.toLocaleString()}`, baseWidth - 20, currentY);
  }
  currentY += 16;

  // 7. NOTES (if present)
  if (tx.notes) {
    drawDashedLine(currentY);
    currentY += 14;
    ctx.textAlign = 'left';
    ctx.font = `bold 10px ${primaryFont}`;
    ctx.fillStyle = '#57534e';
    ctx.fillText(isJp ? '【 備考 / メモ 】' : '【 CATATAN TRANSAKSI 】', 20, currentY);
    currentY += 14;
    ctx.font = `10px ${primaryFont}`;
    ctx.fillStyle = '#292524';
    ctx.fillText(tx.notes, 20, currentY);
    currentY += 16;
  }

  drawDashedLine(currentY);
  currentY += 20;

  // 8. BARCODE VISUAL REVEAL
  ctx.save();
  ctx.fillStyle = '#1c1917';
  const barStartY = currentY;
  const barHeight = 28;
  const barTotalWidth = baseWidth - 80;
  const startX = 40;
  // Deterministic barcode pattern based on receipt number
  const seedStr = tx.receiptNumber || tx.id || 'SNJ-2026';
  let curX = startX;
  for (let i = 0; i < seedStr.length * 6; i++) {
    const charCode = seedStr.charCodeAt(i % seedStr.length);
    const barWidth = ((charCode + i) % 4) + 1;
    const spaceWidth = (((charCode * 3) + i) % 3) + 1;
    if (curX + barWidth > startX + barTotalWidth) break;
    ctx.fillRect(curX, barStartY, barWidth, barHeight);
    curX += barWidth + spaceWidth;
  }
  ctx.restore();
  currentY += barHeight + 12;

  // Barcode text
  ctx.textAlign = 'center';
  ctx.font = `10px ${monoFont}`;
  ctx.fillStyle = '#78716c';
  ctx.fillText(`* ${tx.receiptNumber || tx.id} *`, baseWidth / 2, currentY);
  currentY += 18;

  // 9. FOOTER & STORE POLICIES
  ctx.font = `bold 11px ${primaryFont}`;
  ctx.fillStyle = '#1c1917';
  if (isJp) {
    ctx.fillText('毎度ご来店いただき誠にありがとうございます。', baseWidth / 2, currentY);
    currentY += 16;
    ctx.font = `9.5px ${primaryFont}`;
    ctx.fillStyle = '#78716c';
    ctx.fillText('※食品衛生上、お買い上げ商品の返品・交換はご容赦願います。', baseWidth / 2, currentY);
    currentY += 14;
    ctx.fillText('※本領収書は適格請求書（簡易インボイス）として大切に保管してください。', baseWidth / 2, currentY);
    currentY += 14;
    ctx.fillText('公式オンラインショップ: https://kirimdigi.github.io/Sembako-Nusantara/', baseWidth / 2, currentY);
  } else {
    ctx.fillText('Terima kasih banyak telah berbelanja di Sembako Nusantara! 🙏', baseWidth / 2, currentY);
    currentY += 16;
    ctx.font = `9.5px ${primaryFont}`;
    ctx.fillStyle = '#78716c';
    ctx.fillText('Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.', baseWidth / 2, currentY);
    currentY += 14;
    ctx.fillText('Simpan struk nota ini sebagai bukti pembayaran transaksi kasir yang sah.', baseWidth / 2, currentY);
    currentY += 14;
    ctx.fillText('Belanja Online Kebutuhan Halal: https://kirimdigi.github.io/Sembako-Nusantara/', baseWidth / 2, currentY);
  }
  currentY += 20;

  // Convert canvas to JPEG bytes
  const jpegBytes = await canvasToJpegBytes(canvas, 0.93);

  // Build compliant PDF 1.4 binary
  const pdfBytes = buildPdfFromJpeg(jpegBytes, canvas.width, canvas.height);

  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
  const dataUrl = URL.createObjectURL(pdfBlob);

  // Convert pdfBytes to Base64
  const pdfBase64 = bytesToBase64(pdfBytes);

  return {
    pdfBlob,
    pdfBase64: `data:application/pdf;base64,${pdfBase64}`,
    filename,
    dataUrl
  };
}

/**
 * Helper to convert canvas to JPEG Uint8Array
 */
function canvasToJpegBytes(canvas: HTMLCanvasElement, quality = 0.92): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas export to blob failed'));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          resolve(new Uint8Array(reader.result as ArrayBuffer));
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Fast & safe binary Uint8Array to base64 converter
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Builds a standard, 100% compliant ISO 32000-1 PDF binary containing the thermal receipt image.
 * Uses native /Filter /DCTDecode for ultra-fast, zero-memory-leak, native PDF rendering in all PDF viewers.
 */
function buildPdfFromJpeg(
  jpegBytes: Uint8Array,
  imgWidthPx: number,
  imgHeightPx: number
): Uint8Array {
  // Thermal receipt dimensions in PDF points (72 points = 1 inch = 25.4mm)
  // Standard 80mm receipt width: 80 / 25.4 * 72 ≈ 226.77 pt
  const pdfWidthPt = 226.77;
  const pdfHeightPt = (imgHeightPx / imgWidthPx) * pdfWidthPt;

  const chunks: (Uint8Array | string)[] = [];
  let currentOffset = 0;
  const offsets: number[] = [0];

  const textEncoder = new TextEncoder();

  function appendString(str: string) {
    const encoded = textEncoder.encode(str);
    chunks.push(encoded);
    currentOffset += encoded.length;
  }

  function appendBytes(bytes: Uint8Array) {
    chunks.push(bytes);
    currentOffset += bytes.length;
  }

  // PDF Header
  appendString('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');

  // Object 1: Catalog
  offsets.push(currentOffset);
  appendString('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Object 2: Pages tree
  offsets.push(currentOffset);
  appendString('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Object 3: Page definition
  offsets.push(currentOffset);
  appendString(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfWidthPt.toFixed(2)} ${pdfHeightPt.toFixed(2)}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
  );

  // Object 4: Image XObject with /DCTDecode (direct JPEG stream)
  offsets.push(currentOffset);
  appendString(
    `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidthPx} /Height ${imgHeightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );
  appendBytes(jpegBytes);
  appendString('\nendstream\nendobj\n');

  // Object 5: Page Content stream
  const contentStream = `q\n${pdfWidthPt.toFixed(2)} 0 0 ${pdfHeightPt.toFixed(2)} 0 0 cm\n/Im1 Do\nQ\n`;
  offsets.push(currentOffset);
  appendString(`5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

  // Cross-reference table (xref)
  const xrefOffset = currentOffset;
  appendString(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) {
    appendString(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }

  // Trailer
  appendString(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  // Combine all chunks into single Uint8Array
  const fullPdf = new Uint8Array(currentOffset);
  let pos = 0;
  for (const chunk of chunks) {
    if (typeof chunk === 'string') {
      const encoded = textEncoder.encode(chunk);
      fullPdf.set(encoded, pos);
      pos += encoded.length;
    } else {
      fullPdf.set(chunk, pos);
      pos += chunk.length;
    }
  }

  return fullPdf;
}
