"use client";

import React from 'react';
import { ChevronDown, Search as SearchIcon } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOption: string;
  setFilterOption: (option: string) => void;
  categories: string[]; // Assuming categories is an array of strings
  showSearchAndFilter: boolean;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  filterOption,
  setFilterOption,
  categories,
  showSearchAndFilter,
}) => {
  if (!showSearchAndFilter) {
    return null; // Don't render anything if not shown
  }

  return (
    <div className="flex items-center space-x-4"> {/* Container from original snippet */}
      <div className="relative"> {/* Search input container */}
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search courses..."
          className="pl-10 pr-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="relative"> {/* Filter select container */}
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="appearance-none pl-4 pr-8 py-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Courses</option>
          <option value="popular">Popular</option>
          <option value="new">New Releases</option>
          <option value="beginner">Beginner</option>
          <option value="advanced">Advanced</option>
          {categories.map(category => (
            <option key={category} value={category.toLowerCase()}>{category}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

export default SearchAndFilter; 