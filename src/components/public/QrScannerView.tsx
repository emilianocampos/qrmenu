'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';

interface QrScannerViewProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export function QrScannerView({ onScanSuccess, onClose }: QrScannerViewProps) {
  const scannerRef = useRef<any>(null);
  const handledRef = useRef(false);
  const [status, setStatus] = useState<'starting' | 'scanning' | 'error'>('starting');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const readerId = useRef(`loyalty-qr-reader-${Math.random().toString(36).slice(2, 8)}`).current;

  useEffect(() => {
    let isMounted = true;

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const scanner = new Html5Qrcode(readerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1,
          },
          (decodedText: string) => {
            if (handledRef.current) return;
            handledRef.current = true;
            scanner.stop().catch(() => {});
            onScanSuccess(decodedText);
          },
          () => {
            // Errores por frame sin QR: ignorar silenciosamente
          }
        );

        if (isMounted) setStatus('scanning');
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('error');
        const msg = err?.message || String(err || '');
        if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('notallowed')) {
          setErrorMsg('No se otorgó permiso para usar la cámara. Habilitalo en tu navegador o escaneá el QR directamente con la cámara de tu celular.');
        } else {
          setErrorMsg('No se pudo iniciar la cámara en este dispositivo. También podés escanear el QR de caja directamente con la cámara nativa de tu celular.');
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().catch(() => {}).finally(() => {
          try {
            scanner.clear();
          } catch {}
        });
      }
    };
  }, [onScanSuccess, readerId]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Escaneá el QR de Caja
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-page)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-muted)',
          }}
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
      </div>

      <div
        className="relative w-full rounded-2xl overflow-hidden border bg-black min-h-[260px] flex items-center justify-center"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div id={readerId} className="w-full" />

        {status === 'starting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 text-white text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span>Iniciando cámara...</span>
          </div>
        )}

        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 text-center bg-black/90 text-white">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs text-gray-300 leading-relaxed">{errorMsg}</p>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              Volver a mi tarjeta
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-center" style={{ color: 'var(--text-muted)' }}>
        Apuntá la cámara al código QR de fidelización en la caja. Se enviará la solicitud para que el cajero confirme tu sello.
      </p>
    </div>
  );
}
