// src/components/indexer/SearchBar.tsx
import React from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isSearching,
  value = '',
  onChange,
  loading = false,
  placeholder
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSearching && value?.trim()) {
      onSearch(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center">
        <input
          type="text"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder || "Search by address, tx hash, block number..."}
          className="w-full pl-4 pr-10 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
          disabled={isSearching || loading}
        />
        <span className="absolute right-2 flex items-center">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <button
              type="submit"
              disabled={isSearching || !(value && value.trim())}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
        </span>
      </div>
    </form>
  );
};

export default SearchBar;