# Changelog | [中文版本](CHANGELOG_ZH.md)

## v2.0.0 – Performance & Reliability Update (2025年12月6日)

### Enhanced Feature: Intelligent M4S Merging
- **Summary**: Implemented an intelligent merging strategy to significantly boost performance while ensuring compatibility and reliability for M4S video and audio streams.
- **Problem Solved**: Addresses the primary performance bottleneck of unnecessary audio re-encoding, dramatically speeding up the merging process. Provides a robust fallback mechanism for maximum compatibility.
- **Feature Details**:
  - **Prioritized Fast Mode**: The tool now first attempts a full stream copy (`-c copy`) for both video and audio. This leverages the pre-encoded nature of most M4S streams for near-instantaneous merging.
  - **Automatic Fallback**: If the fast stream copy mode encounters a compatibility issue (e.g., an unusual audio codec), it gracefully falls back to a safer re-encoding mode (`-c:v copy -c:a 'aac' -strict experimental`) to ensure the merge completes successfully.
  - **Improved User Experience**: Users benefit from significantly faster merges for compatible files, with seamless handling of edge cases without manual intervention.
- **Technical Implementation**:
  - Modified `ffmpegService.ts::mergeFiles` to include a `try-catch` block around the FFmpeg `run` command.
  - First attempt uses `['-c', 'copy']`.
  - On failure, a second attempt is made with `['-c:v', 'copy', '-c:a', 'aac', '-strict', 'experimental']` (if both video and audio inputs exist).

## v1.0.0 – Initial Web Release

### Feature 1: Browser-Based Processing
- **Summary**: Perform all merging operations directly in the browser using WebAssembly.
- **Problem Solved**: Removes the need for users to install FFmpeg, Python, or download suspicious EXE files. No data is uploaded to any server.
- **Feature Details**:
  - Leverages `@ffmpeg/ffmpeg` (WASM) to run a full FFmpeg instance inside the browser.
  - Supports "Copy Codec" operations for extremely fast merging without re-encoding.
- **Technical Implementation**:
  - `ffmpegService.ts` handles the loading of `ffmpeg-core.js` and `ffmpeg.wasm`.
  - Implements a queue-based or stage-based progression system to manage multi-step FFmpeg commands (concat video -> concat audio -> merge).
  - Uses `SharedArrayBuffer` for high-performance memory sharing (requires COOP/COEP headers).

### Feature 2: Modern Dark SaaS UI
- **Summary**: A clean, professional user interface featuring glassmorphism, dynamic theming, and smooth animations.
- **Problem Solved**: Traditional open-source tools often look outdated or "engineer-centric." This provides a consumer-grade UX.
- **Feature Details**:
  - **Glassmorphism**: Translucent cards with `backdrop-blur` effects.
  - **Dynamic Theming**: Supports Light, Dark, and System (Auto) modes with instant switching.
  - **Responsive**: Fully responsive layout that works on different screen sizes.
- **Technical Implementation**:
  - Built with **React** and **Tailwind CSS**.
  - Uses CSS variables and Tailwind's `dark:` modifiers for seamless theme transitions.
  - Custom `DropZone` components with drag-and-drop state handling.

### Feature 3: Single Stream & Partial Merge Support
- **Summary**: Flexibility to merge only video segments, only audio segments, or both.
- **Problem Solved**: Users sometimes only have one track or want to fix a specific stream without processing the other.
- **Feature Details**:
  - The "Merge" button automatically enables if *any* valid input is detected.
  - Smart logic detects missing inputs and adjusts the FFmpeg command to simple copy operations.
- **Technical Implementation**:
  - `App.tsx` validation logic checks `videoFiles.length || audioFiles.length`.
  - `ffmpegService.ts` dynamically constructs the command args array based on input presence (e.g., omitting `-map 0:a` if no audio).

### Feature 4: Internationalization (i18n)
- **Summary**: Full support for English and Simplified Chinese.
- **Problem Solved**: Accessibility for both global users and the primary user base (Bilibili users often deal with M4S files).
- **Feature Details**:
  - One-click toggle between languages.
  - All labels, helper texts, logs, and error messages are localized.
- **Technical Implementation**:
  - React state manages the current language key.
  - A comprehensive `translations` object maps keys to localized strings.
  - Local storage persistence for user language preference.