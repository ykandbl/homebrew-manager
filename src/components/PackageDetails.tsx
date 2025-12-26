import type { Package, PackageInfo } from '../types';
import type { Language } from '../types/preferences';
import { t } from '../i18n';
import './PackageDetails.css';

interface PackageDetailsProps {
  package: Package | null;
  packageInfo: PackageInfo | null;
  isLoading: boolean;
  isPinned: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onUpdate: () => void;
  onPin: () => void;
  onViewDeps: () => void;
  lang: Language;
}

export function PackageDetails({
  package: pkg,
  packageInfo,
  isLoading,
  isPinned,
  onInstall,
  onUninstall,
  onUpdate,
  onPin,
  onViewDeps,
  lang,
}: PackageDetailsProps) {
  if (!pkg) {
    return (
      <div className="package-details package-details--empty">
        <div className="package-details__placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <span>{t('noPackageSelected', lang)}</span>
        </div>
      </div>
    );
  }

  const info = packageInfo;

  return (
    <div className="package-details">
      <div className="package-details__header">
        <div className="package-details__title">
          <h2>{isPinned && <span className="pin-icon">📌</span>}{pkg.name}</h2>
          <span className={`package-details__type package-details__type--${pkg.type}`}>
            {pkg.type}
          </span>
        </div>
        <div className="package-details__actions">
          {pkg.installed ? (
            <>
              {pkg.outdated && !isPinned && (
                <button className="btn-primary" onClick={onUpdate}>{t('update', lang)}</button>
              )}
              <button className="btn-secondary" onClick={onPin}>
                {isPinned ? t('unpin', lang) : t('pin', lang)}
              </button>
              <button className="btn-secondary" onClick={onViewDeps}>{t('viewDeps', lang)}</button>
              <button className="btn-secondary" onClick={onUninstall}>{t('uninstall', lang)}</button>
            </>
          ) : (
            <button className="btn-primary" onClick={onInstall}>{t('install', lang)}</button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="package-details__loading">
          <div className="loading-spinner" />
          <span>{t('loading', lang)}</span>
        </div>
      ) : info ? (
        <div className="package-details__content">
          <div className="package-details__section">
            <h3>{t('description', lang)}</h3>
            <p>{info.description || (lang === 'zh' ? '暂无描述' : 'No description')}</p>
          </div>

          <div className="package-details__section">
            <h3>{lang === 'zh' ? '版本信息' : 'Version Info'}</h3>
            <div className="package-details__info-grid">
              <div className="package-details__info-item">
                <span className="label">{t('latestVersion', lang)}</span>
                <span className="value">{info.version}</span>
              </div>
              {info.installedVersion && (
                <div className="package-details__info-item">
                  <span className="label">{t('installedVersion', lang)}</span>
                  <span className="value">{info.installedVersion}</span>
                </div>
              )}
            </div>
          </div>

          {info.homepage && (
            <div className="package-details__section">
              <h3>{t('homepage', lang)}</h3>
              <a href={info.homepage} target="_blank" rel="noopener noreferrer" className="package-details__link">
                {info.homepage}
              </a>
            </div>
          )}

          {info.dependencies && info.dependencies.length > 0 && (
            <div className="package-details__section">
              <h3>{t('dependencies', lang)}</h3>
              <div className="package-details__deps">
                {info.dependencies.map((dep) => (
                  <span key={dep} className="package-details__dep">{dep}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="package-details__content">
          <div className="package-details__section">
            <p className="package-details__no-info">{lang === 'zh' ? '无法加载详细信息' : 'Unable to load details'}</p>
          </div>
        </div>
      )}
    </div>
  );
}
