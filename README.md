# M4S Merger Tool (Web) | [中文文档](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8.svg)
![FFmpeg](https://img.shields.io/badge/FFmpeg-WASM-005900.svg)     
**No Installation Required | No Data Upload | Bilingual (CN/EN) | Fast & Free**

**A modern, browser-based tool for instantly merging fragmented `.m4s` video and audio streams.**

## 🚀 Live Demo : **https://m4s-merger-tools-web.vercel.app/**

<img src="Presentation/Presentation%20Video%20-%20v1.0.0.gif" 
     width="650"/>

| Feature | Description |
| :--- | :--- |
| **Zero Installation** | Runs entirely in the browser. No need to download Python, FFmpeg, or executable files. |
| **Privacy First** | Files are processed locally using WebAssembly. Your media never leaves your device. |
| **Modern UI/UX** | Features an elegant "Dark SaaS" style with a frosted glass aesthetic. Supports **Light**, **Dark**, and **System Default** themes. |
| **Flexible Merging** | Supports merging video fragments, audio fragments separately, or muxing them into the final MP4. |
| **Bilingual Support** | Full support for Simplified Chinese and English (UI and logs). |
| **Blazing Fast Processing** | Uses "copy encoding" mode for extremely fast merging without re-encoding. |


## Other Information
   
<details>
   <summary>1. Requirements & Limitations</summary>
   
   - **Browser**: Requires a modern browser (Chrome, Edge, Firefox).
   - **SharedArrayBuffer**: The server hosting this application must send the `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` response headers for FFmpeg WASM to function correctly.
   - **Memory**: Merging very large files may consume significant RAM, as the files need to be loaded into browser memory.
   
</details>

<details>
   <summary>2. Development Stack</summary>

   - **Frontend**: React 19, TypeScript
   - **Styling**: Tailwind CSS v3, Lucide React (Icons)
   - **Core Engine**: FFmpeg.wasm (WebAssembly)
   - **Build Tool**: Vite
   
</details>

<details>
   <summary>3. Developer Guide</summary>
   
   1. **Clone the Repository**
      ```bash
         git clone https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git
         cd M4S-Merger-Tool
         ```
      
   2. **Install Dependencies**
      ```bash
      npm install
      ```
   3. **Start the Development Server**
      ```bash
      npm run dev
      ```
   4. **Open in Browser**
      Visit `http://localhost:5173` (or the port displayed in the terminal).
      
</details>

<details>
   <summary>4. License</summary>
   
   This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
   
</details>

## 🤝 Contribution & Contact

Issues and Pull Requests are welcome!  
For any questions or suggestions, please contact Zheyuan (Max) Kong (Carnegie Mellon University, Pittsburgh, PA).

Welcome to submit Issues and Pull Requests!  
Any questions or suggestions? Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

Zheyuan (Max) Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
