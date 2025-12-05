import React, { useRef } from 'react';
import { Upload, FileVideo, FileAudio, X, CheckCircle2, Plus } from 'lucide-react';

interface DropZoneProps {
  label: string;
  helperText: string;
  addMoreLabel: string;
  addMoreHint: string;
  clearLabel: string;
  accept: string;
  files: File[];
  onFilesAdd: (files: File[]) => void;
  onClear: () => void;
  onRemoveFile: (index: number) => void;
  icon: 'video' | 'audio';
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ 
  label, 
  helperText,
  addMoreLabel,
  addMoreHint,
  clearLabel,
  accept, 
  files, 
  onFilesAdd, 
  onClear,
  onRemoveFile,
  icon,
  disabled 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length > 0) {
      onFilesAdd(dropped);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const formatSize = (size: number) => (size / 1024 / 1024).toFixed(2);

  return (
    <div className="w-full" onDrop={handleDrop} onDragOver={handleDragOver}>
      <input
        type="file"
        multiple
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const selected = Array.from(e.target.files);
            onFilesAdd(selected);
            e.target.value = '';
          }
        }}
      />
      
      {!files.length ? (
        <div
          onClick={handleClick}
          className={`
            relative group cursor-pointer 
            border-2 border-dashed rounded-xl p-8 
            transition-all duration-200 ease-in-out
            flex flex-col items-center justify-center text-center gap-3
            ${disabled 
              ? 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-50' 
              : 'border-slate-700 bg-slate-900 hover:border-brand-500 hover:bg-slate-800/80'}
          `}
        >
          <div className={`
            p-3 rounded-full 
            ${disabled ? 'bg-slate-800 text-slate-600' : 'bg-slate-800 text-brand-500 group-hover:scale-110 transition-transform'}
          `}>
            {icon === 'video' ? <FileVideo size={24} /> : <FileAudio size={24} />}
          </div>
          <div>
            <p className="font-medium text-slate-200">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{helperText}</p>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`relative border border-slate-700 bg-slate-800/50 rounded-xl p-4 flex flex-col gap-3 transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-brand-500'}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-slate-800 text-brand-500">
                {icon === 'video' ? <FileVideo size={18} /> : <FileAudio size={18} />}
              </div>
              <div>
                <p className="font-semibold text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{helperText}</p>
              </div>
            </div>
            {!disabled && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="text-xs px-3 py-1 rounded-full bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all"
              >
                {clearLabel}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center gap-3 bg-slate-900/50 rounded-lg px-3 py-2"
              >
                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)} MB</p>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!disabled && (
            <div className="flex items-center gap-2 text-sm text-slate-500 pt-1">
              <Upload size={16} />
              <span>{addMoreHint}</span>
            </div>
          )}

          {!disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-900 text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors self-start"
            >
              <Plus size={14} />
              {addMoreLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
