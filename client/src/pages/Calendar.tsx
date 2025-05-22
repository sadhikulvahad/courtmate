// src/components/Calendar/AdvocateProfilePage.tsx
import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  startOfMonth,
  endOfMonth,
  isToday,
  format,
} from "date-fns";
import { RootState } from "@/redux/store";
import { findUser } from "@/api/user/userApi";
import { AdvocateProps, Booking, CalendarDate, RecurringRule, Slot } from "@/types/Types";
import AdvocateProfileHeader from "@/components/Calendar/AdvocateProfileHeader";
import ViewToggle from "@/components/Calendar/ViewToggle";
import UserBookingsView from "@/components/Calendar/UserBookingsView";
import PostponeDialog from "@/components/Calendar/PostponeDialog";
import UserBookingView from "@/components/Calendar/UserBookingView";
import NavBar from "@/components/ui/NavBar";

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

const AdvocateProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [currentView, setCurrentView] = useState<"calendar" | "bookings">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [advocate, setAdvocate] = useState<AdvocateProps | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPostponeDialog, setShowPostponeDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);

  const isAdvocate = user && (!id || user.id === id);

  const generateSlotsFromRules = (rules: RecurringRule[], startDate: Date, endDate: Date) => {
    const slots: Slot[] = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    rules.forEach((rule) => {
      days.forEach((day) => {
        if (rule.daysOfWeek.includes(day.getDay())) {
          if (new Date(rule.startDate) <= day && new Date(rule.endDate) >= day) {
            const isException = rule.exceptions?.some((exception) =>
              isSameDay(new Date(exception), day)
            );
            if (!isException) {
              const [hours, minutes] = rule.timeSlot.split(":");
              const slotDate = new Date(day);
              slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              slots.push({
                _id: `slot-${rule.id}-${format(day, "yyyyMMdd")}`,
                date: day,
                time: slotDate,
                isAvailable: true,
              });
            }
          }
        }
      });
    });
    return slots;
  };

  useEffect(() => {
    const fetchAdvocate = async () => {
      const advocateId = id ? id : user?.id as string;

      try {
        setLoading(true);
        const data = await findUser(advocateId, token);
        setAdvocate(data);

        const rules: RecurringRule[] = data.availabilityRules || [
          {
            id: "rule-1",
            description: "Every Monday at 9:00 AM",
            startDate: "2025-01-01",
            endDate: "2025-12-31",
            frequency: "weekly",
            daysOfWeek: [1],
            timeSlot: "09:00",
            exceptions: [],
          },
        ];
        setRecurringRules(rules);

        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const generatedSlots = generateSlotsFromRules(rules, monthStart, monthEnd);

        const customSlots: Slot[] = [];
        for (let i = 1; i < 8; i++) {
          const date = new Date(2025, 4, 22 + i);
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          customSlots.push({
            _id: `slot-${i}-1`,
            date: date,
            time: new Date(date.setHours(9, 0, 0, 0)),
            isAvailable: true,
          });
          customSlots.push({
            _id: `slot-${i}-2`,
            date: date,
            time: new Date(date.setHours(14, 0, 0, 0)),
            isAvailable: true,
          });
        }
        setAvailableSlots([...generatedSlots, ...customSlots]);

        generateCalendarDates(currentMonth);

        if (user) {
          const mockBookings: Booking[] = [
            {
              _id: "booking-1",
              user: { name: "John Doe", email: "john@example.com" },
              date: new Date(2025, 4, 22),
              time: new Date(2025, 4, 22, 10, 0),
              status: "confirmed",
              notes: "Initial consultation",
            },
          ];
          setUserBookings(mockBookings);
        }
      } catch (error) {
        console.error("Error fetching advocate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocate();
  }, [id, token, user, currentMonth]);

  const generateCalendarDates = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfDay(monthStart);
    const endDate = endOfDay(monthEnd);
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    const dayOfWeek = monthStart.getDay();
    const daysFromPrevMonth = Array(dayOfWeek).fill(null);
    const dates: CalendarDate[] = [
      ...daysFromPrevMonth.map(() => ({
        day: null,
        date: null,
        isToday: false,
        isSelected: false,
        hasSlots: false,
      })),
      ...daysInMonth.map((date) => ({
        day: date.getDate(),
        date: date,
        isToday: isToday(date),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        hasSlots: availableSlots.some((slot) => isSameDay(new Date(slot.date), date) && slot.isAvailable),
      })),
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

  const handleDateSelect = (date: Date | null) => {
    console.log("Selected date:", date);
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
    generateCalendarDates(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    generateCalendarDates(nextMonth);
  };

  const handleSlotSelect = (slot: Slot) => {
    console.log("Selected slot:", slot);
    setSelectedSlot(slot);
  };

  const handleBookSlot = async () => {
    if (!user) {
      navigate("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (!selectedSlot) {
      alert("Please select a slot.");
      return;
    }

    try {
      const newBooking: Booking = {
        _id: `booking-${Date.now()}`,
        user: { name: user.name, email: user.email },
        date: selectedSlot.date,
        time: selectedSlot.time,
        status: "confirmed",
        notes: "Booked via user interface",
      };
      setUserBookings([...userBookings, newBooking]);
      setAvailableSlots(
        availableSlots.map((slot) =>
          slot._id === selectedSlot._id ? { ...slot, isAvailable: false } : slot
        )
      );
      alert("Appointment booked successfully!");
      setSelectedSlot(null);
      generateCalendarDates(currentMonth);
    } catch (error) {
      console.error("Error booking slot:", error);
      alert("Failed to book slot. Please try again.");
    }
  };

  const handleAddCustomSlot = (slotDate: Date) => {
    const newSlot: Slot = {
      _id: `custom-slot-${Date.now()}`,
      date: slotDate,
      time: slotDate,
      isAvailable: true,
    };
    setAvailableSlots([...availableSlots, newSlot]);
    generateCalendarDates(currentMonth);
  };

  const handleAddRecurringRule = (rule: RecurringRule) => {
    setRecurringRules([...recurringRules, rule]);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const newSlots = generateSlotsFromRules([rule], monthStart, monthEnd);
    setAvailableSlots([...availableSlots, ...newSlots]);
    generateCalendarDates(currentMonth);
  };

  const handlePostpone = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPostponeDialog(true);
  };

  const handlePostponeConfirm = (date: string, time: string, reason: string) => {
    if (!selectedBooking) return;
    setUserBookings(
      userBookings.map((booking) =>
        booking._id === selectedBooking._id
          ? {
              ...booking,
              date: new Date(date),
              time: new Date(`${date}T${time}`),
              status: "postponed",
              postponeReason: reason,
            }
          : booking
      )
    );
    setShowPostponeDialog(false);
    setSelectedBooking(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    setUserBookings(
      userBookings.map((booking) =>
        booking._id === bookingId ? { ...booking, status: "cancelled" } : booking
      )
    );
    setAvailableSlots(
      availableSlots.map((slot) =>
        slot._id === bookingId ? { ...slot, isAvailable: true } : slot
      )
    );
    generateCalendarDates(currentMonth);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!advocate) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Advocate Not Found</h2>
        <p className="mt-2 text-gray-600">
          The advocate you're looking for doesn't exist or has been removed.
        </p>
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role !== "advocate" && <NavBar />}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {user?.role !== "advocate" && <AdvocateProfileHeader advocate={advocate} />}
        <ViewToggle
          currentView={currentView}
          isAdvocate={isAdvocate}
          onViewChange={setCurrentView}
        />
        {currentView === "calendar" && (
          <UserBookingsView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            calendarDates={calendarDates}
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            predefinedSlots={predefinedSlots}
            isAdvocate={isAdvocate}
            recurringRules={recurringRules}
            onDateSelect={handleDateSelect}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onSlotSelect={handleSlotSelect}
            onBookSlot={handleBookSlot}
            onAddCustomSlot={handleAddCustomSlot}
            onAddRecurringRule={handleAddRecurringRule}
          />
        )}
        {currentView === "bookings" && (
          <UserBookingView
            bookings={userBookings}
            onPostpone={handlePostpone}
            onCancel={handleCancelBooking}
          />
        )}
      </div>
      {showPostponeDialog && selectedBooking && (
        <PostponeDialog
          isOpen={showPostponeDialog}
          booking={selectedBooking}
          onClose={() => setShowPostponeDialog(false)}
          onPostpone={handlePostponeConfirm}
        />
      )}
    </div>
  );
};

export default AdvocateProfilePage;