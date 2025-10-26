import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreateConversation } from "@/api/chatApi";
import { Booking } from "@/types/Types";

// Mock types based on your code
// interface Booking {
//   id: string;
//   date: string;
//   time: string;
//   status: string;
//   notes?: string;
//   postponeReason?: string;
//   isAvailable?: boolean;
//   advocateId?: string;
//   advocate?: {
//     name?: string;
//     email?: string;
//   };
//   user?: {
//     id: string;
//     email: string;
//     name: string;
//     phone?: string;
//   };
// }

interface UserBookingViewProps {
  bookings: Booking[];
  onPostpone: (booking: Booking) => void;
  isAdvocate: boolean | null;
  onCancel: (bookingId: string) => void;
}

export default function UserBookingView({
  bookings = [],
  onPostpone,
  onCancel,
  isAdvocate,
}: UserBookingViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  // const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);

  const navigate = useNavigate();

  // Get calendar data
  const { calendarDays, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = new Date(year, month).toLocaleString("default", {
      month: "long",
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return { calendarDays: days, monthName, year };
  }, [currentDate]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.getDate() === date.getDate() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500 border-green-600";
      case "pending":
        return "bg-yellow-500 border-yellow-600";
      case "cancelled":
        return "bg-red-500 border-red-600";
      case "postponed":
        return "bg-blue-500 border-blue-600";
      default:
        return "bg-gray-500 border-gray-600";
    }
  };

  const formatTime = (time: string | Date) => {
    const date = time instanceof Date ? time : new Date(time);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: string | Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const handleShowDetails = () => {
    setShowUserModal(true);
  };

  const handleStartChat = async () => {
    if (!user) {
      toast.error("Please log in to start a chat");
      navigate("/signup");
      return;
    }

    if (!selectedBooking?.advocateId) {
      toast.error("Invalid advocate ID");
      return;
    }

    try {
      const conversation = await CreateConversation(
        selectedBooking.advocateId,
        "advocate"
      );
      navigate(
        `/chat?conversationId=${conversation?.data._id}&advocateId=${conversation?.data.participants[1].userId}`
      );
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isAdvocate ? "My Slots" : "My Bookings"}
            </h2>
            <button
              onClick={handleToday}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {monthName} {year}
            </h3>
          </div>

          <span className="text-sm text-gray-500">
            {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {/* {view === "month" && ( */}
        <div className="h-full flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {calendarDays.map((day, index) => {
              const dayBookings = getBookingsForDate(day.date);
              const isToday =
                day.date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`border-r border-b p-2 min-h-24 ${
                    !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : day.isCurrentMonth
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>

                  <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded">
                    {dayBookings.map((booking) => (
                      <button
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className={`w-full text-left px-2 py-1 rounded text-xs truncate ${getStatusColor(
                          booking.status
                        )} text-white hover:opacity-80 transition-opacity`}
                      >
                        {formatTime(booking.time)}{" "}
                        {booking.advocate?.name || "Available"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedBooking.advocate?.name || "Booking Details"}
                  </h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Mail className="w-4 h-4 mr-1" />
                    <span>
                      {selectedBooking.advocate?.email ||
                        (selectedBooking.status === "pending"
                          ? "Available"
                          : selectedBooking.status === "confirmed"
                          ? "Booked"
                          : selectedBooking.status === "cancelled"
                          ? "Cancelled"
                          : selectedBooking.status === "postponed"
                          ? "PostPoned"
                          : "Expired")}
                    </span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                    selectedBooking.status === "confirmed"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : selectedBooking.status === "pending"
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                      : selectedBooking.status === "cancelled"
                      ? "bg-red-50 text-red-700 border border-red-100"
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}
                >
                  {selectedBooking.status === "confirmed" && (
                    <Check className="w-4 h-4 mr-1" />
                  )}
                  {selectedBooking.status === "pending" && (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  {selectedBooking.status === "cancelled" && (
                    <X className="w-4 h-4 mr-1" />
                  )}
                  {selectedBooking.status === "postponed" && (
                    <AlertCircle className="w-4 h-4 mr-1" />
                  )}
                  <span className="capitalize">{selectedBooking.status}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-3 text-gray-500" />
                  <span>{formatDate(selectedBooking.date)}</span>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock className="w-5 h-5 mr-3 text-gray-500" />
                  <span>{formatTime(selectedBooking.time)}</span>
                </div>

                {selectedBooking.notes && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}

                {selectedBooking.postponeReason && (
                  <div className="flex items-start bg-amber-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Postponed
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedBooking.postponeReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {selectedBooking.status !== "cancelled" &&
                selectedBooking.status !== "postponed" && (
                  <div className="mt-6 flex gap-2">
                    {!isAdvocate ? (
                      <button
                        onClick={handleStartChat}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Chat with {selectedBooking.advocate?.name}
                      </button>
                    ) : (
                      <button
                        onClick={handleShowDetails}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Show Details
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onPostpone(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Postpone
                    </button>
                    <button
                      onClick={() => {
                        onCancel(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}

              <button
                onClick={() => setSelectedBooking(null)}
                className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedBooking?.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                User Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-gray-900">{selectedBooking.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{selectedBooking.user.email}</p>
                </div>
                {selectedBooking.user.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">
                      {selectedBooking.user.phone}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="mt-6 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
