# M4S Merger Tools (Web) | [中文文档](README.md)

**A modern, browser-based tool for merging segmented `.m4s` video and audio streams instantly.**

Powered by **FFmpeg WASM**, **React**, and **Tailwind CSS**. No installation required. No data upload. Secure and private.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8.svg)
![FFmpeg](https://img.shields.io/badge/FFmpeg-WASM-005900.svg)

## ✨ Features

| Feature | Description |
| :--- | :--- |
| 🚀 **Zero Installation** | Runs entirely in your browser. No Python, FFmpeg, or EXE downloads needed. |
| 🔒 **Privacy First** | Files are processed locally using WebAssembly. Your media never leaves your device. |
| 🎨 **Modern UI** | Beautiful "Dark SaaS" aesthetic with Glassmorphism. Supports **Light**, **Dark**, and **System** themes. |
| 🎞️ **Flexible Merging** | Merge video segments, audio segments, or mux them together into a final MP4. |
| 🌐 **Bilingual** | Full support for English and Simplified Chinese (interface & logs). |
| ⚡ **Fast Processing** | Uses "Copy Codec" mode for lightning-fast merging without re-encoding. |

## 🚀 Quick Start

### Online Version
(Deploy your project to Vercel/Netlify/GitHub Pages and add link here)
> *Coming Soon*

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git
   cd m4s-merger-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS v3, Lucide React (Icons)
- **Core Engine**: FFmpeg.wasm (WebAssembly)
- **Build Tool**: Vite

## ⚠️ Requirements & Limitations

- **Browser**: A modern browser (Chrome, Edge, Firefox) is required.
- **SharedArrayBuffer**: The server serving this app must send `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers for FFmpeg WASM to work.
- **Memory**: Merging very large files might consume significant RAM as files are loaded into the browser memory.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contact

Created by **Zheyuan (Max) Kong**  
Carnegie Mellon University, Pittsburgh, PA  
Email: [kongzheyuan@outlook.com](mailto:kongzheyuan@outlook.com) | [zheyuank@andrew.cmu.edu](mailto:zheyuank@andrew.cmu.edu)
