class FFmpegService {
  private ffmpeg: any = null;
  private loaded: boolean = false;

  public async load(onLog: (msg: string) => void): Promise<void> {
    if (this.loaded && this.ffmpeg) return;

    if (!window.FFmpeg) {
      throw new Error("FFmpeg library not loaded. Make sure /scripts/ffmpeg assets are available.");
    }

    const { createFFmpeg } = window.FFmpeg;

    const corePath = `${window.location.origin}/scripts/ffmpeg/ffmpeg-core.js`;
    onLog(`Loading FFmpeg core from ${corePath}`);

    this.ffmpeg = createFFmpeg({
      log: true,
      corePath,
    });

    this.ffmpeg.setLogger(({ message }: { message: string }) => {
      onLog(message);
    });

    try {
      await this.ffmpeg.load();
      this.loaded = true;
    } catch (error: any) {
      console.error("Failed to load FFmpeg", error);
      // Fallback messaging for common errors
      if (error.message && error.message.includes("SharedArrayBuffer")) {
        throw new Error("Environment Error: SharedArrayBuffer support is missing.");
      }
      throw new Error("Failed to initialize FFmpeg: " + (error.message || "Unknown error"));
    }
  }

  public async mergeFiles(
    videoFiles: File[],
    audioFiles: File[],
    onProgress: (progress: number) => void
  ): Promise<Blob> {
    if (!this.ffmpeg || !this.loaded) {
      throw new Error("FFmpeg not loaded");
    }

    if (!videoFiles.length || !audioFiles.length) {
      throw new Error("No input files provided.");
    }

    const { fetchFile } = window.FFmpeg;
    const outputName = 'output.mp4';
    const cleanupTargets: string[] = [];
    const encoder = new TextEncoder();

    const stageCount =
      (videoFiles.length > 1 ? 1 : 0) +
      (audioFiles.length > 1 ? 1 : 0) +
      1;
    let completedStages = 0;

    const runStage = async (args: string[]) => {
      this.ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
        const progressValue = Math.min(
          99,
          Math.round(((completedStages + ratio) / stageCount) * 100)
        );
        onProgress(progressValue);
      });
      await this.ffmpeg.run(...args);
      completedStages += 1;
    };

    const writeInputFile = async (file: File, prefix: string, index: number) => {
      const safeName = `${prefix}_${index}_${file.name || 'input.m4s'}`;
      this.ffmpeg.FS('writeFile', safeName, await fetchFile(file));
      cleanupTargets.push(safeName);
      return safeName;
    };

    onProgress(0);

    const videoNames = await Promise.all(
      videoFiles.map((file, index) => writeInputFile(file, 'video', index))
    );
    const audioNames = await Promise.all(
      audioFiles.map((file, index) => writeInputFile(file, 'audio', index))
    );

    const buildConcatList = (names: string[]) =>
      names.map((name) => `file '${name.replace(/'/g, "'\\\\''")}'`).join('\n');

    let videoInput = videoNames[0];
    if (videoFiles.length > 1) {
      const videoListName = `video_list_${Date.now()}.txt`;
      this.ffmpeg.FS('writeFile', videoListName, encoder.encode(buildConcatList(videoNames)));
      cleanupTargets.push(videoListName);

      const concatenatedVideo = `video_concat_${Date.now()}.mp4`;
      await runStage([
        '-f', 'concat',
        '-safe', '0',
        '-i', videoListName,
        '-c', 'copy',
        concatenatedVideo,
      ]);
      cleanupTargets.push(concatenatedVideo);
      videoInput = concatenatedVideo;
    }

    let audioInput = audioNames[0];
    if (audioFiles.length > 1) {
      const audioListName = `audio_list_${Date.now()}.txt`;
      this.ffmpeg.FS('writeFile', audioListName, encoder.encode(buildConcatList(audioNames)));
      cleanupTargets.push(audioListName);

      const concatenatedAudio = `audio_concat_${Date.now()}.m4a`;
      await runStage([
        '-f', 'concat',
        '-safe', '0',
        '-i', audioListName,
        '-c', 'copy',
        concatenatedAudio,
      ]);
      cleanupTargets.push(concatenatedAudio);
      audioInput = concatenatedAudio;
    }

    await runStage([
      '-i', videoInput,
      '-i', audioInput,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-strict', 'experimental',
      outputName,
    ]);

    const data = this.ffmpeg.FS('readFile', outputName);
    cleanupTargets.push(outputName);

    try {
      cleanupTargets.forEach((target) => {
        this.ffmpeg.FS('unlink', target);
      });
    } catch (e) {
      console.warn("Cleanup warning:", e);
    }

    onProgress(100);
    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }
}

export const ffmpegService = new FFmpegService();
