import type { Package } from '../types';
import type { SortOption, SortDirection } from '../types/preferences';

/**
 * 根据排序选项和方向对包列表进行排序
 */
export function sortPackages(
  packages: Package[],
  sortBy: SortOption,
  direction: SortDirection
): Package[] {
  const sorted = [...packages].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        break;

      case 'type':
        // formula 排在 cask 前面
        if (a.type !== b.type) {
          comparison = a.type === 'formula' ? -1 : 1;
        } else {
          // 同类型按名称排序
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        break;

      case 'status':
        // 排序优先级：outdated > installed > not installed
        const getStatusPriority = (pkg: Package): number => {
          if (pkg.outdated) return 0;
          if (pkg.installed) return 1;
          return 2;
        };
        comparison = getStatusPriority(a) - getStatusPriority(b);
        if (comparison === 0) {
          comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
}
