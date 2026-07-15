'use client';

import React, { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, Printer, Check, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Business } from '@/types';

interface QRPageClientProps {
  business: Business;
  publicUrl: string;
}

export function QRPageClient({ business, publicUrl }: QRPageClientProps) {
  const [copied, setCopied] = useState(false);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [margin, setMargin] = useState(2);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publicUrl]);

  const downloadPNG = useCallback(() => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${business.slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [business.slug]);

  const downloadSVG = useCallback(() => {
    const svgData = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <image href="${(document.querySelector('#qr-canvas canvas') as HTMLCanvasElement)?.toDataURL()}" width="${size}" height="${size}"/>
</svg>`.trim();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${business.slug}-qr.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [business.slug, size]);

  const handlePrint = useCallback(() => {
    const canvas = document.querySelector('#qr-canvas canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const img = canvas.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${business.name}</title>
      <style>body{margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}
      img{max-width:400px;} p{margin-top:1rem;color:#666;font-size:14px;}</style></head>
      <body><img src="${img}"/><p>${publicUrl}</p></body></html>
    `);
    win.document.close();
    win.print();
  }, [business.name, publicUrl]);

  return (
    <div>
      <PageHeader
        title="Código QR"
        description="Generá y personalizá el QR de tu carta digital"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'QR' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Preview */}
        <div className="flex flex-col items-center">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 w-full">
            {/* QR Canvas */}
            <div id="qr-canvas" className="p-6 rounded-2xl shadow-2xl" style={{ backgroundColor: bgColor }}>
              <QRCodeCanvas
                value={publicUrl}
                size={size}
                fgColor={qrColor}
                bgColor={bgColor}
                level="H"
                marginSize={margin}
              />
            </div>

            {/* URL Display */}
            <div className="w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-400 truncate">{publicUrl}</span>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                           bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar enlace'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium
                           bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={downloadPNG}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                           bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25"
              >
                <Download className="w-4 h-4" />
                Descargar PNG
              </button>
              <button
                onClick={downloadSVG}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
                           bg-violet-500 hover:bg-violet-600 text-white transition-all shadow-lg shadow-violet-500/25"
              >
                <Download className="w-4 h-4" />
                Descargar SVG
              </button>
            </div>
          </div>
        </div>

        {/* Customization */}
        <div className="space-y-5">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Personalizar QR</h3>

            <ColorPicker
              label="Color del QR"
              value={qrColor}
              onChange={setQrColor}
            />
            <ColorPicker
              label="Color de fondo"
              value={bgColor}
              onChange={setBgColor}
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño: {size}px
              </label>
              <input
                type="range"
                min={128}
                max={512}
                step={32}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>128px</span>
                <span>512px</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Margen: {margin}
              </label>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={margin}
                onChange={e => setMargin(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Sin margen</span>
                <span>Máximo</span>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-600/10 border border-indigo-500/20 rounded-2xl p-6">
            <h4 className="text-sm font-semibold text-white mb-2">💡 Tip</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Imprimí el QR y colocalo en mesas, vidriera o menú físico.
              Tus clientes pueden escanearlo con la cámara de su teléfono para acceder a la carta digital.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
