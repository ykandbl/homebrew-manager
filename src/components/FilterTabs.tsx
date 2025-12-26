import type { PackageFilter } from '../types/preferences';
import { FILTER_LABELS } from '../types/preferences';
import './FilterTabs.css';

interface FilterTabsProps {
  activeFilter: PackageFilter;
  onChange: (filter: PackageFilter) => void;
  counts: {
    all: number;
    formula: number;
    cask: number;
    outdated: number;
  };
}

const FILTERS: PackageFilter[] = ['all', 'formula', 'cask', 'outdated'];

export function FilterTabs({ activeFilter, onChange, counts }: FilterTabsProps) {
  return (
    <div className="filter-tabs">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          className={`filter-tab ${activeFilter === filter ? 'filter-tab--active' : ''}`}
          onClick={() => onChange(filter)}
        >
          <span className="filter-tab__label">{FILTER_LABELS[filter]}</span>
          <span className="filter-tab__count">{counts[filter]}</span>
        </button>
      ))}
    </div>
  );
}
