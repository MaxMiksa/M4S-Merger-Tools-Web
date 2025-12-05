import React, { useState, useCallback, useEffect } from 'react';
import { Layers, Download, RefreshCw, AlertCircle, PlayCircle, Settings2, Sun, Moon, Languages, Sparkles, Monitor } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { LogViewer } from './components/LogViewer';
import { ffmpegService } from './services/ffmpegService';
import { ProcessingState, LogMessage, MergedFile } from './types';

type Language = 'en' | 'zh';
type Theme = 'dark' | 'light' | 'system';

interface Translation {
  heroTitle: string;
  heroSubtitle: string;
  dropzones: {
    videoLabel: string;
    audioLabel: string;
    helper: string;
    addMore: string;
    addHint: string;
    clear: string;
  };
  formatLabel: string;
  mergeButton: string;
  processingLabel: string;
  startOver: string;
  download: string;
  privacy: string;
  toggles: {
    language: string;
    light: string;
    dark: string;
    system: string;
  };
  logs: {
    title: string;
    waiting: string;
    initializing: string;
    loadingCore: string;
    coreLoaded: string;
    readingInputs: (videos: number, audios: number) => string;
    mergeCompleted: string;
    crossOrigin: string;
    sharedArrayTip: string;
    errorPrefix: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    heroTitle: 'M4S Merger GUI',
    heroSubtitle: 'Merge segmented .m4s video and audio streams instantly in your browser. No installation required.',
    dropzones: {
      videoLabel: 'Video Stream (.m4s)',
      audioLabel: 'Audio Stream (.m4s)',
      helper: 'Drag & drop or click to select. Supports multiple files.',
      addMore: 'Add more',
      addHint: 'Click or drop more files to add',
      clear: 'Clear',
    },
    formatLabel: 'Format: Copy Codec (Fast) · Multi-segment supported',
    mergeButton: 'Merge Files',
    processingLabel: 'Processing...',
    startOver: 'Start Over',
    download: 'Download MP4',
    privacy: 'Files are processed entirely within your browser using WebAssembly. Your media is never uploaded to any server. Large files may require significant RAM.',
    toggles: {
      language: '中文 / English',
      light: 'Light mode',
      dark: 'Dark mode',
      system: 'Follow System',
    },
    logs: {
      title: 'PROCESS LOGS',
      waiting: 'Waiting for process start...',
      initializing: 'Initializing process...',
      loadingCore: 'Loading FFmpeg Core (WASM)... This may take a moment first time.',
      coreLoaded: 'FFmpeg Core Loaded Successfully',
      readingInputs: (videos, audios) => `Reading ${videos} video file(s) and ${audios} audio file(s)...`,
      mergeCompleted: 'Merge completed successfully!',
      crossOrigin: 'Browser needs cross-origin isolation (COOP/COEP headers) to run FFmpeg WASM.',
      sharedArrayTip: 'Tip: Ensure the server sends COOP/COEP headers and try a Chromium-based browser.',
      errorPrefix: 'Error: ',
    },
  },
  zh: {
    heroTitle: 'M4S 合并工具',
    heroSubtitle: '在浏览器内即时合并分段 .m4s 视频与音频流，无需安装。',
    dropzones: {
      videoLabel: '视频流 (.m4s)',
      audioLabel: '音频流 (.m4s)',
      helper: '拖拽或点击选择，可一次选择多个片段。',
      addMore: '继续添加',
      addHint: '点击或拖拽以追加文件',
      clear: '清空',
    },
    formatLabel: '格式：复制编码（快速）· 支持多片段',
    mergeButton: '开始合并',
    processingLabel: '处理中...',
    startOver: '重新开始',
    download: '下载 MP4',
    privacy: '文件仅在浏览器内通过 WebAssembly 处理，不会上传到任何服务器。大文件可能需要较多内存。',
    toggles: {
      language: '中文 / English',
      light: '浅色模式',
      dark: '深色模式',
      system: '跟随系统',
    },
    logs: {
      title: '处理日志',
      waiting: '等待任务开始...',
      initializing: '正在初始化...',
      loadingCore: '正在加载 FFmpeg 核心（WASM）...',
      coreLoaded: 'FFmpeg 核心加载完成',
      readingInputs: (videos, audios) => `正在读取 ${videos} 个视频与 ${audios} 个音频片段...`,
      mergeCompleted: '合并成功完成！',
      crossOrigin: '浏览器需要启用跨源隔离（COOP/COEP）才能运行 FFmpeg WASM。',
      sharedArrayTip: '提示：请确保服务器返回 COOP/COEP 头，并尝试使用 Chromium 内核浏览器。',
      errorPrefix: '错误：',
    },
  },
};

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem('language');
  if (stored === 'en' || stored === 'zh') return stored;
  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
};

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem('theme') as Theme | null;
  return stored && ['dark', 'light', 'system'].includes(stored) ? stored : 'system';
};

