# 🍺 Homebrew Manager

[English](#english) | [中文](#中文)

---

<a name="english"></a>
## English

A macOS GUI for Homebrew package management built with Tauri + React + TypeScript.

### Features

- 📦 View all installed Homebrew packages (Formula and Cask)
- 📝 Package descriptions for easy identification
- 💾 Disk usage display for each package
- 🔍 Search packages in Homebrew repository
- ⬇️ One-click package installation
- 🗑️ One-click package uninstallation
- 🔄 Detect and update outdated packages
- 🚀 Batch update all outdated packages
- 🔧 Update Homebrew itself
- 🧹 Clean up cache
- 📊 Real-time installation/uninstallation progress display
- 🌓 Light/Dark/System theme support
- 🌍 Multi-language support (English/中文)
- 📌 Pin/Unpin package versions
- 🔗 View package dependencies
- ⌨️ Keyboard shortcuts (⌘+F search, ⌘+R refresh)
- ⭐ Favorite packages for quick access
- 📜 Operation history tracking
- 🔄 Auto-refresh (configurable interval)
- 🖱️ Right-click context menu

### Screenshot

<img src="./screenshots/main.png" alt="Homebrew Manager" width="800">

### Requirements

- macOS 10.15+
- [Homebrew](https://brew.sh) installed

### Installation

#### Download

Download the latest `.dmg` file from [Releases](https://github.com/ykandbl/homebrew-manager/releases), open it and drag the app to Applications folder.

#### Build from Source

```bash
# Clone repository
git clone https://github.com/ykandbl/homebrew-manager.git
cd homebrew-manager

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Rust + Tauri 2.0
- **Styling**: CSS Modules

### License

[MIT License](LICENSE)

---

<a name="中文"></a>
## 中文

一个基于 Tauri + React + TypeScript 构建的 macOS Homebrew 图形化管理工具。

### 功能特性

- 📦 查看所有已安装的 Homebrew 包（Formula 和 Cask）
- 📝 显示软件包功能简介，方便识别
- 💾 显示每个软件包的磁盘占用大小
- �️ 搜索 Homebrew 仓库中的软件包
- ⬇️ 一键安装新软件包
- �️批 一键卸载已安装的软件包
- �  检测并更新过时的软件包
- 🚀 批量更新所有过时软件包
- 🔧 更新 Homebrew 本身
- 🧹 清理缓存
- 📊 实时显示安装/卸载进度
- 🌓 深色/浅色/跟随系统主题切换
- 🌍 多语言支持（English/中文）
- 📌 锁定/解锁软件包版本
- 🔗 查看软件包依赖关系
- ⌨️ 键盘快捷键（⌘+F 搜索，⌘+R 刷新）
- ⭐ 收藏常用软件包
- �  操作历史记录
- 🔄 自动刷新（可配置间隔）
- 🖱️ 右键快捷菜单

### 截图

<img src="./screenshots/main.png" alt="Homebrew Manager" width="800">

### 系统要求

- macOS 10.15+
- 已安装 [Homebrew](https://brew.sh)

### 安装

#### 下载安装

从 [Releases](https://github.com/ykandbl/homebrew-manager/releases) 页面下载最新的 `.dmg` 文件，打开后将应用拖入 Applications 文件夹。

#### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/ykandbl/homebrew-manager.git
cd homebrew-manager

# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建生产版本
npm run tauri build
```

### 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust + Tauri 2.0
- **样式**: CSS Modules

### 许可证

[MIT License](LICENSE)
