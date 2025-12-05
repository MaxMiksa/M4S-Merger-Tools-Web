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
    <div className={`flex flex-col rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner shadow-black/5 dark:shadow-black/20 ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
          <Terminal size={16} className="text-brand-500" />
          <span className="uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50"></div>
        </div>
      </div>
      <div className="flex-1 p-5 overflow-y-auto max-h-[280px] font-sans text-sm leading-relaxed space-y-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {logs.length === 0 && (
          <div className="text-slate-500 dark:text-slate-600 italic px-2">{emptyMessage}</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4 px-2 hover:bg-slate-50 dark:hover:bg-white/5 py-1 rounded transition-colors">
            <span className="text-slate-400 dark:text-slate-600 shrink-0 select-none font-mono text-xs pt-1">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`break-all font-medium ${
              log.type === 'error' ? 'text-red-600 dark:text-red-400' : 
              log.type === 'success' ? 'text-emerald-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-300'
            }`}>
              {log.type === 'success' && '✓ '}
              {log.type === 'error' && '✗ '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};
