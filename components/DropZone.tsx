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
    <div className="w-full group/zone" onDrop={handleDrop} onDragOver={handleDragOver}>
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
            relative cursor-pointer 
            border border-dashed rounded-2xl p-8 
            transition-all duration-300 ease-out
            flex flex-col items-center justify-center text-center gap-4
            backdrop-blur-sm
            ${disabled 
              ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/30 opacity-50 cursor-not-allowed' 
              : 'border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-900/60 hover:border-brand-500/50 hover:shadow-lg hover:shadow-brand-500/5'}
          `}
        >
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${disabled 
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600' 
              : 'bg-slate-100 dark:bg-slate-800/50 text-brand-500 ring-1 ring-black/5 dark:ring-white/5 group-hover/zone:scale-110 group-hover/zone:bg-brand-500/10'}
          `}>
            {icon === 'video' ? <FileVideo size={28} strokeWidth={1.5} /> : <FileAudio size={28} strokeWidth={1.5} />}
          </div>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 text-lg transition-colors group-hover/zone:text-brand-600 dark:group-hover/zone:text-brand-200">{label}</p>
            <p className="text-sm text-slate-500 mt-1">{helperText}</p>
          </div>
        </div>
      ) : (
        <div
          className={`
            relative border rounded-2xl p-5 
            flex flex-col gap-4 transition-all ring-1
            bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl
            border-slate-200 dark:border-slate-800
            ring-black/5 dark:ring-white/5
            ${disabled ? 'opacity-60' : 'hover:border-slate-300 dark:hover:border-slate-700'}
          `}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-brand-500 ring-1 ring-black/5 dark:ring-white/5">
                {icon === 'video' ? <FileVideo size={20} strokeWidth={1.5} /> : <FileAudio size={20} strokeWidth={1.5} />}
              </div>
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            {!disabled && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 transition-all"
              >
                {clearLabel}
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {files.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="group/file flex items-center gap-3 bg-white dark:bg-slate-950/30 rounded-lg p-3 border border-slate-200 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="text-brand-500">
                  <CheckCircle2 size={16} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)} MB</p>
                </div>
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors opacity-0 group-hover/file:opacity-100 focus:opacity-100"
                    aria-label="Remove file"
                  >
                    <X size={16} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {!disabled && (
            <div className="pt-2 flex items-center justify-between gap-4">
              <div 
                onClick={handleClick}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 text-sm text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-500/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-all group/add"
              >
                <Plus size={16} className="group-hover/add:scale-110 transition-transform" />
                <span>{addMoreLabel}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
