import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Slot } from "@/types/Types";

interface TimeSlotComponentProps {
  selectedDate: Date | null;
  availableSlots: Slot[];
  selectedSlot: Slot | null;
  onSlotSelect: (slot: Slot) => void;
  onBookSlot: () => void;
}

export default function TimeSlotComponent({
  selectedDate,
  availableSlots,
  selectedSlot,
  onSlotSelect,
  onBookSlot,
}: TimeSlotComponentProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">Available Times</h2>
        {selectedDate && (
          <p className="text-sm text-gray-600 mt-1">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        )}
      </div>

      <div className="p-4">
        {!selectedDate ? (
          <div className="text-center py-8">
            <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">Select a date to view available times</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No available times on this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {availableSlots
              .sort((a, b) => a.time.getTime() - b.time.getTime())
              .map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSlotSelect(slot)}
                  className={`p-3 rounded-md border text-center transition-colors ${
                    selectedSlot && selectedSlot.id === slot.id
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  {format(slot.time, "h:mm a")}
                </button>
              ))}
          </div>
        )}

        {selectedSlot && (
          <div className="mt-6">
            <button
              onClick={onBookSlot}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Book Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}