# M4S 合并工具 (Web) | [English Doc](README.md)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8.svg)
![FFmpeg](https://img.shields.io/badge/FFmpeg-WASM-005900.svg)     

✅ 无需安装（即点即用）| 无需上传数据 | 双语支持（中/英）| 快速且免费  
✅ 视频合并 | 音频合并 | 音视频混流  
✅ .M4S | .MP4 | .MP3  

🌐 在线版（即点即用） ➡️ 本仓库 | https://github.com/MaxMiksa/M4S-Merger-Tools-Web  
🖥️ 离线版（速度快10倍） ➡️ 桌面对应版本 | https://github.com/MaxMiksa/M4S-Merger-Tools  

## 🚀 点开即用 : **https://m4s-merger-tools-web.vercel.app/**

<img src="Presentation/Presentation%20Video%20-%20v1.0.0.gif" 
     width="850"/>

| 特性 | 描述 |
| :--- | :--- |
| **零安装** | 完全在浏览器中运行。无需下载 Python、FFmpeg 或 EXE 文件。 |
| **隐私优先** | 使用 WebAssembly 在本地处理文件。您的媒体文件从未离开您的设备。 |
| **现代化界面** | 精美的“深色 SaaS”风格与磨砂玻璃质感。支持 **浅色**、**深色** 和 **跟随系统** 主题。 |
| **灵活合并** | 支持单独合并视频片段、音频片段，或将其混流为最终的 MP4。 |
| **双语支持** | 全面支持简体中文和英文（界面与日志）。 |
| **极速处理** | **v2.0.0 全新升级**：智能流复制技术，速度提升 **10 倍以上**。默认使用 Copy 模式，并在必要时自动回退以保证兼容性。 |


## 其他
   
<details>
   <summary>1. 需求与限制</summary>
   
   - **浏览器**: 需要现代浏览器（Chrome, Edge, Firefox）。
   - **SharedArrayBuffer**: 托管此应用的服务器必须发送 `Cross-Origin-Opener-Policy: same-origin` 和 `Cross-Origin-Embedder-Policy: require-corp` 响应头，以便 FFmpeg WASM 正常工作。
   - **内存**: 合并非常大的文件可能会消耗大量 RAM，因为文件需要加载到浏览器内存中。
   
</details>

<details>
   <summary>2. 开发与对应技术栈</summary>

   - **前端**: React 19, TypeScript
   - **样式**: Tailwind CSS v3, Lucide React (图标)
   - **核心引擎**: FFmpeg.wasm (WebAssembly)
   - **构建工具**: Vite
   
</details>

<details>
   <summary>3. 开发者手册</summary>
   
   1. **克隆仓库**
      ```bash
         git clone https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git
         cd M4S-Merger-Tool
         ```
      
   2. **安装依赖**
      ```bash
      npm install
      ```
   3. **启动开发服务器**
      ```bash
      npm run dev
      ```
   4. **在浏览器中打开**
      访问 `http://localhost:5173` (或终端显示的端口)。
      
</details>

<details>
   <summary>4. 许可证</summary>
   
   本项目采用 **MIT 许可证** - 详情请参阅 [LICENSE](LICENSE) 文件。
   
</details>

## 🤝 贡献与联系

欢迎提交 Issue 和 Pull Request！  
如有任何问题或建议，请联系 Zheyuan (Max) Kong (卡内基梅隆大学，宾夕法尼亚州)。

Welcome to submit Issues and Pull Requests!  
Any questions or suggestions？Please contact Max Kong (Carnegie Mellon University, Pittsburgh, PA).

Zheyuan (Max) Kong: kongzheyuan@outlook.com | zheyuank@andrew.cmu.edu
