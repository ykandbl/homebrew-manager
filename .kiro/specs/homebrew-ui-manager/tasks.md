# Implementation Plan: Homebrew UI Manager

## Overview

基于 Tauri + React + TypeScript 构建 Homebrew 图形化管理器。实现分为项目初始化、后端命令、前端组件、集成测试四个阶段。

## Tasks

- [x] 1. 项目初始化和基础设施
  - [x] 1.1 创建 Tauri + React + TypeScript 项目结构
    - 使用 `create-tauri-app` 初始化项目
    - 配置 TypeScript、ESLint、Prettier
    - 安装依赖: react, react-dom, @tauri-apps/api
    - _Requirements: 6.1_

  - [x] 1.2 定义核心数据类型和接口
    - 创建 `src/types/index.ts` 定义 Package、PackageInfo、CommandOutput 等类型
    - 创建 `src/types/preferences.ts` 定义用户偏好类型
    - _Requirements: 1.2, 2.2_

  - [ ]* 1.3 编写数据类型的属性测试
    - **Property 1: Package Display Completeness**
    - **Validates: Requirements 1.2, 2.2**

- [x] 2. Rust 后端命令实现
  - [x] 2.1 实现 Homebrew 检测和基础命令执行
    - 创建 `src-tauri/src/homebrew.rs` 模块
    - 实现 `check_homebrew()` 检测 Homebrew 是否安装
    - 实现通用命令执行函数 `execute_command()`
    - _Requirements: 1.4_

  - [x] 2.2 实现列出已安装包的命令
    - 实现 `list_installed()` 调用 `brew list --formula --json` 和 `brew list --cask`
    - 解析 JSON 输出为 Package 结构
    - _Requirements: 1.1, 1.2_

  - [x] 2.3 实现搜索包的命令
    - 实现 `search_packages(query)` 调用 `brew search <query>`
    - 解析搜索结果
    - _Requirements: 2.1_

  - [x] 2.4 实现包详情获取命令
    - 实现 `get_package_info(name, is_cask)` 调用 `brew info <name> --json`
    - 解析详细信息包括描述、依赖等
    - _Requirements: 1.3_

  - [x] 2.5 实现安装/卸载/更新命令
    - 实现 `install_package(name, is_cask)`
    - 实现 `uninstall_package(name, is_cask)`
    - 实现 `upgrade_package(name, is_cask)`
    - 实现 `get_outdated()` 获取可更新的包
    - _Requirements: 3.1, 4.2, 5.1, 5.2_

  - [ ]* 2.6 编写命令生成的属性测试
    - **Property 2: Command Generation Correctness**
    - **Validates: Requirements 3.1, 4.2, 5.2**

- [x] 3. Checkpoint - 后端功能验证
  - 确保所有 Rust 命令可以正确执行
  - 确保 JSON 解析正确
  - 如有问题请询问用户

- [x] 4. 前端核心组件实现
  - [x] 4.1 创建应用状态管理
    - 创建 `src/hooks/usePackages.ts` 管理包列表状态
    - 创建 `src/hooks/usePreferences.ts` 管理用户偏好
    - 实现与 Tauri 后端的通信
    - _Requirements: 1.1, 6.5_

  - [x] 4.2 实现 PackageList 组件
    - 创建 `src/components/PackageList.tsx`
    - 显示包名、版本、类型
    - 支持选中状态
    - 显示安装/更新状态标识
    - _Requirements: 1.2, 2.2, 2.3, 5.1_

  - [ ]* 4.3 编写安装状态一致性的属性测试
    - **Property 3: Installation Status Consistency**
    - **Validates: Requirements 2.3, 5.1**

  - [x] 4.4 实现 SearchBar 组件
    - 创建 `src/components/SearchBar.tsx`
    - 实现防抖搜索 (300ms)
    - 显示搜索状态
    - _Requirements: 2.1_

  - [x] 4.5 实现 FilterTabs 组件
    - 创建 `src/components/FilterTabs.tsx`
    - 支持 All/Formula/Cask/Outdated 筛选
    - 显示各类型数量
    - _Requirements: 6.2_

  - [ ]* 4.6 编写过滤功能的属性测试
    - **Property 4: Filter Correctness**
    - **Validates: Requirements 6.2**

  - [x] 4.7 实现排序功能
    - 在 `src/utils/sort.ts` 实现排序函数
    - 支持按名称、类型、状态排序
    - _Requirements: 6.3_

  - [ ]* 4.8 编写排序功能的属性测试
    - **Property 5: Sort Correctness**
    - **Validates: Requirements 6.3**

- [x] 5. Checkpoint - 前端核心功能验证
  - 确保列表显示正确
  - 确保搜索、过滤、排序功能正常
  - 如有问题请询问用户

- [x] 6. 前端交互组件实现
  - [x] 6.1 实现 PackageDetails 组件
    - 创建 `src/components/PackageDetails.tsx`
    - 显示包详细信息：描述、版本、依赖、主页链接
    - 显示安装/卸载/更新按钮
    - _Requirements: 1.3_

  - [x] 6.2 实现 ProgressModal 组件
    - 创建 `src/components/ProgressModal.tsx`
    - 显示操作进度和输出日志
    - 支持成功/失败状态显示
    - _Requirements: 3.2, 4.3, 5.4_

  - [x] 6.3 实现确认对话框
    - 创建 `src/components/ConfirmDialog.tsx`
    - 用于卸载确认
    - _Requirements: 4.1_

  - [x] 6.4 实现错误处理和提示
    - 创建 `src/components/ErrorBoundary.tsx`
    - 创建 `src/components/Toast.tsx` 用于成功/失败提示
    - 实现 Homebrew 未安装的错误页面
    - _Requirements: 1.4, 3.3, 3.4, 4.4, 4.5_

- [x] 7. 用户偏好持久化
  - [x] 7.1 实现偏好存储
    - 使用 Tauri 的 store 插件或 localStorage
    - 保存过滤器、排序选项
    - 应用启动时加载偏好
    - _Requirements: 6.5_

  - [ ]* 7.2 编写偏好持久化的属性测试
    - **Property 6: Preferences Persistence Round-Trip**
    - **Validates: Requirements 6.5**

- [x] 8. 主界面集成
  - [x] 8.1 组装主界面 App 组件
    - 创建 `src/App.tsx` 整合所有组件
    - 实现响应式布局
    - 连接所有状态和事件处理
    - _Requirements: 6.1, 6.4_

  - [x] 8.2 实现安装/卸载/更新流程
    - 连接按钮点击到后端命令
    - 显示进度模态框
    - 完成后刷新列表
    - _Requirements: 3.1, 3.2, 3.3, 4.2, 4.3, 4.4, 5.2, 5.3_

- [x] 9. Final Checkpoint - 完整功能验证
  - 确保所有功能正常工作
  - 确保所有测试通过
  - 如有问题请询问用户

## Notes

- 标记 `*` 的任务为可选的属性测试任务，可跳过以加快 MVP 开发
- 每个任务都引用了具体的需求条款以确保可追溯性
- Checkpoint 任务用于阶段性验证，确保增量开发的正确性
- 属性测试使用 fast-check 库，验证通用正确性属性
