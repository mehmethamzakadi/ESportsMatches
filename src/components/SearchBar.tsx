import React, { useState } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Takım adına göre ara..." 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="w-full mb-4 sm:mb-6">
      <div className={`relative rounded-lg shadow-sm ${isFocused ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
          <svg 
            className="w-4 h-4 text-secondary-500 dark:text-secondary-400" 
            aria-hidden="true" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 20 20"
          >
            <path 
              stroke="currentColor" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="block w-full p-2 sm:p-3 pl-8 sm:pl-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none transition-colors duration-200"
          placeholder={placeholder}
          aria-label="Arama"
        />
        {searchTerm && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3"
            onClick={() => onSearchChange('')}
            aria-label="Aramayı temizle"
          >
            <svg 
              className="w-4 h-4 text-secondary-500 dark:text-secondary-400 hover:text-gray-700 dark:hover:text-gray-300" 
              aria-hidden="true" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke="currentColor" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar; 