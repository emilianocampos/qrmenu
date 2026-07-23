import React, { useState } from 'react';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { ImageIcon } from 'lucide-react';

interface DesignUploaderProps {
  onImageSelect: (file: File) => void;
  isLoading: boolean;
}

export function DesignUploader({ onImageSelect, isLoading }: DesignUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleClear = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
          <ImageIcon className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-gray-300">
            Subí una imagen de una carta y la IA analizará únicamente el diseño para adaptar automáticamente la apariencia de tu carta digital.
          </p>
          <p className="text-xs text-gray-500 mt-1">Acepta JPG, PNG, WEBP.</p>
        </div>
      </div>
      
      <UploadDropzone
        accept="image/*"
        onFileSelect={handleSelect}
        preview={preview}
        onClear={handleClear}
        loading={isLoading}
      />
    </div>
  );
}
