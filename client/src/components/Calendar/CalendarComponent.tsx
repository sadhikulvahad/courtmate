import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDate } from "@/types/Types";

interface CalendarComponentProps {
  currentMonth: Date;
  selectedDate: Date | null;
  calendarDates: CalendarDate[];
  onDateSelect: (date: Date | null) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarComponent({
  currentMonth,
  calendarDates,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
}: CalendarComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Select Date</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={onPreviousMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-gray-700 font-medium">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm text-gray-500 font-medium p-2"
            >
              {day}
            </div>
          ))}

          {calendarDates.map((date, index) => (
            <div
              key={index}
              className={`aspect-square p-1 ${!date.day ? "bg-gray-50" : ""}`}
            >
              {date.day && (
                <button
                  className={`w-full h-full rounded-lg flex flex-col items-center justify-center transition-all ${
                    date.isSelected
                      ? "bg-blue-600 text-white"
                      : date.isToday
                      ? "bg-blue-100 text-blue-800"
                      : "hover:bg-gray-100"
                  } ${
                    date.hasSlots
                      ? "cursor-pointer"
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!date.hasSlots}
                  onClick={() => onDateSelect(date.date)}
                >
                  <span
                    className={`text-sm ${date.isSelected ? "font-medium" : ""}`}
                  >
                    {date.day}
                  </span>
                  {date.hasSlots && (
                    <div className="mt-1 w-1 h-1 rounded-full bg-green-500"></div>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}