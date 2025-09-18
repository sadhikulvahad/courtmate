import React, { useState, useEffect } from "react";
import {
  format,
  isSameDay,
  isBefore,
  startOfDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  endOfDay,
  isValid,
} from "date-fns";
import { AlertTriangle, Calendar, Clock, X } from "lucide-react";
import { Booking, CalendarDate, Slot } from "@/types/Types";
import { toast } from "sonner";

interface PostponeDialogProps {
  isOpen: boolean;
  booking: Booking;
  onClose: () => void;
  onPostpone: (date: string, time: string, reason: string) => void;
  currentMonth: Date;
  calendarDates: CalendarDate[];
  availableSlots: Slot[];
  predefinedSlots: { id: number; time: string; label: string }[];
  onMonthChange?: (newMonth: Date) => void;
}

const PostponeDialog: React.FC<PostponeDialogProps> = ({
  isOpen,
  booking,
  onClose,
  onPostpone,
  currentMonth,
  availableSlots,
  onMonthChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [dialogCalendarDates, setDialogCalendarDates] = useState<
    CalendarDate[]
  >([]);

  // Generate calendar dates for the dialog
  const generateCalendarDates = (month: Date) => {
    if (!isValid(month)) {
      console.error("Invalid month passed to generateCalendarDates:", month);
      toast.error("Invalid calendar month. Please try again.");
      setDialogCalendarDates([]);
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
      setDialogCalendarDates([]);
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
        const hasAvailableSlots = availableSlots.some(
          (slot) => isSameDay(slot.date, date) && slot.isAvailable
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

    setDialogCalendarDates(dates);
  };

  useEffect(() => {
    if (isValid(currentMonth)) {
      generateCalendarDates(currentMonth);
    } else {
      console.error("Invalid currentMonth in useEffect:", currentMonth);
      toast.error("Invalid calendar month");
    }
  }, [currentMonth, availableSlots, selectedDate]);

  const handleDateClick = (date: Date) => {
    const today = startOfDay(new Date());
    const clickedDate = startOfDay(date);

    if (isBefore(clickedDate, today)) {
      toast.error("Cannot select dates in the past.");
      return;
    }

    setSelectedDate(date);
    setSelectedTime(""); // Reset time selection when date changes
  };

  // Helper function to format slot time safely
  const formatSlotTime = (time: string | Date): string => {
    try {
      if (typeof time === "string") {
        // If time is a simple time string like "09:00"
        if (/^\d{2}:\d{2}$/.test(time)) {
          const date = selectedDate || new Date();
          const [hours, minutes] = time.split(":");
          const slotDate = new Date(date);
          slotDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return format(slotDate, "h:mm a");
        }
        // If time is a full ISO date string
        const parsedDate = new Date(time);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date");
        }
        return format(parsedDate, "h:mm a");
      } else if (time instanceof Date && !isNaN(time.getTime())) {
        return format(time, "h:mm a");
      }
      throw new Error("Invalid time format");
    } catch (error) {
      console.error("Error formatting slot time:", time, error);
      return "Invalid Time";
    }
  };

  // Helper function to get time in HH:mm format
  const getTimeInHHMM = (time: string | Date): string => {
    try {
      if (typeof time === "string" && /^\d{2}:\d{2}$/.test(time)) {
        return time;
      }
      const parsedDate = typeof time === "string" ? new Date(time) : time;
      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }
      return format(parsedDate, "HH:mm");
    } catch (error) {
      console.error("Error getting HH:mm time:", time, error);
      return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for postponing");
      return;
    }

    // Validate that selectedTime is a valid slot
    const isValidSlot = availableSlots.some(
      (slot) =>
        isSameDay(slot.date, selectedDate) &&
        getTimeInHHMM(slot.time) === selectedTime &&
        slot.isAvailable
    );

    if (!isValidSlot) {
      setError("Selected time is not available for this date");
      return;
    }

    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    onPostpone(formattedDate, selectedTime, reason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">
            Postpone Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form>
            <div className="flex text-red-800 items-center mb-4">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>You can only postpone one time</span>
            </div>
            {booking && (
              <div className="mb-4 bg-blue-50 p-3 rounded-md text-sm">
                <p className="text-blue-700 font-medium">
                  Currently scheduled for:
                </p>
                <div className="flex items-center mt-1 text-blue-800">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {format(new Date(booking.date), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-blue-800">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{format(new Date(booking.time), "h:mm a")}</span>
                </div>
              </div>
            )}

            {/* Calendar Section */}
            <div className="rounded bg-white p-6 shadow mb-6">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                    <span>Available Slots</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                    <span>Today</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={() => {
                    const prevMonth = new Date(currentMonth);
                    prevMonth.setMonth(prevMonth.getMonth() - 1);
                    if (isValid(prevMonth)) {
                      onMonthChange?.(prevMonth);
                      generateCalendarDates(prevMonth);
                    } else {
                      toast.error("Invalid previous month");
                    }
                  }}
                  className="px-4 py-2 text-blue-500 hover:bg-gray-100 rounded"
                >
                  Previous
                </button>
                <h3 className="text-lg font-semibold">
                  {isValid(currentMonth)
                    ? format(currentMonth, "MMMM yyyy")
                    : "Invalid Month"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    if (isValid(nextMonth)) {
                      onMonthChange?.(nextMonth);
                      generateCalendarDates(nextMonth);
                    } else {
                      toast.error("Invalid next month");
                    }
                  }}
                  className="px-4 py-2 text-blue-500 hover:bg-gray-100 rounded"
                >
                  Next
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  )
                )}
                {dialogCalendarDates.map((date, index) => {
                  const isPastDate =
                    date.date &&
                    isBefore(startOfDay(date.date), startOfDay(new Date()));
                  const isSelected =
                    date.date &&
                    selectedDate &&
                    isSameDay(date.date, selectedDate);

                  if (isPastDate) {
                    return (
                      <div key={index} className="p-3 text-center min-h-[50px]">
                        {/* Empty cell for past dates */}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        if (date.date) {
                          handleDateClick(date.date);
                        }
                      }}
                      className={`p-3 text-center rounded-lg relative transition-all duration-200 min-h-[50px] flex flex-col items-center justify-center
                        ${
                          isSelected
                            ? "bg-blue-500 text-white shadow-lg scale-105"
                            : ""
                        }
                        ${
                          date.isToday && !isSelected
                            ? "border-2 border-blue-500 bg-blue-50"
                            : ""
                        }
                        ${
                          date.hasSlots && !isSelected
                            ? "bg-green-100 border-2 border-green-400 hover:bg-green-200"
                            : ""
                        }
                        ${!date.day ? "cursor-default" : ""}
                        ${
                          date.day && !isSelected
                            ? "hover:bg-gray-100 cursor-pointer"
                            : ""
                        }
                        ${date.hasSlots ? "transform hover:scale-105" : ""}
                      `}
                    >
                      <span
                        className={`font-medium ${
                          isSelected ? "text-white" : ""
                        }`}
                      >
                        {date.day || ""}
                      </span>

                      {date.hasSlots && date.day && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? "bg-white" : "bg-green-500"
                            }`}
                          />
                        </div>
                      )}

                      {date.isToday && !isSelected && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Available Slots Section */}
            {selectedDate && (
              <div className="rounded bg-white p-6 shadow mb-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Available Slots on {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {availableSlots
                    .filter(
                      (slot) =>
                        isSameDay(slot.date, selectedDate) &&
                        slot.isAvailable &&
                        getTimeInHHMM(slot.time) !== ""
                    )
                    .map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() =>
                          setSelectedTime(getTimeInHHMM(slot.time))
                        }
                        className={`p-3 rounded-lg border-2 transition-all duration-200 font-medium
                          ${
                            selectedTime === getTimeInHHMM(slot.time)
                              ? "bg-blue-500 text-white border-blue-500 shadow-lg scale-105"
                              : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400"
                          }`}
                      >
                        {formatSlotTime(slot.time)}
                      </button>
                    ))}
                  {availableSlots.filter(
                    (slot) =>
                      isSameDay(slot.date, selectedDate) &&
                      slot.isAvailable &&
                      getTimeInHHMM(slot.time) !== ""
                  ).length === 0 && (
                    <p className="text-gray-500 col-span-full text-center py-8">
                      No slots available for this date.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reason Input */}
            <div className="mb-4">
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reason for Postponing
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide a reason for postponing this appointment"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            {/* Footer */}
            <div className="flex justify-end space-x-3 py-4  border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Postpone
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostponeDialog;