function App() {
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [mergedFile, setMergedFile] = useState<MergedFile | null>(null);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const t = translations[language];

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (visualTheme: 'dark' | 'light') => {
      if (visualTheme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
  }, [language]);

  const addLog = useCallback((message: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => [...prev, {
      message,
      type,
      timestamp: Date.now()
    }]);
  }, []);

  const handleMerge = async () => {
    if (!videoFiles.length && !audioFiles.length) return;

    setState(ProcessingState.LOADING_CORE);
    setMergedFile(null);
    setLogs([]);
    setProgress(0);
    addLog(t.logs.initializing, 'info');

    if (!window.crossOriginIsolated) {
      setState(ProcessingState.ERROR);
      addLog(t.logs.crossOrigin, 'error');
      return;
    }

    try {
      if (!ffmpegService.isLoaded()) {
        addLog(t.logs.loadingCore, 'info');
        await ffmpegService.load((msg) => {
          if (msg.toLowerCase().includes('loading ffmpeg core')) {
            addLog(msg, 'info');
          }
        });
        addLog(t.logs.coreLoaded, 'success');
      }

      setState(ProcessingState.MERGING);
      addLog(t.logs.readingInputs(videoFiles.length, audioFiles.length));
      
      const blob = await ffmpegService.mergeFiles(
        videoFiles, 
        audioFiles, 
        (prog) => setProgress(Math.round(prog))
      );

      const url = URL.createObjectURL(blob);
      setMergedFile({
        url,
        name: `merged_${Date.now()}.mp4`,
        size: blob.size
      });

      setState(ProcessingState.COMPLETED);
      addLog(t.logs.mergeCompleted, 'success');

    } catch (err: any) {
      console.error(err);
      setState(ProcessingState.ERROR);
      addLog(`${t.logs.errorPrefix}${err.message}`, 'error');
      if (err.message.includes("SharedArrayBuffer")) {
        addLog(t.logs.sharedArrayTip, 'error');
      }
    }
  };

  const handleReset = () => {
    setVideoFiles([]);
    setAudioFiles([]);
    setMergedFile(null);
    setLogs([]);
    setState(ProcessingState.IDLE);
    setProgress(0);
  };

  const isProcessing = state === ProcessingState.LOADING_CORE || state === ProcessingState.MERGING || state === ProcessingState.WRITING_FILES;
  const hasFiles = videoFiles.length > 0 || audioFiles.length > 0;
  
  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'system') return 'light';
      if (prev === 'light') return 'dark';
      return 'system';
    });
  };
  
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'zh' : 'en');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-brand-500 selection:text-white flex flex-col items-center py-12 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient Background Effects */}
      {/* Dark Mode Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none hidden dark:block" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none hidden dark:block" />
      
      {/* Light Mode Glows - Subtle Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-200/20 rounded-full blur-[100px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none dark:hidden" />

      {/* Header */}
      <header className="w-full max-w-5xl mb-16 relative z-10">
        <div className="flex justify-end mb-8">
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-sm hover:shadow-md transition-all">
            <button
              onClick={cycleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              aria-label="Toggle Theme"
              title={theme === 'system' ? t.toggles.system : (theme === 'dark' ? t.toggles.dark : t.toggles.light)}
            >
              {theme === 'system' ? (
                <Monitor size={20} strokeWidth={1.5} />
              ) : theme === 'dark' ? (
                <Moon size={20} strokeWidth={1.5} />
              ) : (
                <Sun size={20} strokeWidth={1.5} />
              )}
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
              aria-label="Toggle Language"
              title={t.toggles.language}
            >
              <Languages size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 shadow-xl ring-4 ring-slate-50 dark:ring-slate-900/50 mb-8 backdrop-blur-xl">
            <Layers className="text-brand-500 w-10 h-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-b dark:from-white dark:via-slate-200 dark:to-slate-400 mb-6 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-5xl relative z-10">
        <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none ring-1 ring-black/5 dark:ring-white/5">
          
          {/* Step 1: File Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-stretch gap-6 mb-8">
            <DropZone 
              label={t.dropzones.videoLabel} 
              helperText={t.dropzones.helper}
              addMoreLabel={t.dropzones.addMore}
              addMoreHint={t.dropzones.addHint}
              clearLabel={t.dropzones.clear}
              accept=".m4s,.mp4"
              icon="video"
              files={videoFiles} 
              onFilesAdd={(incoming) => setVideoFiles(prev => [...prev, ...incoming])} 
              onRemoveFile={(index) => setVideoFiles(prev => prev.filter((_, i) => i !== index))}
              onClear={() => setVideoFiles([])}
              disabled={isProcessing}
            />
            <DropZone 
              label={t.dropzones.audioLabel} 
              helperText={t.dropzones.helper}
              addMoreLabel={t.dropzones.addMore}
              addMoreHint={t.dropzones.addHint}
              clearLabel={t.dropzones.clear}
              accept=".m4s,.m4a,.mp3"
              icon="audio"
              files={audioFiles} 
              onFilesAdd={(incoming) => setAudioFiles(prev => [...prev, ...incoming])} 
              onRemoveFile={(index) => setAudioFiles(prev => prev.filter((_, i) => i !== index))}
              onClear={() => setAudioFiles([])}
              disabled={isProcessing}
            />
          </div>

          {/* Step 2: Actions & Progress */}
          <div className="space-y-8">
            {/* Progress Bar */}
            {(isProcessing || state === ProcessingState.COMPLETED) && (
              <div className="w-full bg-slate-200 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(14,165,233,0.5)]"
                  style={{ width: `${state === ProcessingState.LOADING_CORE ? 10 : Math.max(10, progress)}%` }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col xl:flex-row gap-8 items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800/50">
               
               {/* Format Label */}
               <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/50 w-full xl:w-auto">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 shadow-sm">
                    <Settings2 size={18} />
                  </div>
                  <span className="text-base font-medium text-slate-600 dark:text-slate-300 truncate">{t.formatLabel}</span>
               </div>

               <div className="flex gap-4 w-full xl:w-auto justify-end">
                  {state === ProcessingState.COMPLETED ? (
                    <>
                      <button 
                        onClick={handleReset}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-lg min-w-[160px]"
                      >
                        <RefreshCw size={20} />
                        {t.startOver}
                      </button>
                      <a 
                        href={mergedFile?.url} 
                        download={mergedFile?.name}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/20 ring-1 ring-white/10 transition-all hover:scale-[1.02] active:scale-[0.98] text-lg min-w-[200px]"
                      >
                        <Download size={20} />
                        {t.download}
                      </a>
                    </>
                  ) : (
                    <button
                      onClick={handleMerge}
                      disabled={!hasFiles || isProcessing}
                      className={`
                        w-full xl:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ring-1 ring-white/10 min-w-[200px]
                        ${!hasFiles || isProcessing
                          ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-slate-800 cursor-not-allowed shadow-none'
                          : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/20 hover:scale-[1.02] active:scale-[0.98]'
                        }
                      `}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={20} className="animate-spin" />
                          {t.processingLabel}
                        </>
                      ) : (
                        <>
                          <PlayCircle size={20} className="fill-current" />
                          {t.mergeButton}
                        </>
                      )}
                    </button>
                  )}
               </div>
            </div>
          </div>

          {/* Logs Area */}
          <div className="mt-12">
             <LogViewer logs={logs} title={t.logs.title} emptyMessage={t.logs.waiting} />
             
             {/* Privacy Notice */}
             <div className="mt-6 flex items-start gap-3 text-sm text-slate-500 dark:text-slate-500 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-800/50">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <p className="leading-relaxed">
                  {t.privacy}
                </p>
             </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-16 pb-8 text-slate-500 dark:text-slate-600 text-sm text-center relative z-10 space-y-4">
        <div className="flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <Sparkles size={14} className="text-brand-500" />
          <span className="font-medium">{t.heroTitle}</span>
          <span className="text-xs bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">v1.0.0</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex flex-col items-center gap-2 text-xs opacity-60 hover:opacity-90 transition-opacity">
           <p>Created by <span className="font-medium text-slate-700 dark:text-slate-400">Zheyuan (Max) Kong</span></p>
           <a 
             href="https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git" 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:text-brand-600 dark:hover:text-brand-400 hover:underline decoration-brand-500/30 underline-offset-4 transition-all"
           >
             https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git
           </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
