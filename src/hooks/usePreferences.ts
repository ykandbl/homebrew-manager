import { useState, useCallback, useEffect } from 'react';
import type { UserPreferences, PackageFilter, SortOption, SortDirection } from '../types/preferences';
import { DEFAULT_PREFERENCES } from '../types/preferences';

const STORAGE_KEY = 'homebrew-manager-preferences';

interface UsePreferencesReturn {
  preferences: UserPreferences;
  setFilter: (filter: PackageFilter) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
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

export function usePreferences(): UsePreferencesReturn {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  const setFilter = useCallback((filter: PackageFilter) => {
    setPreferences(prev => ({ ...prev, filter }));
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    setPreferences(prev => ({ ...prev, sortBy }));
  }, []);

  const setSortDirection = useCallback((sortDirection: SortDirection) => {
    setPreferences(prev => ({ ...prev, sortDirection }));
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  return {
    preferences,
    setFilter,
    setSortBy,
    setSortDirection,
    resetPreferences,
  };
}
