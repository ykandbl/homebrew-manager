# Design Document: Homebrew UI Manager

## Overview

Homebrew UI Manager 是一个基于 Tauri + React + TypeScript 的桌面应用程序，为 macOS 用户提供图形化的 Homebrew 包管理界面。应用通过调用 Homebrew CLI 命令并解析其 JSON 输出来实现所有功能。

### 技术选型理由

- **Tauri**: 相比 Electron，Tauri 应用体积小约 75%，内存占用低约 90%，启动速度更快。使用系统原生 WebView，非常适合这种轻量级工具应用。
- **React + TypeScript**: 成熟的前端框架，类型安全，组件化开发。
- **Rust Backend**: Tauri 的 Rust 后端负责执行 shell 命令，提供安全的系统交互。

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Tauri Application                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 React Frontend                       │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │    │
│  │  │  Package  │ │  Search   │ │    Package        │  │    │
│  │  │   List    │ │   Bar     │ │    Details        │  │    │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────────────┐  │    │
│  │  │  Filter   │ │  Action   │ │    Progress       │  │    │
│  │  │   Tabs    │ │  Buttons  │ │    Modal          │  │    │
│  │  └───────────┘ └───────────┘ └───────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                    Tauri IPC Bridge                          │
│                           │                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                  Rust Backend                        │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │              Homebrew Service                  │  │    │
│  │  │  - execute_command()                          │  │    │
│  │  │  - list_installed()                           │  │    │
│  │  │  - search_packages()                          │  │    │
│  │  │  - install_package()                          │  │    │
│  │  │  - uninstall_package()                        │  │    │
│  │  │  - get_outdated()                             │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                    Shell Commands
                           │
                    ┌──────▼──────┐
                    │  Homebrew   │
                    │    CLI      │
                    └─────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. App Component
主应用容器，管理全局状态和路由。

```typescript
interface AppState {
  packages: Package[];
  selectedPackage: Package | null;
  filter: PackageFilter;
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
}
```

#### 2. PackageList Component
显示软件包列表，支持虚拟滚动以处理大量包。

```typescript
interface PackageListProps {
  packages: Package[];
  selectedId: string | null;
  onSelect: (pkg: Package) => void;
  onInstall: (pkg: Package) => void;
  onUninstall: (pkg: Package) => void;
  onUpdate: (pkg: Package) => void;
}
```

#### 3. SearchBar Component
搜索输入框，支持防抖搜索。

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}
```

#### 4. PackageDetails Component
显示选中包的详细信息。

```typescript
interface PackageDetailsProps {
  package: Package | null;
  onInstall: () => void;
  onUninstall: () => void;
  onUpdate: () => void;
}
```

#### 5. FilterTabs Component
筛选标签页（全部/Formula/Cask）。

```typescript
interface FilterTabsProps {
  activeFilter: PackageFilter;
  onChange: (filter: PackageFilter) => void;
  counts: { all: number; formula: number; cask: number };
}
```

#### 6. ProgressModal Component
显示操作进度的模态框。

```typescript
interface ProgressModalProps {
  isOpen: boolean;
  operation: OperationType;
  packageName: string;
  output: string[];
  onClose: () => void;
}
```

### Backend Commands (Rust)

#### Tauri Commands Interface

```rust
// 列出所有已安装的包
#[tauri::command]
async fn list_installed() -> Result<Vec<Package>, String>

// 搜索包
#[tauri::command]
async fn search_packages(query: String) -> Result<Vec<Package>, String>

// 获取包详情
#[tauri::command]
async fn get_package_info(name: String, is_cask: bool) -> Result<PackageInfo, String>

// 安装包
#[tauri::command]
async fn install_package(name: String, is_cask: bool) -> Result<CommandOutput, String>

// 卸载包
#[tauri::command]
async fn uninstall_package(name: String, is_cask: bool) -> Result<CommandOutput, String>

// 更新包
#[tauri::command]
async fn upgrade_package(name: String, is_cask: bool) -> Result<CommandOutput, String>

// 获取过时的包
#[tauri::command]
async fn get_outdated() -> Result<Vec<OutdatedPackage>, String>

// 检查 Homebrew 是否安装
#[tauri::command]
async fn check_homebrew() -> Result<bool, String>
```

### Homebrew CLI Commands Mapping

| 功能 | Homebrew 命令 |
|------|---------------|
| 列出已安装 formula | `brew list --formula --json` |
| 列出已安装 cask | `brew list --cask` |
| 搜索包 | `brew search <query>` |
| 获取包信息 | `brew info <name> --json` |
| 获取 cask 信息 | `brew info --cask <name> --json` |
| 安装 formula | `brew install <name>` |
| 安装 cask | `brew install --cask <name>` |
| 卸载 formula | `brew uninstall <name>` |
| 卸载 cask | `brew uninstall --cask <name>` |
| 获取过时包 | `brew outdated --json` |
| 更新包 | `brew upgrade <name>` |

## Data Models

### Package

```typescript
interface Package {
  name: string;
  version: string;
  type: 'formula' | 'cask';
  installed: boolean;
  outdated: boolean;
  description?: string;
}
```

### PackageInfo (详细信息)

```typescript
interface PackageInfo {
  name: string;
  fullName: string;
  version: string;
  type: 'formula' | 'cask';
  description: string;
  homepage: string;
  installed: boolean;
  installedVersion?: string;
  outdated: boolean;
  dependencies: string[];
  installPath?: string;
}
```

### OutdatedPackage

```typescript
interface OutdatedPackage {
  name: string;
  currentVersion: string;
  latestVersion: string;
  type: 'formula' | 'cask';
}
```

### CommandOutput

```typescript
interface CommandOutput {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number;
}
```

### Filter and Sort Types

```typescript
type PackageFilter = 'all' | 'formula' | 'cask' | 'outdated';

