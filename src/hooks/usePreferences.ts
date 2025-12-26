import { useState, useCallback, useEffect } from 'react';
import type { UserPreferences, PackageFilter, SortOption, SortDirection, Theme } from '../types/preferences';
import { DEFAULT_PREFERENCES } from '../types/preferences';

const STORAGE_KEY = 'homebrew-manager-preferences';

interface UsePreferencesReturn {
  preferences: UserPreferences;
  setFilter: (filter: PackageFilter) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setTheme: (theme: Theme) => void;
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

  useEffect(() => {
    savePreferences(preferences);
    applyTheme(preferences.theme);
  }, [preferences]);

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

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    setFilter,
    setSortBy,
    setSortDirection,
    setTheme,
    resetPreferences,
  };
}
