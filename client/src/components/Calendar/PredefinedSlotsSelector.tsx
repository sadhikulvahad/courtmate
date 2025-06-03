import { format } from "date-fns";

interface PredefinedSlot {
  id: number;
  time: string;
  label: string;
}

interface PredefinedSlotsSelectorProps {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  onSlotAdd: (slotDate: Date) => void;
  predefinedSlots: PredefinedSlot[];
}

export default function PredefinedSlotsSelector({
  selectedDate,
  onDateChange,
  onSlotAdd,
  predefinedSlots,
}: PredefinedSlotsSelectorProps) {
  return (
    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
      <div className="mb-3">
        <label
          htmlFor="custom-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Date
        </label>
        <input
          id="custom-date"
          type="date"
          value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
          onChange={(e) => onDateChange(new Date(e.target.value))}
          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Time Slots
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {predefinedSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                if (selectedDate) {
                  const [hours, minutes] = slot.time.split(":").map(Number);
                  const slotDate = new Date(selectedDate);
                  slotDate.setHours(hours, minutes, 0, 0);
                  onSlotAdd(slotDate);
                }
              }}
              className="p-2 border rounded-md hover:bg-blue-50 transition-colors"
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}