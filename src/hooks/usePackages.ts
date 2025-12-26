import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import type { Package, PackageInfo, OutdatedPackage, CommandOutput, HomebrewInfo } from '../types';

interface ProgressEvent {
  package: string;
  line: string;
  type: 'stdout' | 'stderr';
}

interface UsePackagesReturn {
  packages: Package[];
  isLoading: boolean;
  error: string | null;
  selectedPackage: Package | null;
  packageInfo: PackageInfo | null;
  isLoadingInfo: boolean;
  homebrewInfo: HomebrewInfo | null;
  refresh: () => Promise<void>;
  selectPackage: (pkg: Package | null) => void;
  searchPackages: (query: string) => Promise<Package[]>;
  installPackage: (name: string, isCask: boolean, onProgress: (line: string) => void) => Promise<CommandOutput>;
  uninstallPackage: (name: string, isCask: boolean, onProgress: (line: string) => void) => Promise<CommandOutput>;
  upgradePackage: (name: string, isCask: boolean, onProgress: (line: string) => void) => Promise<CommandOutput>;
  upgradeAll: (onProgress: (line: string) => void) => Promise<CommandOutput>;
  updateHomebrew: (onProgress: (line: string) => void) => Promise<CommandOutput>;
  cleanupHomebrew: (onProgress: (line: string) => void) => Promise<CommandOutput>;
  getOutdated: () => Promise<OutdatedPackage[]>;
  refreshHomebrewInfo: () => Promise<void>;
}

export function usePackages(): UsePackagesReturn {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [homebrewInfo, setHomebrewInfo] = useState<HomebrewInfo | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const installed = await invoke<Package[]>('list_installed');
      setPackages(installed);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectPackage = useCallback(async (pkg: Package | null) => {
    setSelectedPackage(pkg);
    setPackageInfo(null);
    
    if (pkg) {
      setIsLoadingInfo(true);
      try {
        const info = await invoke<PackageInfo>('get_package_info', {
          name: pkg.name,
          isCask: pkg.type === 'cask',
        });
        setPackageInfo(info);
      } catch (e) {
        console.error('Failed to get package info:', e);
      } finally {
        setIsLoadingInfo(false);
      }
    }
  }, []);

  const searchPackages = useCallback(async (query: string): Promise<Package[]> => {
    try {
      return await invoke<Package[]>('search_packages', { query });
    } catch (e) {
      console.error('Search failed:', e);
      return [];
    }
  }, []);

  const installPackage = useCallback(async (
    name: string,
    isCask: boolean,
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      // 监听进度事件
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        if (event.payload.package === name) {
          onProgress(event.payload.line);
        }
      });
      
      return await invoke<CommandOutput>('install_package', { name, isCask });
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const uninstallPackage = useCallback(async (
    name: string,
    isCask: boolean,
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        if (event.payload.package === name) {
          onProgress(event.payload.line);
        }
      });
      
      return await invoke<CommandOutput>('uninstall_package', { name, isCask });
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const upgradePackage = useCallback(async (
    name: string,
    isCask: boolean,
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        if (event.payload.package === name) {
          onProgress(event.payload.line);
        }
      });
      
      return await invoke<CommandOutput>('upgrade_package', { name, isCask });
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const getOutdated = useCallback(async (): Promise<OutdatedPackage[]> => {
    return await invoke<OutdatedPackage[]>('get_outdated');
  }, []);

  const upgradeAll = useCallback(async (
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        onProgress(event.payload.line);
      });
      
      return await invoke<CommandOutput>('upgrade_all');
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const updateHomebrew = useCallback(async (
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        onProgress(event.payload.line);
      });
      
      return await invoke<CommandOutput>('update_homebrew');
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const cleanupHomebrew = useCallback(async (
    onProgress: (line: string) => void
  ): Promise<CommandOutput> => {
    let unlisten: UnlistenFn | null = null;
    
    try {
      unlisten = await listen<ProgressEvent>('install-progress', (event) => {
        onProgress(event.payload.line);
      });
      
      return await invoke<CommandOutput>('cleanup_homebrew');
    } finally {
      if (unlisten) {
        unlisten();
      }
    }
  }, []);

  const refreshHomebrewInfo = useCallback(async () => {
    try {
      const info = await invoke<HomebrewInfo>('get_homebrew_info');
      setHomebrewInfo(info);
    } catch (e) {
      console.error('Failed to get homebrew info:', e);
    }
  }, []);

  useEffect(() => {
    refresh();
    refreshHomebrewInfo();
  }, [refresh, refreshHomebrewInfo]);

  return {
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
    getOutdated,
    refreshHomebrewInfo,
  };
}
