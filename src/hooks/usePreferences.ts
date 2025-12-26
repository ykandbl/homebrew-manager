import { useState, useCallback, useEffect } from 'react';
import type { UserPreferences, PackageFilter, SortOption, SortDirection, Theme, Language, AutoRefreshInterval, OperationHistory } from '../types/preferences';
import { DEFAULT_PREFERENCES } from '../types/preferences';

const STORAGE_KEY = 'homebrew-manager-preferences';
const HISTORY_KEY = 'homebrew-manager-history';
const MAX_HISTORY = 50;

interface UsePreferencesReturn {
  preferences: UserPreferences;
  history: OperationHistory[];
  setFilter: (filter: PackageFilter) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setAutoRefreshInterval: (interval: AutoRefreshInterval) => void;
  toggleFavorite: (packageName: string) => void;
  isFavorite: (packageName: string) => boolean;
  addHistory: (entry: Omit<OperationHistory, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  resetPreferences: () => void;
}

function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
}

function loadHistory(): OperationHistory[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load history:', e);
  }
  return [];
}

function saveHistory(history: OperationHistory[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [history, setHistory] = useState<OperationHistory[]>(loadHistory);

  useEffect(() => {
    savePreferences(preferences);
    applyTheme(preferences.theme);
  }, [preferences]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  // 监听系统主题变化
  useEffect(() => {
    if (preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [preferences.theme]);

  // 初始化时应用主题
  useEffect(() => {
    applyTheme(preferences.theme);
  }, []);

  const setFilter = useCallback((filter: PackageFilter) => {
    setPreferences(prev => ({ ...prev, filter }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setPreferences(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortDirection = useCallback((sortDirection: SortDirection) => {
    setPreferences(prev => ({ ...prev, sortDirection }));
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setPreferences(prev => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: Language) => {
    setPreferences(prev => ({ ...prev, language }));
  }, []);

  const setAutoRefreshInterval = useCallback((autoRefreshInterval: AutoRefreshInterval) => {
    setPreferences(prev => ({ ...prev, autoRefreshInterval }));
  }, []);

  const toggleFavorite = useCallback((packageName: string) => {
    setPreferences(prev => {
      const favorites = prev.favorites.includes(packageName)
        ? prev.favorites.filter(f => f !== packageName)
        : [...prev.favorites, packageName];
      return { ...prev, favorites };
    });
  }, []);

  const isFavorite = useCallback((packageName: string) => {
    return preferences.favorites.includes(packageName);
  }, [preferences.favorites]);

  const addHistory = useCallback((entry: Omit<OperationHistory, 'id' | 'timestamp'>) => {
    const newEntry: OperationHistory = {
      ...entry,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      timestamp: Date.now(),
    };
    setHistory(prev => [newEntry, ...prev].slice(0, MAX_HISTORY));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    history,
    setFilter,
    setSortBy,
    setSortDirection,
    setTheme,
    setLanguage,
    setAutoRefreshInterval,
    toggleFavorite,
    isFavorite,
    addHistory,
    clearHistory,
    resetPreferences,
  };
}
