import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { filterPackages, getFilterCounts } from './utils/filter';
import { sortPackages } from './utils/sort';
import type { Package, OperationType, OperationStatus } from './types';
import './styles/index.css';

function App() {
  const [homebrewInstalled, setHomebrewInstalled] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Package[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // 操作状态
  const [operation, setOperation] = useState<{
    type: OperationType;
    packageName: string;
    status: OperationStatus;
    output: string[];
    error?: string;
  } | null>(null);
  
  // 确认对话框
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: () => {} });
  
  // Toast 提示
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({ isVisible: false, message: '', type: 'info' });

  const {
    packages,
    isLoading,
    error,
    selectedPackage,
    packageInfo,
    isLoadingInfo,
    homebrewInfo,
    refresh,
    selectPackage,
    searchPackages,
    installPackage,
    uninstallPackage,
    upgradePackage,
    upgradeAll,
    updateHomebrew,
    cleanupHomebrew,
    refreshHomebrewInfo,
  } = usePackages();

  const { preferences, setFilter, setTheme } = usePreferences();

  // 检查 Homebrew 是否安装
  useEffect(() => {
    invoke<boolean>('check_homebrew')
      .then(setHomebrewInstalled)
      .catch(() => setHomebrewInstalled(false));
  }, []);

  // 处理搜索
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchPackages(query);
      const installedNames = new Set(packages.map(p => p.name));
      const markedResults = results.map(pkg => ({
        ...pkg,
        installed: installedNames.has(pkg.name),
      }));
      setSearchResults(markedResults);
    } finally {
      setIsSearching(false);
    }
  }, [searchPackages, packages]);

  // 显示的包列表
  const displayPackages = useMemo(() => {
    const source = searchQuery ? searchResults : packages;
    const filtered = filterPackages(source, preferences.filter);
    return sortPackages(filtered, preferences.sortBy, preferences.sortDirection);
  }, [searchQuery, searchResults, packages, preferences]);

  // 过滤器计数
  const filterCounts = useMemo(() => {
    const source = searchQuery ? searchResults : packages;
    return getFilterCounts(source);
  }, [searchQuery, searchResults, packages]);

  // 过时包数量
  const outdatedCount = useMemo(() => {
    return packages.filter(p => p.outdated).length;
  }, [packages]);

  // 实时进度回调
  const handleProgress = useCallback((line: string) => {
    setOperation(prev => {
      if (!prev) return null;
      return { ...prev, output: [...prev.output, line] };
    });
  }, []);

  // 执行安装
  const handleInstall = useCallback(async () => {
    if (!selectedPackage) return;
    
    setOperation({
      type: 'install',
      packageName: selectedPackage.name,
      status: 'pending',
      output: [],
    });

    try {
      const result = await installPackage(
        selectedPackage.name,
        selectedPackage.type === 'cask',
        handleProgress
      );
      
      setOperation(prev => prev ? {
        ...prev,
        status: result.success ? 'success' : 'error',
        error: result.success ? undefined : result.stderr,
      } : null);

      if (result.success) {
        await refresh();
        setToast({ isVisible: true, message: '安装成功', type: 'success' });
      }
    } catch (e) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      } : null);
    }
  }, [selectedPackage, installPackage, refresh, handleProgress]);

  // 确认卸载
  const handleUninstallConfirm = useCallback(() => {
    if (!selectedPackage) return;
    setConfirmDialog({
      isOpen: true,
      title: '确认卸载',
      message: `确定要卸载 ${selectedPackage.name} 吗？此操作无法撤销。`,
      confirmText: '卸载',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        setOperation({
          type: 'uninstall',
          packageName: selectedPackage.name,
          status: 'pending',
          output: [],
        });

        try {
          const result = await uninstallPackage(
            selectedPackage.name,
            selectedPackage.type === 'cask',
            handleProgress
          );
          
          setOperation(prev => prev ? {
            ...prev,
            status: result.success ? 'success' : 'error',
            error: result.success ? undefined : result.stderr,
          } : null);

          if (result.success) {
            selectPackage(null);
            await refresh();
            setToast({ isVisible: true, message: '卸载成功', type: 'success' });
          }
        } catch (e) {
          setOperation(prev => prev ? {
            ...prev,
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
          } : null);
        }
      },
    });
  }, [selectedPackage, uninstallPackage, refresh, selectPackage, handleProgress]);

  // 执行更新单个包
  const handleUpdate = useCallback(async () => {
    if (!selectedPackage) return;

    setOperation({
      type: 'upgrade',
      packageName: selectedPackage.name,
      status: 'pending',
      output: [],
    });

    try {
      const result = await upgradePackage(
        selectedPackage.name,
        selectedPackage.type === 'cask',
        handleProgress
      );
      
      setOperation(prev => prev ? {
        ...prev,
        status: result.success ? 'success' : 'error',
        error: result.success ? undefined : result.stderr,
      } : null);

      if (result.success) {
        await refresh();
        setToast({ isVisible: true, message: '更新成功', type: 'success' });
      }
    } catch (e) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      } : null);
    }
  }, [selectedPackage, upgradePackage, refresh, handleProgress]);

  // 更新所有过时包
  const handleUpgradeAll = useCallback(() => {
    if (outdatedCount === 0) return;
    
    setConfirmDialog({
      isOpen: true,
      title: '更新所有包',
      message: `确定要更新全部 ${outdatedCount} 个过时的软件包吗？`,
      confirmText: '全部更新',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        setOperation({
          type: 'upgrade_all',
          packageName: `${outdatedCount} 个包`,
          status: 'pending',
          output: [],
        });

        try {
          const result = await upgradeAll(handleProgress);
          
          setOperation(prev => prev ? {
            ...prev,
            status: result.success ? 'success' : 'error',
            error: result.success ? undefined : result.stderr,
          } : null);

          if (result.success) {
            await refresh();
            setToast({ isVisible: true, message: '全部更新成功', type: 'success' });
          }
        } catch (e) {
          setOperation(prev => prev ? {
            ...prev,
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
          } : null);
        }
      },
    });
  }, [outdatedCount, upgradeAll, refresh, handleProgress]);

  // 更新 Homebrew
  const handleUpdateHomebrew = useCallback(async () => {
    setOperation({
      type: 'update',
      packageName: 'Homebrew',
      status: 'pending',
      output: [],
    });

    try {
      const result = await updateHomebrew(handleProgress);
      
      setOperation(prev => prev ? {
        ...prev,
        status: result.success ? 'success' : 'error',
        error: result.success ? undefined : result.stderr,
      } : null);

      if (result.success) {
        await refresh();
        await refreshHomebrewInfo();
        setToast({ isVisible: true, message: 'Homebrew 更新成功', type: 'success' });
      }
    } catch (e) {
      setOperation(prev => prev ? {
        ...prev,
        status: 'error',
        error: e instanceof Error ? e.message : String(e),
      } : null);
    }
  }, [updateHomebrew, refresh, refreshHomebrewInfo, handleProgress]);

  // 清理缓存
  const handleCleanup = useCallback(() => {
    const cacheSize = homebrewInfo?.cacheSize ?? 0;
    const cacheSizeMB = (cacheSize / 1024 / 1024).toFixed(1);
    
    setConfirmDialog({
      isOpen: true,
      title: '清理缓存',
      message: `确定要清理 Homebrew 缓存吗？当前缓存大小约 ${cacheSizeMB} MB。`,
      confirmText: '清理',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        
        setOperation({
          type: 'cleanup',
          packageName: '缓存',
          status: 'pending',
          output: [],
        });

        try {
          const result = await cleanupHomebrew(handleProgress);
          
          setOperation(prev => prev ? {
            ...prev,
            status: result.success ? 'success' : 'error',
            error: result.success ? undefined : result.stderr,
          } : null);

          if (result.success) {
            await refreshHomebrewInfo();
            setToast({ isVisible: true, message: '缓存清理成功', type: 'success' });
          }
        } catch (e) {
          setOperation(prev => prev ? {
            ...prev,
            status: 'error',
            error: e instanceof Error ? e.message : String(e),
          } : null);
        }
      },
    });
  }, [homebrewInfo, cleanupHomebrew, refreshHomebrewInfo, handleProgress]);

  // 关闭操作模态框
  const handleCloseOperation = useCallback(() => {
    setOperation(null);
  }, []);

  // 格式化缓存大小
  const formatCacheSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  // Homebrew 未安装
  if (homebrewInstalled === false) {
    return (
      <ErrorPage
        title="Homebrew 未安装"
        message="请先安装 Homebrew 才能使用此应用。Homebrew 是 macOS 上最流行的包管理器。"
        actionText="安装 Homebrew"
        actionUrl="https://brew.sh"
        onRetry={() => invoke<boolean>('check_homebrew').then(setHomebrewInstalled)}
      />
    );
  }

  // 加载中
  if (homebrewInstalled === null) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <span>检查 Homebrew...</span>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍺 Homebrew Manager</h1>
        <div className="header-actions">
          {outdatedCount > 0 && (
            <button className="btn-warning" onClick={handleUpgradeAll}>
              更新全部 ({outdatedCount})
            </button>
          )}
          <button className="btn-secondary" onClick={handleUpdateHomebrew}>
            更新 Homebrew
          </button>
          <button className="btn-secondary" onClick={handleCleanup}>
            清理缓存
          </button>
          <button className="btn-secondary" onClick={refresh} disabled={isLoading}>
            刷新
          </button>
          <button 
            className="btn-icon" 
            onClick={() => setShowSettings(!showSettings)}
            title="设置"
          >
            ⚙️
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <div className="settings-item">
            <span>主题</span>
            <select 
              value={preferences.theme} 
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          {homebrewInfo && (
            <div className="settings-info">
              <div>版本: {homebrewInfo.version}</div>
              <div>缓存: {formatCacheSize(homebrewInfo.cacheSize)}</div>
            </div>
          )}
        </div>
      )}

      <div className="app-toolbar">
        <SearchBar
          onSearch={handleSearch}
          isSearching={isSearching}
          placeholder="搜索软件包..."
        />
        <FilterTabs
          activeFilter={preferences.filter}
          onChange={setFilter}
          counts={filterCounts}
        />
      </div>

      <main className="app-content">
        <div className="app-sidebar">
          <PackageList
            packages={displayPackages}
            selectedId={selectedPackage?.name ?? null}
            onSelect={selectPackage}
            isLoading={isLoading}
          />
        </div>
        <div className="app-details">
          <PackageDetails
            package={selectedPackage}
            packageInfo={packageInfo}
            isLoading={isLoadingInfo}
            onInstall={handleInstall}
            onUninstall={handleUninstallConfirm}
            onUpdate={handleUpdate}
          />
        </div>
      </main>

      {error && (
        <Toast
          message={error}
          type="error"
          isVisible={true}
          onClose={() => {}}
          duration={5000}
        />
      )}

      <ProgressModal
        isOpen={operation !== null}
        operation={operation?.type ?? 'install'}
        packageName={operation?.packageName ?? ''}
        status={operation?.status ?? 'idle'}
        output={operation?.output ?? []}
        error={operation?.error}
        onClose={handleCloseOperation}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText="取消"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default App;
