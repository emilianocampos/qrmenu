'use client';

import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, X, QrCode, Copy, Check, ExternalLink } from 'lucide-react';
import { Business } from '@/types';
import { toast } from 'sonner';

interface RestaurantTableItem {
  id: string;
  table_number: number;
  table_name: string | null;
  table_code: string | null;
  active: boolean;
}

interface TablePosterModalProps {
  open: boolean;
  table: RestaurantTableItem | null;
  business: Business;
  publicUrl: string;
  onClose: () => void;
}

export function TablePosterModal({
  open,
  table,
  business,
  publicUrl,
  onClose,
}: TablePosterModalProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (!open || !table) return null;

  // 1. Obtener identificador real de mesa (ej: '1', '2', '1B', '26A', '100')
  const mesaIdentifier = table.table_name
    ? table.table_name.replace(/^Mesa\s*/i, '').trim()
    : String(table.table_number);

  // 2. Resolver la URL pública asegurando que no sea "localhost" (inaccesible desde celulares)
  let effectivePublicUrl = publicUrl;
  if (typeof window !== 'undefined') {
    if (effectivePublicUrl.includes('localhost') || effectivePublicUrl.includes('127.0.0.1')) {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        effectivePublicUrl = `${window.location.protocol}//${window.location.host}/c/${business.slug}`;
      } else {
        effectivePublicUrl = effectivePublicUrl.replace('localhost', '192.168.1.9');
      }
    }
  }

  // URL del QR para la mesa (ej: http://192.168.1.9:3000/c/muud?table=1B)
  const tableQrUrl = `${effectivePublicUrl}?table=${encodeURIComponent(mesaIdentifier)}`;
  const displayTableName = table.table_name || `MESA ${table.table_number}`;

  const copyLink = () => {
    navigator.clipboard.writeText(tableQrUrl);
    setCopied(true);
    toast.success('¡Enlace de la mesa copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Descargar ÚNICAMENTE el código QR (fondo blanco limpio)
  const downloadQRCodeOnly = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Crear canvas con margen blanco para fácil lectura y stickers
    const qrCanvas = document.createElement('canvas');
    const padding = 40;
    qrCanvas.width = canvas.width + padding * 2;
    qrCanvas.height = canvas.height + padding * 2;
    const ctx = qrCanvas.getContext('2d');
    if (!ctx) return;

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);

    // Dibujar QR
    ctx.drawImage(canvas, padding, padding);

    const link = document.createElement('a');
    link.download = `QR-Solo-${business.slug}-Mesa-${table.table_number}.png`;
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
  };

  // 2. Descargar el Cartel Completo diseñado
  const downloadPNG = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Crear un canvas temporal para dibujar el cartel completo
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 800;
    posterCanvas.height = 1100;
    const ctx = posterCanvas.getContext('2d');
    if (!ctx) return;

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

    // Dibujar QR al centro
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(posterCanvas.width / 2 - 220, 280, 440, 440);
    ctx.drawImage(canvas, posterCanvas.width / 2 - 200, 300, 400, 400);

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

    const link = document.createElement('a');
    link.download = `Cartel-${business.slug}-Mesa-${table.table_number}.png`;
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

  // 3. Imprimir Cartel
  const handlePrint = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL('image/png');

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cartel ${displayTableName} - ${business.name}</title>
        <style>
          @page { size: A4 portrait; margin: 0; }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background-color: #0f172a;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .poster {
            width: 170mm;
            height: 240mm;
            border: 4mm solid ${business.color_primary || '#6366f1'};
            border-radius: 12mm;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 12mm;
            box-sizing: border-box;
            text-align: center;
            background: #0f172a;
          }
          .icon { font-size: 40pt; margin-bottom: 5mm; }
          .header-title { font-size: 28pt; font-weight: 900; letter-spacing: 1px; margin: 0; }
          .header-subtitle { font-size: 13pt; color: #94a3b8; margin-top: 2mm; }
          .qr-box {
            background: #ffffff;
            padding: 6mm;
            border-radius: 8mm;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            margin: 6mm 0;
          }
          .qr-box img { width: 80mm; height: 80mm; display: block; }
          .table-title { font-size: 44pt; font-weight: 900; color: ${business.color_primary || '#818cf8'}; margin: 0; }
          .business-name { font-size: 22pt; font-weight: 700; color: #ffffff; margin-top: 2mm; }
          .footer { font-size: 11pt; color: #64748b; margin-top: 4mm; }
        </style>
      </head>
      <body>
        <div class="poster">
          <div>
            <div class="icon">📱</div>
            <h1 class="header-title">¡PEDÍ DIRECTO DESDE ACÁ!</h1>
            <p class="header-subtitle">ESCANEÁ CON TU CELULAR • DIRECTO A LA COCINA</p>
          </div>
          
          <div class="qr-box">
            <img src="${qrDataUrl}" />
          </div>
          
          <div>
            <h2 class="table-title">${displayTableName.toUpperCase()}</h2>
            <div class="business-name">${business.name}</div>
            <div class="footer">MambaQR • Pedí sin esperar</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between bg-[#161616]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            Cartel de Mesa y Código QR
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Visual Preview */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          <div className="w-full max-w-xs bg-slate-900 border-4 border-indigo-500 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div>
              <span className="text-4xl block mb-1">📱</span>
              <h2 className="text-lg font-black text-white tracking-wide">¡PEDÍ DIRECTO DESDE ACÁ!</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">Escaneá con tu celular • Directo a cocina</p>
            </div>

            {/* QR Box */}
            <div ref={canvasContainerRef} className="bg-white p-3 rounded-2xl shadow-xl my-1">
              <QRCodeCanvas
                value={tableQrUrl}
                size={180}
                level="H"
                fgColor="#000000"
                bgColor="#ffffff"
              />
            </div>

            <div>
              <h1 className="text-3xl font-black text-indigo-400 uppercase tracking-tight">
                {displayTableName}
              </h1>
              <p className="text-sm font-bold text-white mt-0.5">{business.name}</p>
              <p className="text-[10px] text-slate-500 mt-2">MambaQR • Pedí sin esperar</p>
            </div>
          </div>

          {/* Direct URL Box & Wi-Fi tip */}
          <div className="w-full max-w-xs mt-4 bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-1.5 text-xs text-slate-300">
            <span className="text-[10px] uppercase font-bold text-slate-400">Enlace codificado en el QR:</span>
            <div className="flex items-center gap-2 bg-black/40 border border-white/5 px-2.5 py-1.5 rounded-lg overflow-hidden">
              <span className="truncate flex-1 font-mono text-indigo-300 select-all text-[11px]">{tableQrUrl}</span>
              <button
                onClick={copyLink}
                className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copiar enlace"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={tableQrUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1 text-slate-400 hover:text-white transition-colors"
                title="Probar en pestaña nueva"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              📶 <strong>Para probar desde tu celular:</strong> Conecta tu teléfono a la misma red Wi-Fi de tu PC (<code className="text-emerald-400">192.168.1.9</code>). En producción online funcionará con 4G en cualquier lugar.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/8 bg-[#161616] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={downloadQRCodeOnly}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold
                       bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
            title="Descargar solo la imagen del código QR con margen blanco"
          >
            <QrCode className="w-4 h-4" />
            Solo QR
          </button>
          
          <button
            onClick={downloadPNG}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold
                       bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer"
            title="Descargar imagen del cartel completo para imprimir"
          >
            <Download className="w-4 h-4" />
            Cartel PNG
          </button>
          
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            title="Imprimir cartel en tamaño A4"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
