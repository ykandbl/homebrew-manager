import type { Package } from '../types';
import './PackageList.css';

interface PackageListProps {
  packages: Package[];
  selectedId: string | null;
  onSelect: (pkg: Package) => void;
  isLoading?: boolean;
}

export function PackageList({ packages, selectedId, onSelect, isLoading }: PackageListProps) {
  if (isLoading) {
    return (
      <div className="package-list package-list--loading">
        <div className="loading-spinner" />
        <span>加载中...</span>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="package-list package-list--empty">
        <span>没有找到软件包</span>
      </div>
    );
  }

  return (
    <div className="package-list">
      {packages.map((pkg) => (
        <div
          key={`${pkg.name}-${pkg.type}`}
          className={`package-item ${selectedId === pkg.name ? 'package-item--selected' : ''}`}
          onClick={() => onSelect(pkg)}
        >
          <div className="package-item__main">
            <span className="package-item__name">{pkg.name}</span>
            <span className={`package-item__type package-item__type--${pkg.type}`}>
              {pkg.type}
            </span>
          </div>
          <div className="package-item__meta">
            {pkg.version && (
              <span className="package-item__version">{pkg.version}</span>
            )}
            {pkg.outdated && (
              <span className="package-item__badge package-item__badge--outdated">
                可更新
              </span>
            )}
            {pkg.installed && !pkg.outdated && (
              <span className="package-item__badge package-item__badge--installed">
                已安装
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
