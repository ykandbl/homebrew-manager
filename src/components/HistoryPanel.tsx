import type { OperationHistory, Language } from '../types/preferences';
import { t } from '../i18n';
import './HistoryPanel.css';

interface HistoryPanelProps {
  history: OperationHistory[];
  onClear: () => void;
  onClose: () => void;
  lang: Language;
}

function formatTime(timestamp: number, lang: Language): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  // 小于1分钟
  if (diff < 60000) {
    return lang === 'zh' ? '刚刚' : 'Just now';
  }
  // 小于1小时
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return lang === 'zh' ? `${mins} 分钟前` : `${mins} min ago`;
  }
  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return lang === 'zh' ? `${hours} 小时前` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  // 超过24小时显示日期
  return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getHistoryText(entry: OperationHistory, lang: Language): string {
  switch (entry.type) {
    case 'install':
      return t('historyInstall', lang, { name: entry.packageName || '' });
    case 'uninstall':
      return t('historyUninstall', lang, { name: entry.packageName || '' });
    case 'upgrade':
      return t('historyUpgrade', lang, { name: entry.packageName || '' });
    case 'update':
      return t('historyUpdate', lang);
    case 'cleanup':
      return t('historyCleanup', lang);
    default:
      return '';
  }
}

function getHistoryIcon(type: OperationHistory['type']): string {
  switch (type) {
    case 'install': return '⬇️';
    case 'uninstall': return '🗑️';
    case 'upgrade': return '🔄';
    case 'update': return '🔧';
    case 'cleanup': return '🧹';
    default: return '📦';
  }
}

export function HistoryPanel({ history, onClear, onClose, lang }: HistoryPanelProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="history-panel" onClick={e => e.stopPropagation()}>
        <div className="history-header">
          <h3>📜 {t('history', lang)}</h3>
          {history.length > 0 && (
            <button className="btn-secondary btn-small" onClick={onClear}>
              {t('clearHistory', lang)}
            </button>
          )}
        </div>
        <div className="history-list">
          {history.length === 0 ? (
            <p className="history-empty">{t('noHistory', lang)}</p>
          ) : (
            history.map(entry => (
              <div key={entry.id} className={`history-item ${entry.success ? '' : 'history-item--failed'}`}>
                <span className="history-icon">{getHistoryIcon(entry.type)}</span>
                <div className="history-content">
                  <span className="history-text">{getHistoryText(entry, lang)}</span>
                  <span className="history-time">{formatTime(entry.timestamp, lang)}</span>
                </div>
                <span className={`history-status ${entry.success ? 'history-status--success' : 'history-status--failed'}`}>
                  {entry.success ? '✓' : '✗'}
                </span>
              </div>
            ))
          )}
        </div>
        <button className="btn-primary" onClick={onClose}>{t('close', lang)}</button>
      </div>
    </div>
  );
}
