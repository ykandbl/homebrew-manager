import type { Package, PackageInfo } from '../types';
import './PackageDetails.css';

interface PackageDetailsProps {
  package: Package | null;
  packageInfo: PackageInfo | null;
  isLoading: boolean;
  onInstall: () => void;
  onUninstall: () => void;
  onUpdate: () => void;
}

export function PackageDetails({
  package: pkg,
  packageInfo,
  isLoading,
  onInstall,
  onUninstall,
  onUpdate,
}: PackageDetailsProps) {
  if (!pkg) {
    return (
      <div className="package-details package-details--empty">
        <div className="package-details__placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>
          </svg>
          <span>选择一个软件包查看详情</span>
        </div>
      </div>
    );
  }

  const info = packageInfo;

  return (
    <div className="package-details">
      <div className="package-details__header">
        <div className="package-details__title">
          <h2>{pkg.name}</h2>
          <span className={`package-details__type package-details__type--${pkg.type}`}>
            {pkg.type}
          </span>
        </div>
        <div className="package-details__actions">
          {pkg.installed ? (
            <>
              {pkg.outdated && (
                <button className="btn-primary" onClick={onUpdate}>
                  更新
                </button>
              )}
              <button className="btn-secondary" onClick={onUninstall}>
                卸载
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={onInstall}>
              安装
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="package-details__loading">
          <div className="loading-spinner" />
          <span>加载详情...</span>
        </div>
      ) : info ? (
        <div className="package-details__content">
          <div className="package-details__section">
            <h3>描述</h3>
            <p>{info.description || '暂无描述'}</p>
          </div>

          <div className="package-details__section">
            <h3>版本信息</h3>
            <div className="package-details__info-grid">
              <div className="package-details__info-item">
                <span className="label">最新版本</span>
                <span className="value">{info.version}</span>
              </div>
              {info.installedVersion && (
                <div className="package-details__info-item">
                  <span className="label">已安装版本</span>
                  <span className="value">{info.installedVersion}</span>
                </div>
              )}
            </div>
          </div>

          {info.homepage && (
            <div className="package-details__section">
              <h3>主页</h3>
              <a
                href={info.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="package-details__link"
              >
                {info.homepage}
              </a>
            </div>
          )}

          {info.dependencies && info.dependencies.length > 0 && (
            <div className="package-details__section">
              <h3>依赖</h3>
              <div className="package-details__deps">
                {info.dependencies.map((dep) => (
                  <span key={dep} className="package-details__dep">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="package-details__content">
          <div className="package-details__section">
            <p className="package-details__no-info">无法加载详细信息</p>
          </div>
        </div>
      )}
    </div>
  );
}
