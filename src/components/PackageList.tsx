import type { Package } from '../types';
import type { Language } from '../types/preferences';
import { t } from '../i18n';
import './PackageList.css';

interface PackageListProps {
  packages: Package[];
  pinnedPackages: string[];
  favoritePackages: string[];
  selectedId: string | null;
  onSelect: (pkg: Package) => void;
  onContextMenu: (e: React.MouseEvent, pkg: Package) => void;
  isLoading?: boolean;
  lang: Language;
}

export function PackageList({ packages, pinnedPackages, favoritePackages, selectedId, onSelect, onContextMenu, isLoading, lang }: PackageListProps) {
  if (isLoading) {
    return (
      <div className="package-list package-list--loading">
        <div className="loading-spinner" />
        <span>{t('loading', lang)}</span>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="package-list package-list--empty">
        <span>{lang === 'zh' ? '没有找到软件包' : 'No packages found'}</span>
      </div>
    );
  }

  return (
    <div className="package-list">
      {packages.map((pkg) => {
        const isPinned = pinnedPackages.includes(pkg.name);
        const isFavorite = favoritePackages.includes(pkg.name);
        return (
          <div
            key={`${pkg.name}-${pkg.type}`}
            className={`package-item ${selectedId === pkg.name ? 'package-item--selected' : ''}`}
            onClick={() => onSelect(pkg)}
            onContextMenu={(e) => onContextMenu(e, pkg)}
          >
            <div className="package-item__main">
              <span className="package-item__name">
                {isFavorite && <span className="favorite-icon">⭐</span>}
                {isPinned && <span className="pin-icon">📌</span>}
                {pkg.name}
              </span>
              <span className={`package-item__type package-item__type--${pkg.type}`}>
                {pkg.type}
              </span>
            </div>
            {pkg.description && (
              <div className="package-item__desc">{pkg.description}</div>
            )}
            <div className="package-item__meta">
              {pkg.version && (
                <span className="package-item__version">{pkg.version}</span>
              )}
              {pkg.outdated && (
                <span className="package-item__badge package-item__badge--outdated">
                  {t('outdated', lang)}
                </span>
              )}
              {pkg.installed && !pkg.outdated && (
                <span className="package-item__badge package-item__badge--installed">
                  {t('installed', lang)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
