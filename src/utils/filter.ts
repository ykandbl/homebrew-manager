import type { Package } from '../types';
import type { PackageFilter } from '../types/preferences';

/**
 * 根据过滤器筛选包列表
 */
export function filterPackages(packages: Package[], filter: PackageFilter, favorites: string[] = []): Package[] {
  switch (filter) {
    case 'all':
      return packages;
    case 'formula':
      return packages.filter(pkg => pkg.type === 'formula');
    case 'cask':
      return packages.filter(pkg => pkg.type === 'cask');
    case 'outdated':
      return packages.filter(pkg => pkg.outdated);
    case 'favorites':
      return packages.filter(pkg => favorites.includes(pkg.name));
    default:
      return packages;
  }
}

/**
 * 计算各过滤器的包数量
 */
export function getFilterCounts(packages: Package[], favorites: string[] = []): Record<PackageFilter, number> {
  return {
    all: packages.length,
    formula: packages.filter(pkg => pkg.type === 'formula').length,
    cask: packages.filter(pkg => pkg.type === 'cask').length,
    outdated: packages.filter(pkg => pkg.outdated).length,
    favorites: packages.filter(pkg => favorites.includes(pkg.name)).length,
  };
}
