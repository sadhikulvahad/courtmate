// src/components/Calendar/AdvocateProfilePage.tsx
import { useState, useEffect, useMemo } from "react";
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
  isBefore,
  isValid,
  parse,
} from "date-fns";
import { RootState } from "@/redux/store";
import { findUser } from "@/api/user/userApi";
import {
  AdvocateProps,
  Booking,
  CalendarDate,
  RecurringRule,
  Slot,
} from "@/types/Types";
import AdvocateProfileHeader from "@/components/Calendar/AdvocateProfileHeader";
import ViewToggle from "@/components/Calendar/ViewToggle";
import UserBookingsView from "@/components/Calendar/UserBookingsView";
import PostponeDialog from "@/components/Calendar/PostponeDialog";
import UserBookingView from "@/components/Calendar/UserBookingView";
import NavBar from "@/components/ui/NavBar";
import {
  addCustomSlot,
  addRecurringRule,
  cancelBooking,
  createPayment,
  getBookings,
  getRecurringRules,
  getSlots,
  postPoneBooking,
  postponeSlot,
} from "@/api/booking";
import { toast } from "sonner";
import axios from "axios";
import BookingSlotDialog from "@/components/Calendar/BookingSlotDialog";
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

const AdvocateProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentView, setCurrentView] = useState<"calendar" | "bookings">(
    "calendar"
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [advocate, setAdvocate] = useState<AdvocateProps | undefined>(
    undefined
  );
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPostponeDialog, setShowPostponeDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [calendarDates, setCalendarDates] = useState<CalendarDate[]>([]);
  const [recurringRules, setRecurringRules] = useState<RecurringRule[]>([]);
  const [bookingSlotDialog, setBookingSlotDialog] = useState(false);
  const [cancelConfirmationModal, setCancelConfirmationModal] = useState(false);
  const [cancelBookId, setCancelBookId] = useState("");
  const [bookingType, setBookingType] = useState<"followup" | "new" | "">("");
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "stripe" | "">(
    ""
  );
  const [caseId, setCaseId] = useState<string>("");

  const isAdvocate = user && (!id || user.id === id);

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

  const generateSlotsFromRules = (
    rules: RecurringRule[],
    startDate: Date,
    endDate: Date
  ) => {
    const slots: Slot[] = [];
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    rules.forEach((rule) => {
      if (
        !validateDate(rule.startDate, true) ||
        !validateDate(rule.endDate) ||
        !validateTimeSlot(rule.timeSlot)
      ) {
        toast.warning(`Invalid rule: ${rule._id}`, rule);
        return;
      }
      days.forEach((day) => {
        if (rule.daysOfWeek.includes(day.getDay()) && validateDate(day)) {
          if (
            new Date(rule.startDate) <= day &&
            new Date(rule.endDate) >= day
          ) {
            const isException = rule.exceptions?.some((exception) =>
              isSameDay(new Date(exception), day)
            );
            if (!isException) {
              const [hours, minutes] = rule.timeSlot.split(":");
              const slotDate = new Date(day);
              slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
              slots.push({
                id: `slot-${rule._id}-${format(day, "yyyyMMdd")}`,
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

  const userId = useMemo(() => user?.id, [user]);
  const userRole = useMemo(() => user?.role, [user]);

  const generateCalendarDates = (
    month: Date,
    slots: Slot[] = availableSlots
  ) => {
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
      ...daysInMonth.map((date) => {
        // Check if this date has available slots
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
    const fetchAdvocate = async () => {
      const advocateId = id ? id : (userId as string);

      try {
        setLoading(true); // Changed from false to true
        const data = await findUser(advocateId);
        setAdvocate(data.data.user);

        const rules = await getRecurringRules(advocateId);
        setRecurringRules(rules?.data.rules);

        const monthStart = startOfMonth(currentMonth);
        const slots = await getSlots(
          advocateId,
          format(monthStart, "yyyy-MM-dd")
        );

        // Set available slots first
        setAvailableSlots(slots.data);

        // Then generate calendar dates with the slots data
        generateCalendarDates(currentMonth, slots.data);

        let bookings;
        if (userRole === "user") {
          bookings = await getBookings(userId!);
          setUserBookings(bookings?.data.bookings);
        } else if (isAdvocate) {
          const formattedMonth = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
          ).padStart(2, "0")}`;
          bookings = await getSlots(user.id, formattedMonth);
          setUserBookings(bookings?.data);
        }
      } catch (error) {
        console.error("Error fetching advocate data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocate();
  }, [currentView]);

  const handleMonthChange = async (newMonth: Date) => {
    if (!isValid(newMonth)) {
      console.error("Invalid newMonth in handleMonthChange:", newMonth);
      toast.error("Invalid month selected");
      return;
    }
    setCurrentMonth(newMonth);
    try {
      const advocateId = selectedBooking?.advocate?.id;
      if (!advocateId) {
        toast.error("No advocate associated with this booking");
        return;
      }
      const monthStart = startOfMonth(newMonth);
      const slots = await getSlots(
        advocateId,
        format(monthStart, "yyyy-MM-dd")
      );
      const rules = await getRecurringRules(advocateId);
      const recurringSlots = generateSlotsFromRules(
        rules?.data.rules || [],
        monthStart,
        endOfMonth(newMonth)
      );
      const combinedSlots = [...slots.data, ...recurringSlots]
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

  const handleDateSelect = (date: Date | null) => {
    if (date && !validateDate(date, true)) {
      toast.error("Selected date is invalid or in the past.");
      return;
    }
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handlePreviousMonth = async () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);

    // Fetch slots for the new month
    const advocateId = id ? id : (userId as string);
    try {
      const slots = await getSlots(
        advocateId,
        format(startOfMonth(prevMonth), "yyyy-MM-dd")
      );
      setAvailableSlots(slots.data);
      generateCalendarDates(prevMonth, slots.data);
    } catch (error) {
      console.error("Error fetching slots for previous month:", error);
      generateCalendarDates(prevMonth, []);
    }
  };

  const handleNextMonth = async () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);

    // Fetch slots for the new month
    const advocateId = id ? id : (userId as string);
    try {
      const slots = await getSlots(
        advocateId,
        format(startOfMonth(nextMonth), "yyyy-MM-dd")
      );
      setAvailableSlots(slots.data);
      generateCalendarDates(nextMonth, slots.data);
    } catch (error) {
      console.error("Error fetching slots for next month:", error);
      generateCalendarDates(nextMonth, []);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    const slotDate = new Date(slot.date);
    const slotTime = new Date(slot.time);

    if (!validateDate(slotDate, true)) {
      toast.error("Selected slot date is invalid or in the past.");
      return;
    }

    const now = new Date();
    if (slotTime <= now) {
      toast.error("Selected slot time is in the past.");
      return;
    }

    setSelectedSlot(slot);
  };

  const handleBookSlot = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedSlot) {
      toast.error("Please select a slot.");
      return;
    }

    setBookingSlotDialog(true);
  };

  const handleProceedToPayment = async () => {
    try {
      const response = await createPayment(
        advocate?.id,
        selectedSlot?.id,
        paymentMethod,
        bookingType,
        caseId
      );

      console.log(response);

      if (response.data.url.success) {
        const data = response.data.url.url;
        console.log(data)
        if (data) {
          window.location.href = data;
        } else {
          throw new Error("Stripe session URL not found");
        }
      } else {
        toast.error(response.data.url.error);
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Something went wrong while initiating payment");
    }
  };

  const handleAddCustomSlot = async (slotDate: Date) => {
    if (!validateDate(slotDate)) {
      toast.error("Custom slot date is invalid or in the past.");
      return;
    }
    const [hours, minutes] = format(slotDate, "HH:mm").split(":");
    const timeSlot = `${hours}:${minutes}`;
    if (!validateTimeSlot(timeSlot)) {
      toast.error("Custom slot time is invalid or outside predefined slots.");
      return;
    }
    try {
      const slot = {
        date: format(slotDate, "yyyy-MM-dd"),
        time: timeSlot,
      };

      const newSlot = await addCustomSlot(advocate!.id, slot);

      if (newSlot.status === 201) {
        const updatedSlots = [...availableSlots, newSlot.data];
        setAvailableSlots(updatedSlots);
        generateCalendarDates(currentMonth, updatedSlots);
        toast.success("Slot created successfully");
      } else {
        toast.error(newSlot.data.message || "Failed to create slot");
      }
    } catch (error) {
      console.error("Error adding custom slot:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to add slot. Please try again.";
        toast.error(errorMessage);
      } else {
        toast.error("Failed to add slot. Please try again.");
      }
    }
  };

  const handleAddRecurringRule = async (rule: RecurringRule) => {
    if (!validateDate(rule.startDate, true) || !validateDate(rule.endDate)) {
      toast.error(
        "Recurring rule start or end date is invalid or in the past."
      );
      return;
    }
    if (new Date(rule.startDate) > new Date(rule.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }
    if (!validateTimeSlot(rule.timeSlot)) {
      toast.error("Recurring rule time slot is invalid.");
      return;
    }
    if (
      !rule.daysOfWeek.length ||
      rule.daysOfWeek.some((day) => day < 0 || day > 6)
    ) {
      toast.error("Invalid days of week.");
      return;
    }

    try {
      const newRule = await addRecurringRule(advocate!.id, rule);

      if (newRule.status === 201) {
        toast.success("Created successfully");
        setRecurringRules([...recurringRules, newRule.data]);
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const newSlots = generateSlotsFromRules(
          [newRule.data],
          monthStart,
          monthEnd
        );
        const updatedSlots = [...availableSlots, ...newSlots];
        setAvailableSlots(updatedSlots);
        // Regenerate calendar with updated slots
        generateCalendarDates(currentMonth, updatedSlots);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.error("Error adding recurring rule:", error);
      toast.error("Failed to add rule. Please try again.");
    }
  };

  const handlePostpone = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPostponeDialog(true);
  };

  const onCancel = (bookingId: string) => {
    setCancelBookId(bookingId);
    setCancelConfirmationModal(true);
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking(cancelBookId);
      setUserBookings((prevBookings) =>
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
      let response;
      if (isAdvocate) {
        response = await postponeSlot(date, time, reason, selectedBooking.id);
      } else {
        response = await postPoneBooking(
          date,
          time,
          reason!,
          selectedBooking.id
        );
      }

      if (response.status === 200) {
        setUserBookings(
          userBookings.map((booking) =>
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
      console.error(error);
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
      {userRole !== "advocate" && <NavBar />}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {userRole !== "advocate" && (
          <AdvocateProfileHeader advocate={advocate} />
        )}
        <ViewToggle
          currentView={currentView}
          isAdvocate={isAdvocate}
          onViewChange={setCurrentView}
        />

        {cancelConfirmationModal && (
          <ConfirmationModal
            title="Delete Review"
            description="Are you sure you want to delete your review?"
            isOpen={cancelConfirmationModal}
            onConfirm={() => {
              handleCancelBooking();
              setCancelConfirmationModal(false);
            }}
            onCancel={() => setCancelConfirmationModal(false)}
          />
        )}

        {currentView === "calendar" && (
          <UserBookingsView
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            calendarDates={calendarDates}
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            predefinedSlots={predefinedSlots}
            isAdvocate={isAdvocate}
            recurringRules={recurringRules || []}
            onDateSelect={handleDateSelect}
            onNextMonth={handleNextMonth}
            onPreviousMonth={handlePreviousMonth}
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
            onCancel={onCancel}
            isAdvocate={isAdvocate}
          />
        )}
      </div>
      {showPostponeDialog && selectedBooking && (
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
      )}
      {bookingSlotDialog && selectedSlot && (
        <BookingSlotDialog
          bookingDetails={selectedSlot}
          onClose={() => setBookingSlotDialog(false)}
          onProceedToPayment={handleProceedToPayment}
          advocate={advocate}
          setPaymentMethod={setPaymentMethod}
          bookingType={bookingType}
          paymentMethod={paymentMethod}
          setBookingType={setBookingType}
          caseId={caseId}
          setCaseId={setCaseId}
        />
      )}
    </div>
  );
};

export default AdvocateProfilePage;