type SortOption = 'name' | 'type' | 'status';

interface UserPreferences {
  filter: PackageFilter;
  sortBy: SortOption;
  theme: 'light' | 'dark' | 'system';
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Package Display Completeness

*For any* package displayed in the UI (whether from installed list or search results), the rendered output SHALL contain the package name, version (if installed), and type (formula/cask).

**Validates: Requirements 1.2, 2.2**

### Property 2: Command Generation Correctness

*For any* package operation (install, uninstall, upgrade) and *for any* package type (formula or cask), the generated Homebrew command SHALL be syntactically correct and use the appropriate flags:
- Formula install: `brew install <name>`
- Cask install: `brew install --cask <name>`
- Formula uninstall: `brew uninstall <name>`
- Cask uninstall: `brew uninstall --cask <name>`
- Upgrade: `brew upgrade <name>`

**Validates: Requirements 3.1, 4.2, 5.2**

### Property 3: Installation Status Consistency

*For any* package in the search results, if that package exists in the local installed packages list, it SHALL be marked as `installed: true`. Conversely, if a package is not in the installed list, it SHALL be marked as `installed: false`.

**Validates: Requirements 2.3, 5.1**

### Property 4: Filter Correctness

*For any* list of packages and *for any* filter type (formula/cask/all/outdated), applying the filter SHALL return only packages that match the filter criteria:
- `formula`: only packages with `type === 'formula'`
- `cask`: only packages with `type === 'cask'`
- `outdated`: only packages with `outdated === true`
- `all`: all packages unchanged

**Validates: Requirements 6.2**

### Property 5: Sort Correctness

*For any* list of packages and *for any* sort option (name/type/status), the resulting list SHALL be correctly ordered:
- `name`: alphabetically by package name (case-insensitive)
- `type`: grouped by type (formula first, then cask)
- `status`: outdated packages first, then installed, then not installed

**Validates: Requirements 6.3**

### Property 6: Preferences Persistence Round-Trip

*For any* valid user preferences object, saving preferences to storage and then loading them back SHALL produce an equivalent preferences object.

**Validates: Requirements 6.5**

## Error Handling

### Homebrew Not Installed
- 检测: 执行 `which brew` 或 `brew --version` 失败
- 处理: 显示友好的错误页面，包含 Homebrew 安装链接和说明
- UI: 全屏错误状态，带有"安装 Homebrew"按钮链接到官网

### Command Execution Failures
- 检测: 命令返回非零退出码
- 处理: 解析 stderr 输出，提取错误信息
- UI: 在进度模态框中显示错误，提供"重试"和"关闭"选项

### Network Errors (搜索时)
- 检测: 搜索命令超时或返回网络错误
- 处理: 显示网络错误提示
- UI: 在搜索结果区域显示错误信息和重试按钮

### Permission Errors
- 检测: 命令输出包含 "Permission denied" 或类似信息
- 处理: 提示用户可能需要管理员权限
- UI: 显示权限错误说明

### Invalid Package State
- 检测: JSON 解析失败或数据格式不符合预期
- 处理: 记录错误日志，显示通用错误信息
- UI: 显示"数据加载失败"提示，提供刷新选项

## Testing Strategy

### 测试框架选择

- **前端单元测试**: Vitest + React Testing Library
- **属性测试**: fast-check (JavaScript property-based testing library)
- **E2E 测试**: Playwright (可选)
- **Rust 后端测试**: Rust 内置测试框架

### 单元测试覆盖

1. **React 组件测试**
   - PackageList 渲染正确的包信息
   - SearchBar 防抖功能
   - FilterTabs 切换状态
   - ProgressModal 显示/隐藏逻辑

2. **工具函数测试**
   - 命令生成函数
   - 过滤函数
   - 排序函数
   - JSON 解析函数

3. **Rust 后端测试**
   - 命令构建逻辑
   - JSON 解析逻辑
   - 错误处理逻辑

### 属性测试配置

- 使用 fast-check 库
- 每个属性测试运行最少 100 次迭代
- 测试标注格式: `// Feature: homebrew-ui-manager, Property N: <property_text>`

### 属性测试实现

1. **Property 1 测试**: 生成随机 Package 对象，验证渲染输出包含必要字段
2. **Property 2 测试**: 生成随机包名和类型，验证命令字符串格式正确
3. **Property 3 测试**: 生成随机搜索结果和已安装列表，验证状态标记一致
4. **Property 4 测试**: 生成随机包列表和过滤器，验证过滤结果正确
5. **Property 5 测试**: 生成随机包列表和排序选项，验证排序结果正确
6. **Property 6 测试**: 生成随机偏好设置，验证保存/加载往返一致

### 测试数据生成器

```typescript
// 包名生成器
const packageNameArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-_'.split('')),
  { minLength: 1, maxLength: 50 }
);

// 版本号生成器
const versionArb = fc.tuple(
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 99 }),
  fc.integer({ min: 0, max: 99 })
).map(([major, minor, patch]) => `${major}.${minor}.${patch}`);

// 包类型生成器
const packageTypeArb = fc.constantFrom('formula', 'cask');

// 完整包对象生成器
const packageArb = fc.record({
  name: packageNameArb,
  version: versionArb,
  type: packageTypeArb,
  installed: fc.boolean(),
  outdated: fc.boolean(),
  description: fc.option(fc.string(), { nil: undefined })
});
```
