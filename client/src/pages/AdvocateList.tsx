import { ReactNode, useEffect, useState, useCallback, useMemo } from "react";
import { getAllUserAdvocates } from "@/api/user/advocatesApi";
import Header from "@/components/ui/Header";
import NavBar from "@/components/ui/NavBar";
import Sidebar from "@/components/ui/FilterSidebar";
import {
  Bookmark,
  MapPin,
  Calendar,
  MessageSquare,
  Star,
  Award,
  Check,
  Share2,
} from "lucide-react";
import { Advocate, FilterOptions } from "@/types/Types";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-200"
          }
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

interface BadgeProps {
  children: ReactNode;
  color?: "gray" | "red" | "blue" | "green" | "purple" | "indigo";
}

const Badge = ({ children, color = "gray" }: BadgeProps) => {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};

const AdvocateList = () => {
  // Backend filtering approach - only store what comes from API
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("rating");
  const [savedAdvocates, setSavedAdvocates] = useState<string[]>([]);

  // Move filters to parent component to persist state
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
    categories: [],
    location: "",
    experience: { min: null, max: null },
    languages: [],
    availability: [],
    minRating: 0,
    specializations: [],
    certifications: [],
  });

  // Pagination states - these come from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  // Memoize the API parameters to prevent unnecessary re-renders
  const apiParams = useMemo(() => {
    const [sortBy, sortOrder] = sortOption.split("_");

    return {
      page: currentPage,
      limit: itemsPerPage,
      searchTerm: searchTerm.trim(),
      activeTab,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
      categories: currentFilters.categories,
      location: currentFilters.location.trim(),
      minExperience: currentFilters.experience.min ?? undefined,
      maxExperience: currentFilters.experience.max ?? undefined,
      languages: currentFilters.languages,
      minRating: currentFilters.minRating,
      availability: currentFilters.availability,
      specializations: currentFilters.specializations,
      certifications: currentFilters.certifications,
    };
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    activeTab,
    sortOption,
    currentFilters,
  ]);

  // Single API call function with proper error handling
  const fetchAdvocates = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching advocates with params:", apiParams);

      const response = await getAllUserAdvocates(apiParams);
      console.log("Backend response:", response);

      setAdvocates(response.advocates || []);
      setTotalItems(response.pagination?.totalItems || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching advocates:", error);
      setAdvocates([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [apiParams]);

  // Debounced search state
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when filters change (except for pagination changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeTab, sortOption, currentFilters]);

  // Main effect to fetch data - only runs when relevant params change
  useEffect(() => {
    fetchAdvocates();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    activeTab,
    sortOption,
    currentFilters,
  ]);

  const handleFilterChange = useCallback((filters: FilterOptions) => {
    console.log("Filters changed:", filters);
    setCurrentFilters(filters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleSortChange = useCallback((sort: string) => {
    setSortOption(sort);
  }, []);

  const toggleSaved = useCallback((advocateId: string) => {
    setSavedAdvocates((prev) => {
      if (prev.includes(advocateId)) {
        return prev.filter((id) => id !== advocateId);
      } else {
        return [...prev, advocateId];
      }
    });
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    const categories: Record<
      string,
      "red" | "blue" | "indigo" | "purple" | "green"
    > = {
      Criminal: "red",
      Family: "blue",
      Corporate: "indigo",
      Property: "purple",
      Immigration: "green",
    };
    return categories[category] || "indigo";
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setActiveTab("all");
    setSortOption("rating");
    setCurrentFilters({
      categories: [],
      location: "",
      experience: { min: null, max: null },
      languages: [],
      availability: [],
      minRating: 0,
      specializations: [],
      certifications: [],
    });
    setCurrentPage(1);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <Loader />
      </div>
    );
  }

  if (advocates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <Header
          searchTerm={searchTerm}
          onSearch={handleSearchChange}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          sortOption={sortOption}
          onSort={handleSortChange}
        />
        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
          <div className="w-64 sticky top-8 hidden md:block">
            <Sidebar
              onFilterChange={handleFilterChange}
              initialFilters={currentFilters}
            />
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="inline-flex justify-center items-center p-4 bg-gray-100 rounded-full mb-4">
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={handleSearchChange}
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                No advocates found
              </h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                We couldn't find any advocates matching your criteria. Try
                adjusting your search or filter options.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Header
        searchTerm={searchTerm}
        onSearch={handleSearchChange}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sortOption={sortOption}
        onSort={handleSortChange}
      />
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        <div className="w-64 sticky top-8 hidden md:block">
          <Sidebar
            onFilterChange={handleFilterChange}
            initialFilters={currentFilters}
          />
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-600 font-medium">
              Showing{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              advocates
            </p>
            {/* <div className="flex gap-2">
              <button className="px-3 py-1 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                View: Grid
              </button>
              <button className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors">
                View: List
              </button>
            </div> */}
          </div>

          {advocates.map((advocate) => (
            <div
              key={advocate.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div
                className="p-6 flex flex-col md:flex-row gap-6 cursor-pointer"
                onClick={() => navigate(`/adProfile/${advocate.id}`)}
              >
                {/* Left: Photo */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                  <div className="relative w-32 h-40 overflow-hidden rounded-xl shadow-sm">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${
                        advocate.profilePhoto
                      }`}
                      alt={advocate.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/api/placeholder/128/160";
                      }}
                    />
                    {advocate.rating && advocate.rating >= 4.5 && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-white px-2 py-1 text-xs font-bold rounded-bl-lg flex items-center">
                        <Award size={12} className="mr-1" />
                        Top Rated
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-grow space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {advocate.name}
                        </h2>
                        {advocate.onlineConsultation && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Online
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 font-medium">
                        {advocate.typeOfAdvocate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge color={getCategoryColor(advocate.category)}>
                        {advocate.category}
                      </Badge>

                      {advocate.rating && (
                        <div className="flex items-center">
                          <RatingStars rating={advocate.rating} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-y-2 gap-x-8">
                    <div className="flex items-center">
                      <div className="p-2 bg-indigo-50 rounded-full mr-3">
                        <Award size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-medium text-gray-800">
                          {advocate.experience} Years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-2 bg-blue-50 rounded-full mr-3">
                        <Check size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          BCI Registration
                        </p>
                        <p className="font-medium text-gray-800">
                          {advocate.barCouncilRegisterNumber}
                        </p>
                      </div>
                    </div>

                    {advocate.address && (
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-50 rounded-full mr-3">
                          <MapPin size={16} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-medium text-gray-800">
                            {advocate.address.city}, {advocate.address.state}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {advocate.cirtification && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Certifications
                      </p>
                      <p className="text-sm text-gray-700 font-medium">
                        {advocate.cirtification}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {advocate.languages?.map((language, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-3 flex-shrink-0 w-full md:w-48">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/booking/${advocate.id}`);
                    }}
                  >
                    <Calendar size={18} />
                    <span>Booking</span>
                  </button>

                  <button
                    className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare size={18} className="text-indigo-600" />
                    <span>Chat</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaved(advocate.id);
                      }}
                      className={`flex-1 flex items-center justify-center gap-1 border ${
                        savedAdvocates.includes(advocate.id)
                          ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                          : "border-gray-200 bg-white text-gray-700"
                      } hover:bg-gray-50 font-medium py-2 px-3 rounded-lg transition-colors duration-200`}
                    >
                      <Bookmark
                        size={16}
                        className={
                          savedAdvocates.includes(advocate.id)
                            ? "fill-indigo-600"
                            : ""
                        }
                      />
                      <span className="text-sm">
                        {savedAdvocates.includes(advocate.id)
                          ? "Saved"
                          : "Save"}
                      </span>
                    </button>

                    <button
                      className="flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* About section and address */}
              <div className="bg-gray-50 p-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-6">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      About {advocate.name.split(" ")[0]}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {advocate.bio ||
                        `${advocate.name} is a ${
                          advocate.experience
                        } year experienced ${
                          advocate.typeOfAdvocate
                        } specializing in ${advocate.category} law. Based in ${
                          advocate.address?.city || "your city"
                        }, they provide expert legal advice and representation.`}
                    </p>
                  </div>

                  {advocate.address && (
                    <div className="w-64">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Address
                      </h4>
                      <p className="text-sm text-gray-600">
                        {advocate.address.street}, {advocate.address.city},{" "}
                        {advocate.address.state} {advocate.address.pincode}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Pagination component */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvocateList;
