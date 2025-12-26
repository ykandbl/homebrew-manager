/**
 * 包过滤器类型
 */
export type PackageFilter = 'all' | 'formula' | 'cask' | 'outdated';

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
}

/**
 * 默认用户偏好
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  filter: 'all',
  sortBy: 'name',
  sortDirection: 'asc',
  theme: 'system',
};

/**
 * 过滤器显示名称
 */
export const FILTER_LABELS: Record<PackageFilter, string> = {
  all: '全部',
  formula: 'Formula',
  cask: 'Cask',
  outdated: '可更新',
};

/**
 * 排序选项显示名称
 */
export const SORT_LABELS: Record<SortOption, string> = {
  name: '名称',
  type: '类型',
  status: '状态',
};
