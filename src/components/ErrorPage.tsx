import './ErrorPage.css';

interface ErrorPageProps {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  onRetry?: () => void;
}

export function ErrorPage({ title, message, actionText, actionUrl, onRetry }: ErrorPageProps) {
  return (
    <div className="error-page">
      <div className="error-page__content">
        <div className="error-page__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="error-page__actions">
          {actionUrl && actionText && (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              {actionText}
            </a>
          )}
          {onRetry && (
            <button className="btn-secondary" onClick={onRetry}>
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
