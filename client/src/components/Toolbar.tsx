import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { courseCategories } from "@/lib/utils";
import { Search } from "lucide-react";

interface ToolbarProps {
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  searchValue: string;
  selectedCategory: string;
  categories?: string[];
}

const Toolbar = ({ onSearch, onCategoryChange, searchValue, selectedCategory, categories = courseCategories.map((c) => c.value) }: ToolbarProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue);

  // Debounce untuk pencarian
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, onSearch]);

  // Sinkronkan ketika searchValue berubah dari luar
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const formatCategoryLabel = (category: string) => {
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Daftar popular searches
  const popularSearches = [
    "Web Development",
    "Data Science",
    "Machine Learning",
    "React",
    "Python",
    "Business",
    "Design",
    "Marketing",
    "Mobile Development",
    "UI/UX",
    "Finance",
    "Photography",
    "Music",
    "Language",
    "Health",
    "Personal Development",
  ];

  const handlePopularSearch = (search: string) => {
    setLocalSearch(search);
    onCategoryChange("all"); // Reset kategori saat memilih popular search
  };

  return (
    <div className="w-full mb-8">
      {/* Popular Searches */}
      <div className="mb-6">
        <h3 className="text-gray-400 text-sm font-semibold mb-3">POPULAR SEARCHES</h3>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search) => (
            <button
              key={search}
              onClick={() => handlePopularSearch(search)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${localSearch === search ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
            >
              {search}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search your courses..."
            className="w-full py-3 pl-10 pr-4 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
        </div>

        {/* Category Selector */}
        <div className="w-full md:w-[240px]">
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full bg-gray-800 text-gray-300 border border-gray-700 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500">
              <SelectValue>{selectedCategory === "all" ? "All Categories" : formatCategoryLabel(selectedCategory)}</SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border border-gray-700 rounded-xl">
              <SelectItem value="all" className="hover:bg-gray-700">
                All Categories
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="hover:bg-gray-700">
                  {formatCategoryLabel(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
