import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import SearchBar from '../SearchBar';

interface HeaderProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sortOption: string;
  onSort: (option: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  searchTerm, 
  onSearch, 
  activeTab, 
  onTabChange,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-32">

          <SearchBar searchTerm={searchTerm} setSearchTerm={onSearch} />
          
          <button 
            className="md:hidden flex items-center gap-2 text-gray-600 border border-gray-300 rounded-md px-4 py-2"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>
          
          <nav className={`${mobileFiltersOpen ? 'flex' : 'hidden'} md:flex flex-wrap justify-center md:justify-between gap-2 w-full md:w-auto`}>
            <ul className="flex flex-wrap items-center gap-1 md:gap-2">
              <li>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => onTabChange('all')}
                >
                  All Advocates
                </button>
              </li>
              <li>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'featured' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => onTabChange('featured')}
                >
                  Featured Advocates
                </button>
              </li>
              <li>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'new' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => onTabChange('new')}
                >
                  Newly Added
                </button>
              </li>
              <li>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'online' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => onTabChange('online')}
                >
                  Online Consultation
                </button>
              </li>
              {/* <li>
                <button 
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'probono' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => onTabChange('probono')}
                >
                  Pro Bono
                </button>
              </li> */}
            </ul>
            
            {/* <div className="flex items-center mt-2 md:mt-0">
              <label htmlFor="sort" className="text-sm font-medium text-gray-600 mr-2">Sort By:</label>
              <select 
                id="sort"
                value={sortOption}
                onChange={(e) => onSort(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="experience">Experience</option>
              </select>
            </div> */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;