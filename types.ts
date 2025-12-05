export interface LogMessage {
  type: 'info' | 'error' | 'success';
  message: string;
  timestamp: number;
}

export enum ProcessingState {
  IDLE = 'IDLE',
  LOADING_CORE = 'LOADING_CORE',
  WRITING_FILES = 'WRITING_FILES',
  MERGING = 'MERGING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface MergedFile {
  url: string;
  name: string;
  size: number;
}

declare global {
  interface Window {
    FFmpeg: {
      createFFmpeg: (options: any) => any;
      fetchFile: (file: File | Blob | string) => Promise<Uint8Array>;
    };
  }
}