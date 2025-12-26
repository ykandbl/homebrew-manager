import type { OperationType, OperationStatus } from '../types';
import type { Language } from '../types/preferences';
import { t } from '../i18n';
import './ProgressModal.css';

interface ProgressModalProps {
  isOpen: boolean;
  operation: OperationType;
  packageName: string;
  status: OperationStatus;
  output: string[];
  error?: string;
  onClose: () => void;
  lang: Language;
}

const OPERATION_KEYS: Record<OperationType, 'install' | 'uninstall' | 'update' | 'cleanup' | 'update' | 'update'> = {
  install: 'install',
  uninstall: 'uninstall',
  upgrade: 'update',
  search: 'install',
  update: 'update',
  cleanup: 'cleanup',
  upgrade_all: 'update',
};

export function ProgressModal({
  isOpen,
  operation,
  packageName,
  status,
  output,
  error,
  onClose,
  lang,
}: ProgressModalProps) {
  if (!isOpen) return null;

  const isComplete = status === 'success' || status === 'error';
  const opLabel = t(OPERATION_KEYS[operation], lang);

  return (
    <div className="modal-overlay" onClick={isComplete ? onClose : undefined}>
      <div className="progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="progress-modal__header">
          <h3>{opLabel} {packageName}</h3>
          {isComplete && (
            <button className="progress-modal__close" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
              </svg>
            </button>
          )}
        </div>

        <div className="progress-modal__status">
          {status === 'pending' && (
            <>
              <div className="progress-modal__spinner" />
              <span>{lang === 'zh' ? `正在${opLabel}...` : `${opLabel}ing...`}</span>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="progress-modal__icon progress-modal__icon--success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <span>{lang === 'zh' ? `${opLabel}成功` : `${opLabel} successful`}</span>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="progress-modal__icon progress-modal__icon--error">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </div>
              <span>{t('operationFailed', lang)}</span>
            </>
          )}
        </div>

        {error && (
          <div className="progress-modal__error">
            <strong>{t('errorInfo', lang)}:</strong>
            <p>{error}</p>
          </div>
        )}

        {output.length > 0 && (
          <div className="progress-modal__output">
            <div className="progress-modal__output-header">{t('outputLog', lang)}</div>
            <pre className="progress-modal__output-content">{output.join('\n')}</pre>
          </div>
        )}

        {isComplete && (
          <div className="progress-modal__actions">
            <button className="btn-primary" onClick={onClose}>{t('close', lang)}</button>
          </div>
        )}
      </div>
    </div>
  );
}
