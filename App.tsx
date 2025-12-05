import React, { useState, useCallback, useEffect } from 'react';
import { Layers, Download, RefreshCw, AlertCircle, PlayCircle, Settings2, Sun, Moon, Languages } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { LogViewer } from './components/LogViewer';
import { ffmpegService } from './services/ffmpegService';
import { ProcessingState, LogMessage, MergedFile } from './types';

type Language = 'en' | 'zh';
type Theme = 'dark' | 'light';

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
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('theme');
  return stored === 'light' ? 'light' : 'dark';
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
    document.documentElement.setAttribute('data-theme', theme);
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
    if (!videoFiles.length || !audioFiles.length) return;

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
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'zh' : 'en');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-500 selection:text-white flex flex-col items-center py-12 px-4 sm:px-6">
      
      {/* Header */}
      <header className="w-full max-w-5xl mb-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-200 hover:border-brand-500 transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? t.toggles.light : t.toggles.dark}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-200 hover:border-brand-500 transition-colors"
            >
              <Languages size={16} />
              <span>{t.toggles.language}</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl mb-6">
            <Layers className="text-brand-500 w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 mb-4 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-lg">
            {t.heroSubtitle}
          </p>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl ring-1 ring-white/5">
        
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
        <div className="space-y-6">
          {/* Progress Bar (Visible when processing) */}
          {(isProcessing || state === ProcessingState.COMPLETED) && (
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-brand-500 h-full transition-all duration-300 ease-out"
                style={{ width: `${state === ProcessingState.LOADING_CORE ? 10 : Math.max(10, progress)}%` }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
             <div className="flex items-center gap-2 text-sm text-slate-500">
                <Settings2 size={16} />
                <span>{t.formatLabel}</span>
             </div>

             <div className="flex gap-4 w-full sm:w-auto">
                {state === ProcessingState.COMPLETED ? (
                  <>
                    <button 
                      onClick={handleReset}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-lg hover:bg-slate-800 transition-all hover:scale-105"
                    >
                      <RefreshCw size={18} />
                      {t.startOver}
                    </button>
                    <a 
                      href={mergedFile?.url} 
                      download={mergedFile?.name}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-900/20 transition-all hover:scale-105"
                    >
                      <Download size={18} />
                      {t.download}
                    </a>
                  </>
                ) : (
                  <button
                    onClick={handleMerge}
                    disabled={!videoFiles.length || !audioFiles.length || isProcessing}
                    className={`
                      w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all
                      ${!videoFiles.length || !audioFiles.length || isProcessing
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-900/20 hover:scale-105'
                      }
                    `}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        {t.processingLabel}
                      </>
                    ) : (
                      <>
                        <PlayCircle size={18} />
                        {t.mergeButton}
                      </>
                    )}
                  </button>
                )}
             </div>
          </div>
        </div>

        {/* Logs Area */}
        <div className="mt-8 pt-8 border-t border-slate-800">
           <LogViewer logs={logs} title={t.logs.title} emptyMessage={t.logs.waiting} />
           
           {/* Privacy Notice */}
           <div className="mt-4 flex items-start gap-2 text-xs text-slate-500 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <p>
                {t.privacy}
              </p>
           </div>
        </div>
      </main>
      
      <footer className="mt-12 text-slate-600 text-sm text-center">
        {t.heroTitle} &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

export default App;
