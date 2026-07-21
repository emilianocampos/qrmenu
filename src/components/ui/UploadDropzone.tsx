'use client';

import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadDropzoneProps {
  accept?: string;
  onFileSelect: (file: File) => void;
  label?: string;
  sublabel?: string;
  preview?: string | null;
  onClear?: () => void;
  loading?: boolean;
}

export function UploadDropzone({
  accept = 'image/*',
  onFileSelect,
  label = 'Arrastrá y soltá aquí',
  sublabel = 'o hacé clic para seleccionar',
  preview,
  onClear,
  loading = false,
}: UploadDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
        {typeof preview === 'string' && preview.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">{preview}</span>
            </div>
          </div>
        )}
        {onClear && (
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80
                       flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <label
      className={`
        relative flex flex-col items-center justify-center gap-3 h-48
        border-2 border-dashed rounded-xl cursor-pointer
        transition-all duration-200
        ${dragging
          ? 'border-indigo-500 bg-indigo-500/10'
          : 'border-white/20 bg-white/[0.02] hover:bg-white/5 hover:border-white/30'
        }
        ${loading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        disabled={loading}
      />
      <div className="p-3 rounded-xl bg-white/5">
        <Upload className={`w-6 h-6 ${dragging ? 'text-indigo-400' : 'text-gray-400'}`} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
      </div>
    </label>
  );
}
