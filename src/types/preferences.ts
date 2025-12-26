/**
 * 包过滤器类型
 */
export type PackageFilter = 'all' | 'formula' | 'cask' | 'outdated' | 'favorites';

/**
 * 排序选项
 */
export type SortOption = 'name' | 'type' | 'status';

/**
 * 排序方向
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 主题选项
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 语言选项
 */
export type Language = 'zh' | 'en';

/**
 * 自动刷新间隔选项（分钟）
 */
export type AutoRefreshInterval = 0 | 5 | 10 | 30 | 60;

/**
 * 用户偏好设置
 */
export interface UserPreferences {
  /** 当前过滤器 */
  filter: PackageFilter;
  /** 排序字段 */
  sortBy: SortOption;
  /** 排序方向 */
  sortDirection: SortDirection;
  /** 主题 */
  theme: Theme;
  /** 语言 */
  language: Language;
  /** 自动刷新间隔（分钟，0表示关闭） */
  autoRefreshInterval: AutoRefreshInterval;
  /** 收藏的包 */
  favorites: string[];
}

/**
 * 操作历史记录
 */
export interface OperationHistory {
  /** 唯一ID */
  id: string;
  /** 操作类型 */
  type: 'install' | 'uninstall' | 'upgrade' | 'update' | 'cleanup';
  /** 包名（如果适用） */
  packageName?: string;
  /** 是否成功 */
  success: boolean;
  /** 时间戳 */
  timestamp: number;
}

/**
 * 默认用户偏好
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  filter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
  theme: 'system',
  language: 'zh',
  autoRefreshInterval: 0,
  favorites: [],
};

/**
 * 过滤器显示名称
 */
export const FILTER_LABELS: Record<PackageFilter, string> = {
  all: '全部',
  formula: 'Formula',
  cask: 'Cask',
  outdated: '可更新',
  favorites: '收藏',
};

/**
 * 排序选项显示名称
 */
export const SORT_LABELS: Record<SortOption, string> = {
  name: '名称',
  type: '类型',
  status: '状态',
};
