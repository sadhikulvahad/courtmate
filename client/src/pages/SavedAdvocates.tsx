import { ChevronLeft, Search, Bookmark } from "lucide-react";
import NavBar from "@/components/ui/NavBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { GetSavedAdvocates, toggleSaveAdvocate } from "@/api/user/userApi";
import { toast } from "sonner";
import { Advocate } from "@/types/Types";

const SavedAdvocates = () => {
  const navigate = useNavigate();
  const [advocates, setSavedAdvocates] = useState<Advocate[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // Number of advocates per page

  // Calculate total pages and paginated data
  const totalPages = Math.ceil(advocates.length / pageSize);
  const paginatedAdvocates = advocates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    const getSavedAdvocates = async () => {
      try {
        const response = await GetSavedAdvocates();
        const saved = response?.data?.advocates || [];
        setSavedAdvocates(saved);
      } catch (error) {
        console.error("Failed to fetch saved advocates:", error);
        toast.error("Error loading saved advocates");
      }
    };

    getSavedAdvocates();
  }, []);

  const toggleSaved = useCallback(
    async (advocateId: string) => {
      try {
        const response = await toggleSaveAdvocate(advocateId);
        if (response?.data?.success) {
          const isCurrentlySaved = advocates.some(
            (adv) => adv.id === advocateId
          );

          const updated = isCurrentlySaved
            ? advocates.filter((adv) => adv.id !== advocateId)
            : [...advocates, response.data.advocate];

          setSavedAdvocates(updated);

          toast.success(
            isCurrentlySaved
              ? "Advocate removed from saved list"
              : "Advocate added to saved list"
          );
        } else {
          toast.error("Failed to update saved advocates");
        }
      } catch (error) {
        console.error("Error saving advocate:", error);
        toast.error("An error occurred while saving advocate");
      }
    },
    [advocates]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {Math.min(currentPage * pageSize, advocates.length)} of{" "}
              {advocates.length} advocates
            </p>
          </div>

          {/* Advocates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {paginatedAdvocates.map((advocate) => (
              <div
                key={advocate.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Card Header */}
                <div className="relative p-6 pb-4">
                  {/* Toggle Save Button */}
                  <button
                    onClick={() => toggleSaved(advocate.id)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                  >
                    <Bookmark
                      size={20}
                      className={`transition-colors duration-200 ${
                        advocates.some((adv) => adv.id === advocate.id)
                          ? "text-indigo-600 fill-current"
                          : "text-gray-400 hover:text-indigo-600"
                      }`}
                    />
                  </button>

                  <div className="flex items-start space-x-4">
                    <img
                      src={`${advocate.profilePhoto}`}
                      alt={advocate.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {advocate.name}
                      </h3>
                      <span className="text-sm font-semibold">
                        {advocate.category}
                      </span>
                      <div className="flex items-center mt-1">
                        <span className="text-sm text-gray-500">
                          {advocate.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
              >
                Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } transition-colors`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } transition-colors`}
              >
                Next
              </button>
            </div>
          )}

          {/* No Results */}
          {advocates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No advocates found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedAdvocates;
