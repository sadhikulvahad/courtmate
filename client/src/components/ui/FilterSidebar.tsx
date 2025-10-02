import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterOptions } from "@/types/Types";
import { getAllFilters } from "@/api/filterApi"; 

interface SidebarProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  clearAllFilters?: () => void;
}

interface DbFilter {
  _id: string;
  name: string;
  type: string;
  options?: string[];
}

const defaultFilters: FilterOptions = {
  categories: [],
  location: "",
  experience: "",
  languages: [],
  availability: [],
  minRating: 0,
  specializations: [],
  certifications: [],
};

const Sidebar = forwardRef(
  ({ onFilterChange, initialFilters }: SidebarProps, ref) => {
    const [filters, setFilters] = useState<FilterOptions>(
      initialFilters || defaultFilters
    );
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(
      {}
    );
    const [dbFilters, setDbFilters] = useState<DbFilter[]>([]);

    // Fetch filters from backend
    useEffect(() => {
      const fetchFilters = async () => {
        try {
          const res = await getAllFilters();

          // Ensure we always get an array
          const filtersArray: DbFilter[] = Array.isArray(res)
            ? res
            : res.filters || [];

          setDbFilters(filtersArray);

          // initialize filters if not already set
          const initial: FilterOptions = {};
          filtersArray.forEach((f: DbFilter) => {
            if (initialFilters && initialFilters[f.type] !== undefined) {
              initial[f.type] = initialFilters[f.type];
            } else {
              initial[f.type] = Array.isArray(f.options) ? [] : "";
            }
          });
          setFilters(initial);

          // Initialize sections closed by default
          const sections: Record<string, boolean> = {};
          filtersArray.forEach((f: DbFilter) => (sections[f.type] = false));
          setOpenSections(sections);
        } catch (err) {
          console.error("Error fetching filters:", err);
        }
      };

      fetchFilters();
    }, [initialFilters]);

    // Toggle accordion
    const toggleSection = (section: string) => {
      setOpenSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };

    // Handle changes
    const handleFilterChange = (category: string, value: string | number) => {
      const updatedFilters: FilterOptions = { ...filters };

      if (Array.isArray(filters[category])) {
        const currentValues = filters[category] as (string | number)[];
        updatedFilters[category] = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
      } else {
        updatedFilters[category] = value;
      }

      setFilters(updatedFilters);
    };

    const applyFilters = () => {
      onFilterChange(filters);
    };

    const resetFilters = () => {
      const reset: FilterOptions = {};
      dbFilters.forEach((f) => {
        reset[f.type] = Array.isArray(f.options) ? [] : "";
      });
      setFilters(reset);
      onFilterChange(reset);
    };

    // 👇 Expose resetFilters to parent
    useImperativeHandle(ref, () => ({
      resetFilters,
    }));

    return (
      <aside className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-xl font-bold mb-6">Filters</h2>

        {dbFilters.map((filter) => (
          <div key={filter._id} className="mb-4 border-b pb-4">
            <button
              onClick={() => toggleSection(filter.type)}
              className="flex items-center justify-between w-full text-left font-medium mb-2"
            >
              <span>{filter.name}</span>
              {openSections[filter.type] ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {openSections[filter.type] && (
              <div className="mt-2 space-y-2 pl-1">
                {filter.options && filter.options.length > 0 ? (
                  filter.options.map((option) => (
                    <div key={option} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${filter.type}-${option}`}
                        checked={
                          Array.isArray(filters[filter.type])
                            ? (filters[filter.type] as string[]).includes(
                                option
                              )
                            : false
                        }
                        onChange={() => handleFilterChange(filter.type, option)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`${filter.type}-${option}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {option}
                      </label>
                    </div>
                  ))
                ) : (
                  <input
                    type="text"
                    value={
                      typeof filters[filter.type] === "string"
                        ? (filters[filter.type] as string)
                        : ""
                    }
                    onChange={(e) =>
                      handleFilterChange(filter.type, e.target.value)
                    }
                    placeholder={`Enter ${filter.name}`}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>
            )}
          </div>
        ))}

        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2 px-2 rounded-md transition-colors duration-200"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="w-1/2 bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm py-1 px-2 rounded-md transition-colors duration-200"
          >
            Reset Filters
          </button>
        </div>
      </aside>
    );
  }
);

export default React.memo(Sidebar);
