import { useEffect, useRef } from 'react';
import type { Package } from '../types';
import type { Language } from '../types/preferences';
import { t } from '../i18n';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  package: Package;
  isFavorite: boolean;
  onClose: () => void;
  onInstall: () => void;
  onUninstall: () => void;
  onUpdate: () => void;
  onViewDetails: () => void;
  onToggleFavorite: () => void;
  onViewDeps: () => void;
  lang: Language;
}

export function ContextMenu({
  x, y, package: pkg, isFavorite, onClose,
  onInstall, onUninstall, onUpdate, onViewDetails, onToggleFavorite, onViewDeps, lang
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 调整位置防止超出屏幕
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const adjustedX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 10 : x;
      const adjustedY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 10 : y;
      menuRef.current.style.left = `${adjustedX}px`;
      menuRef.current.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  return (
    <div className="context-menu" ref={menuRef} style={{ left: x, top: y }}>
      <button className="context-menu-item" onClick={() => { onViewDetails(); onClose(); }}>
        📋 {t('contextViewDetails', lang)}
      </button>
      <div className="context-menu-divider" />
      {!pkg.installed && (
        <button className="context-menu-item" onClick={() => { onInstall(); onClose(); }}>
          ⬇️ {t('contextInstall', lang)}
        </button>
      )}
      {pkg.installed && (
        <>
          <button className="context-menu-item context-menu-item--danger" onClick={() => { onUninstall(); onClose(); }}>
            🗑️ {t('contextUninstall', lang)}
          </button>
          {pkg.outdated && (
            <button className="context-menu-item" onClick={() => { onUpdate(); onClose(); }}>
              🔄 {t('contextUpdate', lang)}
            </button>
          )}
        </>
      )}
      <div className="context-menu-divider" />
      <button className="context-menu-item" onClick={() => { onToggleFavorite(); onClose(); }}>
        {isFavorite ? '💔' : '⭐'} {t(isFavorite ? 'contextRemoveFavorite' : 'contextAddFavorite', lang)}
      </button>
      <button className="context-menu-item" onClick={() => { onViewDeps(); onClose(); }}>
        🔗 {t('contextViewDeps', lang)}
      </button>
    </div>
  );
}
