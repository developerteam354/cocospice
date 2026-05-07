'use client';

import { useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

export interface IUploadedAsset {
  url: string;
  key: string;
  uploading?: boolean;
}

interface ImageUploadProps {
  label: string;
  multiple?: boolean;
  maxFiles?: number;
  assets: IUploadedAsset[];
  onFiles: (files: File[]) => void;
  onRemove: (index: number) => void;
  error?: string;
}

export default function ImageUpload({
  label, multiple = false, maxFiles = 1,
  assets, onFiles, onRemove, error,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onFiles(selected);
    e.target.value = '';
  };

  const canAdd = assets.length < maxFiles;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-[0.9rem] font-bold text-gray-900 tracking-tight">{label}</label>

      <div className="flex flex-wrap gap-4">
        {assets.map((asset, i) => (
          <div key={i} className="relative h-24 w-24 overflow-hidden rounded-[20px] border border-gray-100 bg-gray-50 shadow-sm">
            {asset.uploading ? (
              // Loading spinner while uploading
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 size={24} className="animate-spin text-emerald-500" />
              </div>
            ) : (
              <>
                {/* Use regular img tag for S3 images to avoid Next.js optimization issues */}
                <img 
                  src={asset.url} 
                  alt={`upload-${i}`} 
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute right-1.5 top-1.5 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-gray-200 bg-gray-50/50 text-gray-400 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all active:scale-95"
          >
            <Upload size={24} strokeWidth={2.5} />
            <span className="text-[0.75rem] font-bold uppercase tracking-wider">Upload</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />

      {error && <p className="text-[0.8rem] font-bold text-red-500 mt-1">{error}</p>}
    </div>
  );
}
