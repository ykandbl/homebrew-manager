import type { PackageFilter, Language } from '../types/preferences';
import { t } from '../i18n';
import './FilterTabs.css';

interface FilterTabsProps {
  activeFilter: PackageFilter;
  onChange: (filter: PackageFilter) => void;
  counts: {
    all: number;
    formula: number;
    cask: number;
    outdated: number;
    favorites: number;
  };
  lang: Language;
}

const FILTERS: PackageFilter[] = ['all', 'formula', 'cask', 'outdated', 'favorites'];

const FILTER_KEYS: Record<PackageFilter, 'filterAll' | 'filterFormula' | 'filterCask' | 'filterOutdated' | 'filterFavorites'> = {
  all: 'filterAll',
  formula: 'filterFormula',
  cask: 'filterCask',
  outdated: 'filterOutdated',
  favorites: 'filterFavorites',
};

export function FilterTabs({ activeFilter, onChange, counts, lang }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          className={`filter-tab ${activeFilter === filter ? 'filter-tab--active' : ''}`}
          onClick={() => onChange(filter)}
        >
          <span className="filter-tab__label">{t(FILTER_KEYS[filter], lang)}</span>
          <span className="filter-tab__count">{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}
