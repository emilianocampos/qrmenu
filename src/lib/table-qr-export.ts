import { Business } from '@/types';

export interface ExportableTableItem {
  id: string;
  table_number: number;
  table_name: string | null;
  table_code: string | null;
  active: boolean;
}

/**
 * Construye la URL pública codificada en el QR de una mesa.
 */
export function getTableQrUrl(
  table: ExportableTableItem,
  businessSlug: string,
  publicUrl: string
): string {
  const mesaIdentifier = table.table_name
    ? table.table_name.replace(/^Mesa\s*/i, '').trim()
    : String(table.table_number);

  let effectivePublicUrl = publicUrl;
  if (typeof window !== 'undefined') {
    if (
      effectivePublicUrl.includes('localhost') ||
      effectivePublicUrl.includes('127.0.0.1') ||
      effectivePublicUrl.includes('mambaqr.vercel.app')
    ) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        effectivePublicUrl = `${window.location.protocol}//${window.location.host}/c/${businessSlug}`;
      } else {
        effectivePublicUrl = `http://192.168.1.9:3000/c/${businessSlug}`;
      }
    }
  }

  return `${effectivePublicUrl}?table=${encodeURIComponent(mesaIdentifier)}`;
}

export function getTableDisplayName(table: ExportableTableItem): string {
  return table.table_name?.trim() || `Mesa ${table.table_number}`;
}

export function sanitizeFileName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'mesa';
}

/**
 * Crea un canvas de alta resolución con el QR puro y 0 margen.
 */
export function buildZeroMarginQrCanvas(sourceCanvas: HTMLCanvasElement, size = 512): HTMLCanvasElement {
  const qrCanvas = document.createElement('canvas');
  qrCanvas.width = size;
  qrCanvas.height = size;
  const ctx = qrCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0, size, size);
  }
  return qrCanvas;
}

/**
 * Crea el canvas del cartel completo (800x1100) a partir del canvas del QR.
 */
export function buildPosterCanvasFromQr(
  qrCanvas: HTMLCanvasElement,
  displayTableName: string,
  business: Business
): HTMLCanvasElement {
  const posterCanvas = document.createElement('canvas');
  posterCanvas.width = 800;
  posterCanvas.height = 1100;
  const ctx = posterCanvas.getContext('2d');
  if (!ctx) return posterCanvas;

  // Fondo
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, posterCanvas.width, posterCanvas.height);

  // Borde elegante
  ctx.strokeStyle = business.color_primary || '#6366f1';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, posterCanvas.width - 60, posterCanvas.height - 60);

  // Icono Teléfono
  ctx.font = '60px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📱', posterCanvas.width / 2, 120);

  // Texto ¡PEDÍ DIRECTO DESDE ACÁ!
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px sans-serif';
  ctx.fillText('¡PEDÍ DIRECTO DESDE ACÁ!', posterCanvas.width / 2, 195);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 22px sans-serif';
  ctx.fillText('ESCANEÁ CON TU CELULAR • DIRECTO A LA COCINA', posterCanvas.width / 2, 240);

  // Dibujar QR al centro (0 margen dentro del QR, con contenedor blanco limpio)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(posterCanvas.width / 2 - 220, 280, 440, 440);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(qrCanvas, posterCanvas.width / 2 - 200, 300, 400, 400);
  ctx.imageSmoothingEnabled = true;

  // Nombre de la Mesa
  ctx.fillStyle = business.color_primary || '#818cf8';
  ctx.font = '900 64px sans-serif';
  ctx.fillText(displayTableName.toUpperCase(), posterCanvas.width / 2, 800);

  // Nombre del Negocio
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px sans-serif';
  ctx.fillText(business.name, posterCanvas.width / 2, 870);

  // Pie de página
  ctx.fillStyle = '#64748b';
  ctx.font = '400 20px sans-serif';
  ctx.fillText('MambaQR • Pedí sin esperar', posterCanvas.width / 2, 980);

  return posterCanvas;
}

export function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('No se pudo generar la imagen PNG'));
        return;
      }
      const buffer = await blob.arrayBuffer();
      resolve(new Uint8Array(buffer));
    }, 'image/png');
  });
}

// ============================================================================
// Generador ZIP estándar (STORE - sin compresión, ideal para PNGs ya comprimidos)
// ============================================================================
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function createZipBlob(files: { name: string; data: Uint8Array }[]): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;

    // Local File Header (30 bytes + name)
    const localHeader = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(localHeader);
    lv.setUint32(0, 0x04034b50, true); // signature
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // UTF-8 flag
    lv.setUint16(8, 0, true); // method: STORE
    lv.setUint16(10, 0, true); // mod time
    lv.setUint16(12, 0, true); // mod date
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra length
    new Uint8Array(localHeader, 30).set(nameBytes);

    localParts.push(new Uint8Array(localHeader), file.data);

    // Central Directory Header (46 bytes + name)
    const centralHeader = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(centralHeader);
    cv.setUint32(0, 0x02014b50, true); // signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 flag
    cv.setUint16(10, 0, true); // method: STORE
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra length
    cv.setUint16(32, 0, true); // comment length
    cv.setUint16(34, 0, true); // disk number
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, offset, true); // local header offset
    new Uint8Array(centralHeader, 46).set(nameBytes);

    centralParts.push(new Uint8Array(centralHeader));
    offset += 30 + nameBytes.length + size;
  }

  const centralSize = centralParts.reduce((acc, part) => acc + part.length, 0);

  // End of Central Directory (22 bytes)
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  return new Blob([...localParts, ...centralParts, new Uint8Array(eocd)] as BlobPart[], {
    type: 'application/zip',
  });
}

/**
 * Guarda múltiples archivos PNG en una carpeta elegida por el usuario (abre en el Escritorio en Chrome/Edge)
 * o descarga un único archivo .ZIP como respaldo automático en navegadores sin File System Access API.
 * Acepta una función generadora para que showDirectoryPicker() se ejecute inmediatamente con el gesto del usuario.
 */
export async function saveGeneratedFilesToFolderOrZip(
  folderName: string,
  generateFiles: () => Promise<{ name: string; data: Uint8Array }[]>
): Promise<{ mode: 'folder' | 'zip' | 'cancelled'; folderName: string; count: number }> {
  const win = window as any;

  // 1. Intentar File System Access API (Chrome / Edge / Brave / Opera) iniciando en el Escritorio
  if (typeof win.showDirectoryPicker === 'function') {
    let parentDirHandle: any = null;
    try {
      parentDirHandle = await win.showDirectoryPicker({
        id: 'mambaqr-mesas-export',
        mode: 'readwrite',
        startIn: 'desktop',
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { mode: 'cancelled', folderName, count: 0 };
      }
      console.warn('File System Access API no disponible o bloqueada, usando descarga ZIP:', err);
    }

    if (parentDirHandle) {
      const files = await generateFiles();
      const subDirHandle = await parentDirHandle.getDirectoryHandle(folderName, { create: true });

      for (const file of files) {
        const fileHandle = await subDirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file.data);
        await writable.close();
      }

      return { mode: 'folder', folderName, count: files.length };
    }
  }

  // 2. Fallback universal: archivo ZIP con todas las imágenes dentro de la carpeta
  const files = await generateFiles();
  const zipFiles = files.map(f => ({
    name: `${folderName}/${f.name}`,
    data: f.data,
  }));
  const zipBlob = createZipBlob(zipFiles);
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 5000);

  return { mode: 'zip', folderName, count: files.length };
}
