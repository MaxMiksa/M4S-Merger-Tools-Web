# M4S 合并工具 (Web) | [English Documentation](README.md)

**一款现代化的浏览器端工具，用于即时合并分段的 `.m4s` 视频和音频流。**

基于 **FFmpeg WASM**、**React** 和 **Tailwind CSS** 构建。无需安装，无数据上传，安全隐私。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38bdf8.svg)
![FFmpeg](https://img.shields.io/badge/FFmpeg-WASM-005900.svg)

## ✨ 功能特性

| 特性 | 描述 |
| :--- | :--- |
| 🚀 **零安装** | 完全在浏览器中运行。无需下载 Python、FFmpeg 或 EXE 文件。 |
| 🔒 **隐私优先** | 使用 WebAssembly 在本地处理文件。您的媒体文件从未离开您的设备。 |
| 🎨 **现代化界面** | 精美的“深色 SaaS”风格与磨砂玻璃质感。支持 **浅色**、**深色** 和 **跟随系统** 主题。 |
| 🎞️ **灵活合并** | 支持单独合并视频片段、音频片段，或将其混流为最终的 MP4。 |
| 🌐 **双语支持** | 全面支持简体中文和英文（界面与日志）。 |
| ⚡ **极速处理** | 使用“复制编码”模式进行极速合并，无需重新编码。 |

## 🚀 快速开始

### 在线版本
(在此处添加您的 Vercel/Netlify/GitHub Pages 部署链接)
> *即将上线*

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/MaxMiksa/M4S-Merger-Tools-Web.git
   cd m4s-merger-pro
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

## 🛠️ 技术栈

- **前端**: React 19, TypeScript
- **样式**: Tailwind CSS v3, Lucide React (图标)
- **核心引擎**: FFmpeg.wasm (WebAssembly)
- **构建工具**: Vite

## ⚠️ 需求与限制

- **浏览器**: 需要现代浏览器（Chrome, Edge, Firefox）。
- **SharedArrayBuffer**: 托管此应用的服务器必须发送 `Cross-Origin-Opener-Policy: same-origin` 和 `Cross-Origin-Embedder-Policy: require-corp` 响应头，以便 FFmpeg WASM 正常工作。
- **内存**: 合并非常大的文件可能会消耗大量 RAM，因为文件需要加载到浏览器内存中。

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🤝 联系方式

作者：**Zheyuan (Max) Kong**  
Carnegie Mellon University, Pittsburgh, PA  
邮箱：[kongzheyuan@outlook.com](mailto:kongzheyuan@outlook.com) | [zheyuank@andrew.cmu.edu](mailto:zheyuank@andrew.cmu.edu)
