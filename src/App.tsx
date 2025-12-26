import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { usePackages } from './hooks/usePackages';
import { usePreferences } from './hooks/usePreferences';
import { PackageList } from './components/PackageList';
import { SearchBar } from './components/SearchBar';
import { FilterTabs } from './components/FilterTabs';
import { PackageDetails } from './components/PackageDetails';
import { ProgressModal } from './components/ProgressModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Toast, ToastType } from './components/Toast';
import { ErrorPage } from './components/ErrorPage';
import { ContextMenu } from './components/ContextMenu';
import { HistoryPanel } from './components/HistoryPanel';
import { filterPackages, getFilterCounts } from './utils/filter';
import { sortPackages } from './utils/sort';
import { t } from './i18n';
import type { Package, OperationType, OperationStatus, DependencyInfo } from './types';
import type { AutoRefreshInterval } from './types/preferences';
import './styles/index.css';

function App() {
  const [homebrewInstalled, setHomebrewInstalled] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Package[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeps, setShowDeps] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [depsInfo, setDepsInfo] = useState<DependencyInfo | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; pkg: Package } | null>(null);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [operation, setOperation] = useState<{
    type: OperationType;
    packageName: string;
    status: OperationStatus;
    output: string[];
    error?: string;
  } | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {} });
  
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({ isVisible: false, message: '', type: 'info' });

  const {
    packages, pinnedPackages, isLoading, error, selectedPackage, packageInfo,
    isLoadingInfo, homebrewInfo, refresh, selectPackage, searchPackages,
    installPackage, uninstallPackage, upgradePackage, upgradeAll,
    updateHomebrew, cleanupHomebrew, pinPackage, unpinPackage,
    getDependencies, refreshHomebrewInfo,
  } = usePackages();

  const {
    preferences, history, setFilter, setTheme, setLanguage,
    setAutoRefreshInterval, toggleFavorite, isFavorite, addHistory, clearHistory,
  } = usePreferences();
  const lang = preferences.language;

  useEffect(() => {
    invoke<boolean>('check_homebrew').then(setHomebrewInstalled).catch(() => setHomebrewInstalled(false));
  }, []);

  // 自动刷新
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    if (preferences.autoRefreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        refresh();
      }, preferences.autoRefreshInterval * 60 * 1000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [preferences.autoRefreshInterval, refresh]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'f') { e.preventDefault(); document.querySelector<HTMLInputElement>('.search-bar input')?.focus(); }
        else if (e.key === 'r') { e.preventDefault(); refresh(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refresh]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await searchPackages(query);
      const installedNames = new Set(packages.map(p => p.name));
      setSearchResults(results.map(pkg => ({ ...pkg, installed: installedNames.has(pkg.name) })));
    } finally { setIsSearching(false); }
  }, [searchPackages, packages]);

  const displayPackages = useMemo(() => {
    const source = searchQuery ? searchResults : packages;
    return sortPackages(filterPackages(source, preferences.filter, preferences.favorites), preferences.sortBy, preferences.sortDirection);
  }, [searchQuery, searchResults, packages, preferences]);

  const filterCounts = useMemo(() => 
    getFilterCounts(searchQuery ? searchResults : packages, preferences.favorites),
    [searchQuery, searchResults, packages, preferences.favorites]
  );
  const outdatedCount = useMemo(() => packages.filter(p => p.outdated).length, [packages]);
  const handleProgress = useCallback((line: string) => { setOperation(prev => prev ? { ...prev, output: [...prev.output, line] } : null); }, []);

  const handleInstall = useCallback(async (pkg?: Package) => {
    const targetPkg = pkg || selectedPackage;
    if (!targetPkg) return;
    setOperation({ type: 'install', packageName: targetPkg.name, status: 'pending', output: [] });
    try {
      const result = await installPackage(targetPkg.name, targetPkg.type === 'cask', handleProgress);
      setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
      addHistory({ type: 'install', packageName: targetPkg.name, success: result.success });
      if (result.success) { await refresh(); setToast({ isVisible: true, message: t('installSuccess', lang), type: 'success' }); }
    } catch (e) { 
      setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null);
      addHistory({ type: 'install', packageName: targetPkg.name, success: false });
    }
  }, [selectedPackage, installPackage, refresh, handleProgress, lang, addHistory]);

  const handleUninstallConfirm = useCallback((pkg?: Package) => {
    const targetPkg = pkg || selectedPackage;
    if (!targetPkg) return;
    setConfirmDialog({
      isOpen: true, title: t('confirmUninstall', lang),
      message: t('confirmUninstallMsg', lang, { name: targetPkg.name }),
      confirmText: t('uninstall', lang),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setOperation({ type: 'uninstall', packageName: targetPkg.name, status: 'pending', output: [] });
        try {
          const result = await uninstallPackage(targetPkg.name, targetPkg.type === 'cask', handleProgress);
          setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
          addHistory({ type: 'uninstall', packageName: targetPkg.name, success: result.success });
          if (result.success) { selectPackage(null); await refresh(); setToast({ isVisible: true, message: t('uninstallSuccess', lang), type: 'success' }); }
        } catch (e) { 
          setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null);
          addHistory({ type: 'uninstall', packageName: targetPkg.name, success: false });
        }
      },
    });
  }, [selectedPackage, uninstallPackage, refresh, selectPackage, handleProgress, lang, addHistory]);

  const handleUpdate = useCallback(async (pkg?: Package) => {
    const targetPkg = pkg || selectedPackage;
    if (!targetPkg) return;
    setOperation({ type: 'upgrade', packageName: targetPkg.name, status: 'pending', output: [] });
    try {
      const result = await upgradePackage(targetPkg.name, targetPkg.type === 'cask', handleProgress);
      setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
      addHistory({ type: 'upgrade', packageName: targetPkg.name, success: result.success });
      if (result.success) { await refresh(); setToast({ isVisible: true, message: t('updateSuccess', lang), type: 'success' }); }
    } catch (e) { 
      setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null);
      addHistory({ type: 'upgrade', packageName: targetPkg.name, success: false });
    }
  }, [selectedPackage, upgradePackage, refresh, handleProgress, lang, addHistory]);

  const handleUpgradeAll = useCallback(() => {
    if (outdatedCount === 0) return;
    setConfirmDialog({
      isOpen: true, title: t('confirmUpdateAll', lang),
      message: t('confirmUpdateAllMsg', lang, { count: outdatedCount }),
      confirmText: t('updateAll', lang),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setOperation({ type: 'upgrade_all', packageName: `${outdatedCount} packages`, status: 'pending', output: [] });
        try {
          const result = await upgradeAll(handleProgress);
          setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
          if (result.success) { await refresh(); setToast({ isVisible: true, message: t('allUpdateSuccess', lang), type: 'success' }); }
        } catch (e) { setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null); }
      },
    });
  }, [outdatedCount, upgradeAll, refresh, handleProgress, lang]);

  const handleUpdateHomebrew = useCallback(async () => {
    setOperation({ type: 'update', packageName: 'Homebrew', status: 'pending', output: [] });
    try {
      const result = await updateHomebrew(handleProgress);
      setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
      addHistory({ type: 'update', success: result.success });
      if (result.success) { await refresh(); await refreshHomebrewInfo(); setToast({ isVisible: true, message: t('homebrewUpdateSuccess', lang), type: 'success' }); }
    } catch (e) { 
      setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null);
      addHistory({ type: 'update', success: false });
    }
  }, [updateHomebrew, refresh, refreshHomebrewInfo, handleProgress, lang, addHistory]);

  const handleCleanup = useCallback(() => {
    const cacheSizeMB = ((homebrewInfo?.cacheSize ?? 0) / 1024 / 1024).toFixed(1) + ' MB';
    setConfirmDialog({
      isOpen: true, title: t('confirmCleanup', lang),
      message: t('confirmCleanupMsg', lang, { size: cacheSizeMB }),
      confirmText: t('cleanup', lang),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        setOperation({ type: 'cleanup', packageName: 'Cache', status: 'pending', output: [] });
        try {
          const result = await cleanupHomebrew(handleProgress);
          setOperation(prev => prev ? { ...prev, status: result.success ? 'success' : 'error', error: result.success ? undefined : result.stderr } : null);
          addHistory({ type: 'cleanup', success: result.success });
          if (result.success) { await refreshHomebrewInfo(); setToast({ isVisible: true, message: t('cleanupSuccess', lang), type: 'success' }); }
        } catch (e) { 
          setOperation(prev => prev ? { ...prev, status: 'error', error: e instanceof Error ? e.message : String(e) } : null);
          addHistory({ type: 'cleanup', success: false });
        }
      },
    });
  }, [homebrewInfo, cleanupHomebrew, refreshHomebrewInfo, handleProgress, lang, addHistory]);

  const handlePin = useCallback(async () => {
    if (!selectedPackage) return;
    const isPinned = pinnedPackages.includes(selectedPackage.name);
    try {
      const result = isPinned ? await unpinPackage(selectedPackage.name) : await pinPackage(selectedPackage.name);
      if (result.success) setToast({ isVisible: true, message: t(isPinned ? 'unpinSuccess' : 'pinSuccess', lang), type: 'success' });
    } catch { setToast({ isVisible: true, message: t('operationFailed', lang), type: 'error' }); }
  }, [selectedPackage, pinnedPackages, pinPackage, unpinPackage, lang]);

  const handleViewDeps = useCallback(async (pkg?: Package) => {
    const targetPkg = pkg || selectedPackage;
    if (!targetPkg) return;
    try {
      const deps = await getDependencies(targetPkg.name, targetPkg.type === 'cask');
      setDepsInfo(deps); setShowDeps(true);
    } catch { setToast({ isVisible: true, message: t('operationFailed', lang), type: 'error' }); }
  }, [selectedPackage, getDependencies, lang]);

  const handleContextMenu = useCallback((e: React.MouseEvent, pkg: Package) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, pkg });
  }, []);

  const formatCacheSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  if (homebrewInstalled === false) {
    return <ErrorPage title={t('homebrewNotInstalled', lang)} message={t('homebrewNotInstalledMsg', lang)} actionText={t('installHomebrew', lang)} actionUrl="https://brew.sh" onRetry={() => invoke<boolean>('check_homebrew').then(setHomebrewInstalled)} />;
  }
  if (homebrewInstalled === null) {
    return <div className="loading"><div className="loading-spinner" /><span>{t('checkingHomebrew', lang)}</span></div>;
  }

  const isPinned = selectedPackage ? pinnedPackages.includes(selectedPackage.name) : false;

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('appTitle', lang)}</h1>
        <div className="header-actions">
          {outdatedCount > 0 && <button className="btn-warning" onClick={handleUpgradeAll}>{t('updateAll', lang)} ({outdatedCount})</button>}
          <button className="btn-secondary" onClick={handleUpdateHomebrew}>{t('updateHomebrew', lang)}</button>
          <button className="btn-secondary" onClick={handleCleanup}>{t('cleanup', lang)}</button>
          <button className="btn-secondary" onClick={refresh} disabled={isLoading}>{t('refresh', lang)}</button>
          <button className="btn-icon" onClick={() => setShowHistory(true)} title={t('history', lang)}>📜</button>
          <button className="btn-icon" onClick={() => setShowSettings(!showSettings)} title={t('settings', lang)}>⚙️</button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-item"><span>{t('language', lang)}</span>
            <select value={preferences.language} onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}>
              <option value="zh">中文</option><option value="en">English</option>
            </select>
          </div>
          <div className="settings-item"><span>{t('theme', lang)}</span>
            <select value={preferences.theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}>
              <option value="system">{t('themeSystem', lang)}</option>
              <option value="light">{t('themeLight', lang)}</option>
              <option value="dark">{t('themeDark', lang)}</option>
            </select>
          </div>
          <div className="settings-item"><span>{t('autoRefresh', lang)}</span>
            <select value={preferences.autoRefreshInterval} onChange={(e) => setAutoRefreshInterval(Number(e.target.value) as AutoRefreshInterval)}>
              <option value={0}>{t('autoRefreshOff', lang)}</option>
              <option value={5}>{t('autoRefreshMinutes', lang, { min: 5 })}</option>
              <option value={10}>{t('autoRefreshMinutes', lang, { min: 10 })}</option>
              <option value={30}>{t('autoRefreshMinutes', lang, { min: 30 })}</option>
              <option value={60}>{t('autoRefreshMinutes', lang, { min: 60 })}</option>
            </select>
          </div>
          {homebrewInfo && <div className="settings-info"><div>{t('version', lang)}: {homebrewInfo.version}</div><div>{t('cache', lang)}: {formatCacheSize(homebrewInfo.cacheSize)}</div></div>}
        </div>
      )}

      <div className="app-toolbar">
        <SearchBar onSearch={handleSearch} isSearching={isSearching} placeholder={t('searchPlaceholder', lang)} />
        <FilterTabs activeFilter={preferences.filter} onChange={setFilter} counts={filterCounts} lang={lang} />
      </div>

      <main className="app-content">
        <div className="app-sidebar">
          <PackageList 
            packages={displayPackages} 
            pinnedPackages={pinnedPackages} 
            favoritePackages={preferences.favorites}
            selectedId={selectedPackage?.name ?? null} 
            onSelect={selectPackage} 
            onContextMenu={handleContextMenu}
            isLoading={isLoading} 
            lang={lang} 
          />
        </div>
        <div className="app-details">
          <PackageDetails 
            package={selectedPackage} 
            packageInfo={packageInfo} 
            isLoading={isLoadingInfo} 
            isPinned={isPinned} 
            isFavorite={selectedPackage ? isFavorite(selectedPackage.name) : false}
            onInstall={() => handleInstall()} 
            onUninstall={() => handleUninstallConfirm()} 
            onUpdate={() => handleUpdate()} 
            onPin={handlePin} 
            onToggleFavorite={() => selectedPackage && toggleFavorite(selectedPackage.name)}
            onViewDeps={() => handleViewDeps()} 
            lang={lang} 
          />
        </div>
      </main>

      {error && <Toast message={error} type="error" isVisible={true} onClose={() => {}} duration={5000} />}
      <ProgressModal isOpen={operation !== null} operation={operation?.type ?? 'install'} packageName={operation?.packageName ?? ''} status={operation?.status ?? 'idle'} output={operation?.output ?? []} error={operation?.error} onClose={() => setOperation(null)} lang={lang} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} confirmText={confirmDialog.confirmText} cancelText={t('cancel', lang)} variant="danger" onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} />

      {showDeps && depsInfo && (
        <div className="modal-overlay" onClick={() => setShowDeps(false)}>
          <div className="deps-modal" onClick={e => e.stopPropagation()}>
            <h3>{t('dependencyTree', lang)}: {depsInfo.name}</h3>
            <div className="deps-section"><h4>{t('dependsOn', lang)}</h4>{depsInfo.dependencies.length > 0 ? <ul>{depsInfo.dependencies.map(d => <li key={d}>{d}</li>)}</ul> : <p className="no-deps">{t('noDeps', lang)}</p>}</div>
            <div className="deps-section"><h4>{t('requiredBy', lang)}</h4>{depsInfo.reverseDependencies.length > 0 ? <ul>{depsInfo.reverseDependencies.map(d => <li key={d}>{d}</li>)}</ul> : <p className="no-deps">{t('noReverseDeps', lang)}</p>}</div>
            <button className="btn-primary" onClick={() => setShowDeps(false)}>{t('close', lang)}</button>
          </div>
        </div>
      )}

      {showHistory && (
        <HistoryPanel history={history} onClear={clearHistory} onClose={() => setShowHistory(false)} lang={lang} />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          package={contextMenu.pkg}
          isFavorite={isFavorite(contextMenu.pkg.name)}
          onClose={() => setContextMenu(null)}
          onInstall={() => handleInstall(contextMenu.pkg)}
          onUninstall={() => handleUninstallConfirm(contextMenu.pkg)}
          onUpdate={() => handleUpdate(contextMenu.pkg)}
          onViewDetails={() => selectPackage(contextMenu.pkg)}
          onToggleFavorite={() => toggleFavorite(contextMenu.pkg.name)}
          onViewDeps={() => handleViewDeps(contextMenu.pkg)}
          lang={lang}
        />
      )}

      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}

export default App;
