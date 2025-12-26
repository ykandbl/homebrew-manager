/**
 * 软件包类型
 */
export type PackageType = 'formula' | 'cask';

/**
 * 软件包基本信息
 */
export interface Package {
  /** 包名 */
  name: string;
  /** 版本号 */
  version: string;
  /** 包类型：formula（命令行工具）或 cask（GUI 应用） */
  type: PackageType;
  /** 是否已安装 */
  installed: boolean;
  /** 是否有可用更新 */
  outdated: boolean;
  /** 包描述 */
  description?: string;
}

/**
 * 软件包详细信息
 */
export interface PackageInfo {
  /** 包名 */
  name: string;
  /** 完整名称（包含 tap） */
  fullName: string;
  /** 版本号 */
  version: string;
  /** 包类型 */
  type: PackageType;
  /** 描述 */
  description: string;
  /** 主页链接 */
  homepage: string;
  /** 是否已安装 */
  installed: boolean;
  /** 已安装的版本 */
  installedVersion?: string;
  /** 是否有可用更新 */
  outdated: boolean;
  /** 依赖列表 */
  dependencies: string[];
  /** 安装路径 */
  installPath?: string;
}

/**
 * 过时的软件包信息
 */
export interface OutdatedPackage {
  /** 包名 */
  name: string;
  /** 当前安装的版本 */
  currentVersion: string;
  /** 最新可用版本 */
  latestVersion: string;
  /** 包类型 */
  type: PackageType;
}

/**
 * 命令执行结果
 */
export interface CommandOutput {
  /** 是否成功 */
  success: boolean;
  /** 标准输出 */
  stdout: string;
  /** 标准错误 */
  stderr: string;
  /** 退出码 */
  exitCode: number;
}

/**
 * 操作类型
 */
export type OperationType = 'install' | 'uninstall' | 'upgrade' | 'search';

/**
 * 操作状态
 */
export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * 进行中的操作
 */
export interface Operation {
  /** 操作类型 */
  type: OperationType;
  /** 目标包名 */
  packageName: string;
  /** 操作状态 */
  status: OperationStatus;
  /** 输出日志 */
  output: string[];
  /** 错误信息 */
  error?: string;
}
