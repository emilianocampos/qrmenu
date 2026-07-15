'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRPreviewProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  margin?: number;
}

export function QRPreview({
  value,
  size = 256,
  fgColor = '#000000',
  bgColor = '#ffffff',
  margin = 2,
}: QRPreviewProps) {
  return (
    <div
      className="p-6 rounded-2xl shadow-2xl inline-block border border-white/10"
      style={{ backgroundColor: bgColor }}
    >
      <QRCodeCanvas
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="H"
        marginSize={margin}
      />
    </div>
  );
}
