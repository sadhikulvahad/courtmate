import { useEffect, useState, Component, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  isBefore,
  isValid,
  startOfDay,
  parse,
  isToday,
  isSameDay,
  startOfMonth,
  endOfMonth,
  endOfDay,
  eachDayOfInterval,
  format,
} from "date-fns";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { RootState } from "@/redux/store";
import { Booking, CalendarDate, Slot } from "@/types/Types";
import {
  getBookings,
  postPoneBooking,
  getSlots,
  getAdvocateBookings,
  cancelBooking,
} from "@/api/booking";
import PostponeDialog from "@/components/Calendar/PostponeDialog";
import UserBookingView from "@/components/Calendar/UserBookingView";
import Loader from "@/components/ui/Loading";
import NavBar from "@/components/ui/NavBar";
import ConfirmationModal from "@/components/ConfirmationModal";

const predefinedSlots = [
  { id: 1, time: "09:00", label: "9:00 AM" },
  { id: 2, time: "10:00", label: "10:00 AM" },
  { id: 3, time: "11:00", label: "11:00 AM" },
  { id: 4, time: "12:00", label: "12:00 PM" },
  { id: 5, time: "13:00", label: "1:00 PM" },
  { id: 6, time: "14:00", label: "2:00 PM" },
  { id: 7, time: "15:00", label: "3:00 PM" },
  { id: 8, time: "16:00", label: "4:00 PM" },
  { id: 9, time: "17:00", label: "5:00 PM" },
];

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showPostponeDialog, setShowPostponeDialog] = useState(false);
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [cancelConfirmationModal, setCancelConfirmationModal] = useState(false);
  const [cancelBookId, setCancelBookId] = useState("");
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAdvocate = user?.role === "advocate";

  const validateDate = (
    date: Date | string,
    allowToday: boolean = false
  ): boolean => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (!isValid(parsedDate)) return false;
    const today = startOfDay(new Date());
    return allowToday
      ? !isBefore(parsedDate, today)
      : isBefore(today, parsedDate);
  };

  const validateTimeSlot = (timeSlot: string): boolean => {
    return (
      /^\d{2}:\d{2}$/.test(timeSlot) &&
      predefinedSlots.some((slot) => slot.time === timeSlot)
    );
  };

  const generateCalendarDates = (
    month: Date,
    slots: Slot[] = availableSlots
  ) => {
    if (!isValid(month)) {
      console.error("Invalid month passed to generateCalendarDates:", month);
      toast.error("Invalid calendar month. Please try again.");
      setCalendarDates([]);
      return;
    }

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfDay(monthStart);
    const endDate = endOfDay(monthEnd);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const dayOfWeek = monthStart.getDay();
    if (isNaN(dayOfWeek)) {
      console.error("Invalid dayOfWeek:", dayOfWeek, "for month:", month);
      setCalendarDates([]);
      return;
    }

    const daysFromPrevMonth = Array(dayOfWeek).fill(null);

    const dates: CalendarDate[] = [
      ...daysFromPrevMonth.map(() => ({
        day: null,
        date: null,
        isToday: false,
        isSelected: false,
        hasSlots: false,
      })),
      ...daysInMonth.map((date) => {
        const hasAvailableSlots = slots.some(
          (slot) => isSameDay(new Date(slot.date), date) && slot.isAvailable
        );
        return {
          day: date.getDate(),
          date: date,
          isToday: isToday(date),
          isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
          hasSlots: hasAvailableSlots,
        };
      }),
    ];

    const totalCells = 42;
    if (dates.length < totalCells) {
      const remaining = totalCells - dates.length;
      for (let i = 0; i < remaining; i++) {
        dates.push({
          day: null,
          date: null,
          isToday: false,
          isSelected: false,
          hasSlots: false,
        });
      }
    }

    setCalendarDates(dates);
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          let bookings;
          if (user.role === "advocate") {
            bookings = await getAdvocateBookings(user.id);
          } else {
            bookings = await getBookings(user.id);
          }
          setBookings(bookings.data.bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Something went wrong or you don't have any bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, token]);
  useEffect(() => {
    const fetchSlotsForBooking = async () => {
      if (!showPostponeDialog || !selectedBooking) return;
      try {
        const advocateId = selectedBooking?.advocateId;
        if (!advocateId) {
          toast.error("No advocate associated with this booking");
          return;
        }

        const monthStart = startOfMonth(currentMonth);
        const slots = await getSlots(
          advocateId,
          format(monthStart, "yyyy-MM-dd")
        );

        const combinedSlots = [...slots.data]
          .filter((slot) => {
            const isValidDate = validateDate(slot.date, true);
            const isValidTime =
              typeof slot.time === "string" &&
              (/^\d{2}:\d{2}$/.test(slot.time) ||
                !isNaN(new Date(slot.time).getTime()));
            if (!isValidDate || !isValidTime) {
              return false;
            }
            return true;
          })
          .map((slot) => ({
            ...slot,
            date:
              typeof slot.date === "string"
                ? slot.date
                : format(slot.date, "yyyy-MM-dd"),
            time:
              typeof slot.time === "string" && /^\d{2}:\d{2}$/.test(slot.time)
                ? slot.time
                : format(new Date(slot.time), "HH:mm"),
          }));
        setAvailableSlots(combinedSlots);
        generateCalendarDates(currentMonth, combinedSlots);
      } catch (error) {
        console.error("Error fetching slots for postponing:", error);
        toast.error("Failed to load available slots");
        setAvailableSlots([]);
        generateCalendarDates(currentMonth, []);
      }
    };

    fetchSlotsForBooking();
  }, [showPostponeDialog, selectedBooking, currentMonth]);

  const handleMonthChange = async (newMonth: Date) => {
    if (!isValid(newMonth)) {
      console.error("Invalid newMonth in handleMonthChange:", newMonth);
      toast.error("Invalid month selected");
      return;
    }
    setCurrentMonth(newMonth);
    try {
      const advocateId = selectedBooking?.advocateId;
      if (!advocateId) {
        toast.error("No advocate associated with this booking");
        return;
      }
      const monthStart = startOfMonth(newMonth);
      const slots = await getSlots(
        advocateId,
        format(monthStart, "yyyy-MM-dd")
      );
      const combinedSlots = [...slots.data]
        .filter((slot) => {
          const isValidDate = validateDate(slot.date, true);
          const isValidTime =
            typeof slot.time === "string" &&
            (/^\d{2}:\d{2}$/.test(slot.time) ||
              !isNaN(new Date(slot.time).getTime()));
          if (!isValidDate || !isValidTime) {
            console.warn("Invalid slot filtered out:", slot);
            return false;
          }
          return true;
        })
        .map((slot) => ({
          ...slot,
          date:
            typeof slot.date === "string"
              ? slot.date
              : format(slot.date, "yyyy-MM-dd"),
          time:
            typeof slot.time === "string" && /^\d{2}:\d{2}$/.test(slot.time)
              ? slot.time
              : format(new Date(slot.time), "HH:mm"),
        }));
      setAvailableSlots(combinedSlots);
      generateCalendarDates(newMonth, combinedSlots);
    } catch (error) {
      console.error("Error fetching slots for new month:", error);
      toast.error("Failed to load slots for the selected month");
      setAvailableSlots([]);
      generateCalendarDates(newMonth, []);
    }
  };

  const handlePostpone = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDate(new Date(booking.date));
    setShowPostponeDialog(true);
  };

  const onCancel = (bookingId: string) => {
    setCancelBookId(bookingId);
    setCancelConfirmationModal(true);
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking(cancelBookId);
      setBookings((prevBookings) =>
        prevBookings
          .map((booking) =>
            booking.id === cancelBookId
              ? { ...booking, status: "cancelled" as Booking["status"] }
              : booking
          )
          .filter((booking) => booking.status !== "cancelled")
      );
      toast.success("Booking cancelled successfully!");
    } catch (error) {
      console.error("Error in handleCancelBooking:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.error ||
            "Failed to cancel booking. Please try again."
        );
      } else {
        toast.error("Failed to cancel booking. Please try again.");
      }
    }
  };

  const handlePostponeConfirm = async (
    date: string,
    time: string,
    reason?: string
  ) => {
    if (!selectedBooking) return;

    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    const parsedTime = parse(
      `${date}T${time}`,
      "yyyy-MM-dd'T'HH:mm",
      new Date()
    );

    if (!validateDate(parsedDate) || !validateDate(parsedTime)) {
      toast.error("Postponed date or time is invalid or in the past.");
      return;
    }

    if (!validateTimeSlot(time)) {
      toast.error("Postponed time is invalid or outside predefined slots.");
      return;
    }

    try {
      const response = await postPoneBooking(
        date,
        time,
        reason!,
        selectedBooking.id
      );

      if (response.status === 200) {
        setBookings(
          bookings.map((booking) =>
            booking.id === selectedBooking.id
              ? {
                  ...booking,
                  date: parsedDate,
                  time: parsedTime,
                  status: "postponed",
                  postponeReason: reason || "Postponed by user",
                }
              : booking
          )
        );
        setShowPostponeDialog(false);
        setSelectedBooking(null);
        toast.success("Slot postponed successfully!");
      }
    } catch (error: unknown) {
      console.error("Error postponing booking:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.error ||
            "There is a problem in postponing your slot"
        );
      } else {
        toast.error("There is a problem in postponing your slot");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {user?.role === "user" && <NavBar />}
        <Loader />
      </div>
    );
  }

  return (
    <div>
      {user?.role === "user" && <NavBar />}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
        <UserBookingView
          bookings={bookings}
          onPostpone={handlePostpone}
          onCancel={onCancel}
          isAdvocate={isAdvocate}
        />
      </div>
      {showPostponeDialog && selectedBooking && (
        <ErrorBoundary>
          <PostponeDialog
            isOpen={showPostponeDialog}
            booking={selectedBooking}
            onClose={() => setShowPostponeDialog(false)}
            onPostpone={handlePostponeConfirm}
            currentMonth={currentMonth}
            calendarDates={calendarDates}
            availableSlots={availableSlots}
            predefinedSlots={predefinedSlots}
            onMonthChange={handleMonthChange}
          />
        </ErrorBoundary>
      )}
      {cancelConfirmationModal && (
        <ConfirmationModal
          title="Delete Review"
          description="Are you sure you want to delete your review?"
          isOpen={cancelConfirmationModal}
          onConfirm={() => {
            handleCancelBooking()
            setCancelConfirmationModal(false)
          }}
          onCancel={() => setCancelConfirmationModal(false)}
        />
      )}
    </div>
  );
};

export default Bookings;
