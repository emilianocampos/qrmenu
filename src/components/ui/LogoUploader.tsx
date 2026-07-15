'use client';

import React from 'react';
import { UploadDropzone } from './UploadDropzone';

interface LogoUploaderProps {
  preview: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  loading?: boolean;
}

export function LogoUploader({ preview, onFileSelect, onClear, loading = false }: LogoUploaderProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Logo del negocio</h3>
      <UploadDropzone
        accept="image/*"
        onFileSelect={onFileSelect}
        preview={preview}
        onClear={onClear}
        loading={loading}
        label="Subí el logo de tu negocio"
        sublabel="PNG, JPG, WEBP de hasta 5MB"
      />
    </div>
  );
}
