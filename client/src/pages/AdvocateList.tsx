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
import {
  Advocate,
  FilterOptions,
  GetAllUserAdvocatesParams,
} from "@/types/Types";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import Loader from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import { GetSavedAdvocates, toggleSaveAdvocate } from "@/api/user/userApi";
import { toast } from "sonner";
import { CreateConversation } from "@/api/chatApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDebounce } from "@/utils/debouncing";

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

interface Ad {
  _id: string;
  id?: string;
}

const AdvocateList = () => {
  // Backend filtering approach - only store what comes from API
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOption, setSortOption] = useState("rating");
  const [savedAdvocates, setSavedAdvocates] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Move filters to parent component to persist state
  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});

  // Pagination states - these come from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  console.log(currentFilters);
  const navigate = useNavigate();

  // Memoize the API parameters to prevent unnecessary re-renders
  const apiParams: GetAllUserAdvocatesParams = useMemo(() => {
    const [sortBy, sortOrderRaw] = sortOption.split("_");

    // Narrow the type of sortOrder
    const sortOrder =
      sortOrderRaw === "asc" || sortOrderRaw === "desc"
        ? sortOrderRaw
        : undefined;

    return {
      page : currentPage,
      limit : itemsPerPage,
      searchTerm,
      activeTab,
      sortBy,
      sortOrder,
      filters: currentFilters,
    };
  }, [
    itemsPerPage,
    debouncedSearchTerm,
    activeTab,
    sortOption,
    currentFilters,
    searchTerm,
    currentPage
  ]);

  console.log(apiParams, 'fdhaksdhflakjsdfhlaksf')
  // Single API call function with proper error handling
  const fetchAdvocates = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllUserAdvocates(apiParams);

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

  useEffect(() => {
    const getSavedAdvocates = async () => {
      try {
        const response = await GetSavedAdvocates();
        const saved = response?.data?.advocates || [];
        console.log(saved);
        const savedIds = saved.map((adv: Ad) => adv._id || adv.id);

        setSavedAdvocates(savedIds);
      } catch (error) {
        console.error("Failed to fetch saved advocates:", error);
        toast.error("Error loading saved advocates");
      }
    };
    if (isAuthenticated) {
      getSavedAdvocates();
    }
  }, []);

  // Reset to page 1 when filters change (except for pagination changes)
  useEffect(() => {
    fetchAdvocates();
  }, [
    debouncedSearchTerm,
    activeTab,
    sortOption,
    currentFilters,
    currentPage,
    fetchAdvocates,
  ]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [currentFilters, debouncedSearchTerm, activeTab, sortOption]);

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
    fetchAdvocates,
  ]);

  const handleFilterChange = useCallback((filters: FilterOptions) => {
    setCurrentFilters(filters);
    // setCurrentPage(1); 
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

  const toggleSaved = useCallback(async (advocateId: string) => {
    try {
      // Call API
      const response = await toggleSaveAdvocate(advocateId);

      if (response?.data?.success) {
        setSavedAdvocates((prev) => {
          if (prev.includes(advocateId)) {
            return prev.filter((id) => id !== advocateId);
          } else {
            return [...prev, advocateId];
          }
        });
      } else {
        toast.error("Failed to update saved advocates");
      }
    } catch (error) {
      console.error("Error saving advocate:", error);
      toast.error("An error occurred while saving advocate");
    }
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

  const handleShare = async () => {
    const shareText = `Advocate Profile: Check this out!\n\n${window.location.href}`;
    const encodedText = encodeURIComponent(shareText);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Advocate Profile",
          text: shareText,
          url: window.location.href,
        });
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send/?text=${encodedText}`;
        const opened = window.open(whatsappUrl, "_blank");

        if (!opened) {
          try {
            await navigator.clipboard.writeText(shareText);
            toast.success("Profile link copied to clipboard!");
          } catch (clipError) {
            console.error("Clipboard copy failed:", clipError);
            toast.error("Failed to share or copy");
          }
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Sharing failed");
    }
  };

  const startChat = async (id: string) => {
    if (!user) {
      console.log("kajh");
      toast.error("Please log in to start a chat");
      navigate("/signup");
      return;
    }

    if (!id) {
      toast.error("Invalid advocate ID");
      return;
    }

    try {
      const conversation = await CreateConversation(id, "advocate");
      navigate(
        `/chat?conversationId=${conversation?.data._id}&advocateId=${conversation?.data.participants[1].userId}`
      );
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setActiveTab("all");
    setSortOption("rating");
    setCurrentFilters({
      categories: [],
      location: "",
      experience: "",
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
                      src={`${advocate.profilePhoto}`}
                      // src={`${import.meta.env.VITE_API_URL}/uploads/${
                      //   advocate.profilePhoto
                      // }`}
                      alt={advocate.name}
                      className="w-full h-full object-cover"
                    />
                    {advocate.isSponsored && (
                      <div className="absolute top-0 left-0 bg-gray-600 text-white px-2 py-1 text-xs font-bold rounded-br-lg flex items-center z-10">
                        <Star size={12} className="mr-1" />
                        Sponsored
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
                    onClick={(e) => {
                      e.stopPropagation();
                      startChat(advocate?.id);
                    }}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare();
                      }}
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
