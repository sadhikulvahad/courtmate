import {
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { getAllUserAdvocates } from "@/api/user/advocatesApi";
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
  Briefcase,
} from "lucide-react";
import {
  Advocate,
  FilterOptions,
  GetAllUserAdvocatesParams,
} from "@/types/Types";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/ui/Loading";
import Pagination from "@/components/ui/Pagination";
import { GetSavedAdvocates, toggleSaveAdvocate } from "@/api/user/userApi";
import { toast } from "sonner";
import { CreateConversation } from "@/api/chatApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useDebounce } from "@/utils/debouncing";
import SearchBar from "@/components/SearchBar";

const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className={
            i < Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          }
        />
      ))}
      <span className="ml-1.5 text-sm font-semibold text-gray-900">
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
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-md text-xs font-medium border ${colorClasses[color]}`}
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
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [savedAdvocates, setSavedAdvocates] = useState<string[]>([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 1000);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const navigate = useNavigate();

  const apiParams: GetAllUserAdvocatesParams = useMemo(() => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      searchTerm: debouncedSearchTerm,
      filters: currentFilters,
    };
  }, [itemsPerPage, debouncedSearchTerm, currentFilters, currentPage]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [currentFilters, debouncedSearchTerm]);

  useEffect(() => {
    fetchAdvocates();
  }, [
    currentPage,
    itemsPerPage,
    debouncedSearchTerm,
    currentFilters,
    fetchAdvocates,
  ]);

  const handleFilterChange = useCallback((filters: FilterOptions) => {
    setCurrentFilters(filters);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  const sidebarRef = useRef<{ resetFilters: () => void }>(null);

  const toggleSaved = useCallback(async (advocateId: string) => {
    try {
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
    }
  };

  const startChat = async (id: string) => {
    if (!user) {
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

  const clearAllFilters = () => {
    if (sidebarRef.current) {
      sidebarRef.current.resetFilters();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header Section */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Find Your Advocate
              </h1>
              <p className="text-sm text-gray-600">
                {totalItems} legal professionals available
              </p>
            </div>

            <div className="flex justify-end sm:w-auto w-full">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <Sidebar
                onFilterChange={handleFilterChange}
                initialFilters={currentFilters}
                ref={sidebarRef}
              />
            </div>
          </div>

          {/* Advocates List */}
          {advocates.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No advocates found
                </h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any advocates matching your criteria. Try
                  adjusting your filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {advocates.map((advocate) => (
                <div
                  key={advocate.id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => navigate(`/adProfile/${advocate.id}`)}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-100">
                          <img
                            src={advocate.profilePhoto}
                            alt={advocate.name}
                            className="w-full h-full object-cover"
                          />
                          {advocate.isSponsored && (
                            <div className="absolute top-0 right-0 bg-amber-500 text-white px-2 py-0.5 text-xs font-semibold rounded-bl-lg">
                              Featured
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Main Content */}
                      <div className="flex-grow min-w-0">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-xl font-bold text-gray-900">
                                {advocate.name}
                              </h2>
                              {advocate.onlineConsultation && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                  Available
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-2">
                              {advocate.typeOfAdvocate}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge
                                color={getCategoryColor(advocate.category)}
                              >
                                {advocate.category}
                              </Badge>
                              {advocate.rating && (
                                <RatingStars rating={advocate.rating} />
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaved(advocate.id);
                              }}
                              className={`p-2 rounded-lg border transition-all ${
                                savedAdvocates.includes(advocate.id)
                                  ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Bookmark
                                size={18}
                                className={
                                  savedAdvocates.includes(advocate.id)
                                    ? "fill-indigo-600"
                                    : ""
                                }
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare();
                              }}
                              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                              <Award size={18} className="text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                Experience
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {advocate.experience} Years
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Check size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium">
                                BCI Number
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {advocate.barCouncilRegisterNumber}
                              </p>
                            </div>
                          </div>

                          {advocate.address && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                                <MapPin size={18} className="text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 font-medium">
                                  Location
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {advocate.address.city},{" "}
                                  {advocate.address.state}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Languages */}
                        {advocate.languages &&
                          advocate.languages.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500 font-medium">
                                Languages:
                              </span>
                              {advocate.languages.map((language, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-md border border-gray-200"
                                >
                                  {language}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-6 mt-6 pt-6  border-t border-gray-100">
                      <button
                        className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/booking/${advocate.id}`);
                        }}
                      >
                        <Calendar size={18} />
                        <span>Book Appointment</span>
                      </button>

                      <button
                        className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 text-gray-900 font-semibold py-2 px-3 rounded-lg transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          startChat(advocate?.id);
                        }}
                      >
                        <MessageSquare size={18} className="text-indigo-600" />
                        <span>Start Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvocateList;
