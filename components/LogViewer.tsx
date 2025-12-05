import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { LogMessage } from '../types';

interface LogViewerProps {
  logs: LogMessage[];
  className?: string;
  title: string;
  emptyMessage: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, className = '', title, emptyMessage }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border border-slate-800 bg-slate-950 ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Terminal size={14} />
          <span>{title}</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto max-h-[200px] font-mono text-xs space-y-1 scrollbar-hide">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">{emptyMessage}</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-slate-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 'text-slate-300'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};
