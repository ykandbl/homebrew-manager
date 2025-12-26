export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Header
    appTitle: '🍺 Homebrew Manager',
    refresh: '刷新',
    updateAll: '更新全部',
    updateHomebrew: '更新 Homebrew',
    cleanup: '清理缓存',
    settings: '设置',
    
    // Settings
    theme: '主题',
    themeSystem: '跟随系统',
    themeLight: '浅色',
    themeDark: '深色',
    language: '语言',
    version: '版本',
    cache: '缓存',
    
    // Search & Filter
    searchPlaceholder: '搜索软件包...',
    filterAll: '全部',
    filterFormula: 'Formula',
    filterCask: 'Cask',
    filterOutdated: '可更新',
    
    // Package List
    installed: '已安装',
    notInstalled: '未安装',
    outdated: '可更新',
    pinned: '已锁定',
    
    // Package Details
    noPackageSelected: '选择一个软件包查看详情',
    description: '描述',
    homepage: '主页',
    installedVersion: '已安装版本',
    latestVersion: '最新版本',
    dependencies: '依赖',
    noDependencies: '无依赖',
    
    // Actions
    install: '安装',
    uninstall: '卸载',
    update: '更新',
    pin: '锁定版本',
    unpin: '解锁版本',
    viewDeps: '查看依赖',
    
    // Dialogs
    confirmUninstall: '确认卸载',
    confirmUninstallMsg: '确定要卸载 {name} 吗？此操作无法撤销。',
    confirmUpdateAll: '更新所有包',
    confirmUpdateAllMsg: '确定要更新全部 {count} 个过时的软件包吗？',
    confirmCleanup: '清理缓存',
    confirmCleanupMsg: '确定要清理 Homebrew 缓存吗？当前缓存大小约 {size}。',
    confirm: '确认',
    cancel: '取消',
    close: '关闭',
    
    // Operations
    installing: '正在安装...',
    uninstalling: '正在卸载...',
    updating: '正在更新...',
    cleaning: '正在清理...',
    installSuccess: '安装成功',
    uninstallSuccess: '卸载成功',
    updateSuccess: '更新成功',
    cleanupSuccess: '缓存清理成功',
    homebrewUpdateSuccess: 'Homebrew 更新成功',
    allUpdateSuccess: '全部更新成功',
    pinSuccess: '已锁定版本',
    unpinSuccess: '已解锁版本',
    operationFailed: '操作失败',
    outputLog: '输出日志',
    errorInfo: '错误信息',
    
    // Status
    loading: '加载中...',
    checkingHomebrew: '检查 Homebrew...',
    homebrewNotInstalled: 'Homebrew 未安装',
    homebrewNotInstalledMsg: '请先安装 Homebrew 才能使用此应用。Homebrew 是 macOS 上最流行的包管理器。',
    installHomebrew: '安装 Homebrew',
    retry: '重试',
    
    // Dependencies
    dependencyTree: '依赖关系',
    dependsOn: '依赖于',
    requiredBy: '被依赖于',
    noDeps: '无依赖',
    noReverseDeps: '无被依赖',
    
    // Auto Refresh
    autoRefresh: '自动刷新',
    autoRefreshOff: '关闭',
    autoRefreshMinutes: '{min} 分钟',
    
    // Favorites
    favorites: '收藏',
    addToFavorites: '添加收藏',
    removeFromFavorites: '取消收藏',
    filterFavorites: '收藏',
    
    // History
    history: '操作历史',
    clearHistory: '清空历史',
    noHistory: '暂无操作记录',
    historyInstall: '安装了 {name}',
    historyUninstall: '卸载了 {name}',
    historyUpgrade: '更新了 {name}',
    historyUpdate: '更新了 Homebrew',
    historyCleanup: '清理了缓存',
    historySuccess: '成功',
    historyFailed: '失败',
    
    // Context Menu
    contextInstall: '安装',
    contextUninstall: '卸载',
    contextUpdate: '更新',
    contextViewDetails: '查看详情',
    contextAddFavorite: '添加到收藏',
    contextRemoveFavorite: '从收藏移除',
    contextViewDeps: '查看依赖',
  },
  en: {
    // Header
    appTitle: '🍺 Homebrew Manager',
    refresh: 'Refresh',
    updateAll: 'Update All',
    updateHomebrew: 'Update Homebrew',
    cleanup: 'Cleanup',
    settings: 'Settings',
    
    // Settings
    theme: 'Theme',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language',
    version: 'Version',
    cache: 'Cache',
    
    // Search & Filter
    searchPlaceholder: 'Search packages...',
    filterAll: 'All',
    filterFormula: 'Formula',
    filterCask: 'Cask',
    filterOutdated: 'Outdated',
    
    // Package List
    installed: 'Installed',
    notInstalled: 'Not Installed',
    outdated: 'Outdated',
    pinned: 'Pinned',
    
    // Package Details
    noPackageSelected: 'Select a package to view details',
    description: 'Description',
    homepage: 'Homepage',
    installedVersion: 'Installed Version',
    latestVersion: 'Latest Version',
    dependencies: 'Dependencies',
    noDependencies: 'No dependencies',
    
    // Actions
    install: 'Install',
    uninstall: 'Uninstall',
    update: 'Update',
    pin: 'Pin Version',
    unpin: 'Unpin Version',
    viewDeps: 'View Dependencies',
    
    // Dialogs
    confirmUninstall: 'Confirm Uninstall',
    confirmUninstallMsg: 'Are you sure you want to uninstall {name}? This cannot be undone.',
    confirmUpdateAll: 'Update All Packages',
    confirmUpdateAllMsg: 'Are you sure you want to update all {count} outdated packages?',
    confirmCleanup: 'Cleanup Cache',
    confirmCleanupMsg: 'Are you sure you want to clean up Homebrew cache? Current cache size is about {size}.',
    confirm: 'Confirm',
    cancel: 'Cancel',
    close: 'Close',
    
    // Operations
    installing: 'Installing...',
    uninstalling: 'Uninstalling...',
    updating: 'Updating...',
    cleaning: 'Cleaning...',
    installSuccess: 'Installation successful',
    uninstallSuccess: 'Uninstallation successful',
    updateSuccess: 'Update successful',
    cleanupSuccess: 'Cleanup successful',
    homebrewUpdateSuccess: 'Homebrew updated successfully',
    allUpdateSuccess: 'All packages updated successfully',
    pinSuccess: 'Version pinned',
    unpinSuccess: 'Version unpinned',
    operationFailed: 'Operation failed',
    outputLog: 'Output Log',
    errorInfo: 'Error Info',
    
    // Status
    loading: 'Loading...',
    checkingHomebrew: 'Checking Homebrew...',
    homebrewNotInstalled: 'Homebrew Not Installed',
    homebrewNotInstalledMsg: 'Please install Homebrew first. Homebrew is the most popular package manager for macOS.',
    installHomebrew: 'Install Homebrew',
    retry: 'Retry',
    
    // Dependencies
    dependencyTree: 'Dependency Tree',
    dependsOn: 'Depends on',
    requiredBy: 'Required by',
    noDeps: 'No dependencies',
    noReverseDeps: 'Not required by any package',
    
    // Auto Refresh
    autoRefresh: 'Auto Refresh',
    autoRefreshOff: 'Off',
    autoRefreshMinutes: '{min} min',
    
    // Favorites
    favorites: 'Favorites',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    filterFavorites: 'Favorites',
    
    // History
    history: 'History',
    clearHistory: 'Clear History',
    noHistory: 'No operation history',
    historyInstall: 'Installed {name}',
    historyUninstall: 'Uninstalled {name}',
    historyUpgrade: 'Updated {name}',
    historyUpdate: 'Updated Homebrew',
    historyCleanup: 'Cleaned up cache',
    historySuccess: 'Success',
    historyFailed: 'Failed',
    
    // Context Menu
    contextInstall: 'Install',
    contextUninstall: 'Uninstall',
    contextUpdate: 'Update',
    contextViewDetails: 'View Details',
    contextAddFavorite: 'Add to Favorites',
    contextRemoveFavorite: 'Remove from Favorites',
    contextViewDeps: 'View Dependencies',
  },
};

export type TranslationKey = keyof typeof translations.zh;

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
  let text = translations[lang][key] || translations.zh[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  
  return text;
}
