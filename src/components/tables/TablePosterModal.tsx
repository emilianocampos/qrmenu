'use client';

import React, { useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Printer, X, Smartphone, Store } from 'lucide-react';
import { Business } from '@/types';

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

  if (!open || !table) return null;

  // URL del QR para la mesa (ej: https://mambaqr.com/c/mi-local?table=8)
  const tableQrUrl = `${publicUrl}?table=${table.table_number}`;
  const displayTableName = table.table_name || `MESA ${table.table_number}`;

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

    // Texto ESCANEÁ EL QR
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px sans-serif';
    ctx.fillText('ESCANEÁ EL QR', posterCanvas.width / 2, 200);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px sans-serif';
    ctx.fillText('PARA VER LA CARTA Y PEDIR', posterCanvas.width / 2, 245);

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
    ctx.fillText('Powered by MambaQR', posterCanvas.width / 2, 980);

    const link = document.createElement('a');
    link.download = `Cartel-${business.slug}-Mesa-${table.table_number}.png`;
    link.href = posterCanvas.toDataURL('image/png');
    link.click();
  };

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
          .header-title { font-size: 32pt; font-weight: 900; letter-spacing: 1px; margin: 0; }
          .header-subtitle { font-size: 14pt; color: #94a3b8; margin-top: 2mm; }
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
            <h1 class="header-title">ESCANEÁ EL QR</h1>
            <p class="header-subtitle">PARA ACCEDER A LA CARTA Y PEDIR</p>
          </div>
          
          <div class="qr-box">
            <img src="${qrDataUrl}" />
          </div>
          
          <div>
            <h2 class="table-title">${displayTableName.toUpperCase()}</h2>
            <div class="business-name">${business.name}</div>
            <div class="footer">MambaQR • Menú Digital e Inteligente</div>
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
            Cartel de Mesa imprimible
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Poster Visual Preview */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center">
          <div className="w-full max-w-xs bg-slate-900 border-4 border-indigo-500 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4">
            <div>
              <span className="text-4xl block mb-1">📱</span>
              <h2 className="text-xl font-black text-white tracking-wide">ESCANEÁ EL QR</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">Para acceder a la carta y pedir</p>
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
              <p className="text-[10px] text-slate-500 mt-2">MambaQR</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/8 bg-[#161616] grid grid-cols-2 gap-3">
          <button
            onClick={downloadPNG}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                       bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Descargar PNG
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir Cartel
          </button>
        </div>
      </div>
    </div>
  );
}
