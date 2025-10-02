import { Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SearchBarProps } from "@/types/Types";

const SearchBar: React.FC<SearchBarProps> = React.memo(
  ({ searchTerm, setSearchTerm }) => {
    const [localValue, setLocalValue] = useState(searchTerm);

    // Keep input synced when parent clears or resets
    useEffect(() => {
      setLocalValue(searchTerm);
    }, [searchTerm]);

    return (
      <div className="relative w-full md:w-64">
        <input
          type="text"
          placeholder="Search here..."
          className="relative w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);   // update instantly for smooth typing
            setSearchTerm(e.target.value);   // notify parent
          }}
        />
        <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
      </div>
    );
  }
);

export default SearchBar;
