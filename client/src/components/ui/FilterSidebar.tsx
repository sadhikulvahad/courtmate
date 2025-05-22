import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterOptions } from "@/types/Types";

interface SidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions; // Add this prop to receive initial filters
}

const Sidebar: React.FC<SidebarProps> = ({
  onFilterChange,
  initialFilters,
}) => {
  // Initialize with passed filters or defaults
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      categories: [],
      location: "",
      experience: { min: null, max: null },
      languages: [],
      availability: [],
      minRating: 0,
      specializations: [],
      certifications: [],
    }
  );

  const [openSections, setOpenSections] = useState({
    categories: true,
    location: false,
    experience: false,
    languages: false,
    availability: false,
    ratings: false,
    specializations: false,
    certifications: false,
  });

  // Update local filters when initialFilters prop changes
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section as keyof typeof openSections],
    });
  };

  const handleFilterChange = <K extends keyof FilterOptions>(
    category: K,
    value: FilterOptions[K] extends (infer U)[] ? U : FilterOptions[K]
  ) => {
    let updatedFilters = { ...filters };

    if (Array.isArray(filters[category])) {
      const currentValues = filters[category] as unknown as any[];
      if (currentValues.includes(value)) {
        updatedFilters = {
          ...filters,
          [category]: currentValues.filter((v) => v !== value),
        };
      } else {
        updatedFilters = {
          ...filters,
          [category]: [...currentValues, value],
        };
      }
    } else {
      updatedFilters = {
        ...filters,
        [category]: value,
      };
    }

    console.log("Sidebar: Filter changed", { category, value, updatedFilters });
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const resetFilters = () => {
    const resetValues: FilterOptions = {
      categories: [],
      location: "",
      experience: { min: null, max: null },
      languages: [],
      availability: [],
      minRating: 0,
      specializations: [],
      certifications: [],
    };

    console.log("Sidebar: Resetting filters");
    setFilters(resetValues);
    onFilterChange(resetValues);
  };

  // These categories should match exactly with your advocate data
  const legalCategories = [
    "criminal",
    "civil",
    "family",
    "corporate",
    "property",
  ];

  // These languages should match your advocate data languages array
  const availableLanguages = ["English", "Hindi", "Malayalam", "Tamil"];

  return (
    <aside className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-xl font-bold mb-6">Filters</h2>

      {/* Categories of Law */}
      <div className="mb-4 border-b pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Categories of Law</span>
          {openSections.categories ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {openSections.categories && (
          <div className="mt-2 space-y-2 pl-1">
            {legalCategories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={filters.categories.includes(category)}
                  onChange={() => handleFilterChange("categories", category)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`category-${category}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Level */}
      <div className="mb-4 border-b pb-4">
        <button
          onClick={() => toggleSection("experience")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Experience Level</span>
          {openSections.experience ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {openSections.experience && (
          <div className="mt-2 space-y-2 pl-1">
            {[
              { label: "0-2 years", min: 0, max: 2 },
              { label: "3-5 years", min: 3, max: 5 },
              { label: "5-10 years", min: 5, max: 10 },
              { label: "10+ years", min: 10, max: null },
            ].map((exp) => (
              <div key={exp.min} className="flex items-center">
                <input
                  type="radio"
                  id={`exp-${exp.min}`}
                  name="experience"
                  checked={
                    filters.experience.min === exp.min &&
                    filters.experience.max === exp.max
                  }
                  onChange={() =>
                    handleFilterChange("experience", {
                      min: exp.min,
                      max: exp.max,
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`exp-${exp.min}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {exp.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Languages Spoken */}
      <div className="mb-4 border-b pb-4">
        <button
          onClick={() => toggleSection("languages")}
          className="flex items-center justify-between w-full text-left font-medium mb-2"
        >
          <span>Languages Spoken</span>
          {openSections.languages ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {openSections.languages && (
          <div className="mt-2 space-y-2 pl-1">
            {availableLanguages.map((lang) => (
              <div key={lang} className="flex items-center">
                <input
                  type="checkbox"
                  id={`lang-${lang}`}
                  checked={filters.languages.includes(lang)}
                  onChange={() => handleFilterChange("languages", lang)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label
                  htmlFor={`lang-${lang}`}
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {lang}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={resetFilters}
        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
      >
        Reset Filters
      </button>
    </aside>
  );
};

export default Sidebar;
