import { useState, useMemo, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import BookingCard from "@/components/Calendar/BookingCard";
import { Booking } from "@/types/Types";

interface UserBookingViewProps {
  bookings: Booking[];
  onPostpone: (booking: Booking) => void;
  // onCancel: (bookingId: string) => void;
  isAdvocate: boolean | null;
}

const ITEMS_PER_PAGE = 9;

export default function UserBookingView({
  bookings,
  onPostpone,
  // onCancel,
  isAdvocate,
}: UserBookingViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination data
  const { paginatedBookings, totalPages, startIndex, endIndex } =
    useMemo(() => {
      const totalItems = bookings?.length || 0;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
      const paginatedBookings = bookings?.slice(startIndex, endIndex) || [];

      return {
        paginatedBookings,
        totalPages,
        startIndex,
        endIndex,
      };
    }, [bookings, currentPage]);

  // Reset to first page when bookings change
  useEffect(() => {
    setCurrentPage(1);
  }, [bookings]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {isAdvocate ? "My Slots" : "My Bookings"}
          </h2>
          {bookings?.length > 0 && (
            <span className="text-sm text-gray-500">
              Showing {startIndex + 1}-{endIndex} of {bookings.length}
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {bookings?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <h3 className="text-gray-700 font-medium mb-1">
              {isAdvocate ? "No Slots found" : "No bookings found"}
            </h3>
            <p className="text-gray-500 text-sm">
              You haven't made any appointments yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPostpone={onPostpone}
                  // onCancel={onCancel}
                  isAdvocate={isAdvocate}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex space-x-1">
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageClick(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>

                <div className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
