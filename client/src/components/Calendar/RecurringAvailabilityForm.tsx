import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { RecurringRule } from "@/types/Types";

// Day of week options
const daysOfWeek = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Frequency options
const frequencyOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

type Frequency = "weekly" | "monthly";

// Time slot options (same as in BookingPlatform)
const timeSlotOptions = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
];

interface RecurringAvailabilityFormProps {
  initialData?: RecurringRule;
  onSave: (data: RecurringRule) => void;
  onCancel: () => void;
}

const RecurringAvailabilityForm: React.FC<RecurringAvailabilityFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  // Form state
  const [frequency, setFrequency] = useState<Frequency>(
    initialData?.frequency || "weekly"
  );

  const [daysOfWeekSelected, setDaysOfWeekSelected] = useState<number[]>(
    initialData?.daysOfWeek || []
  );
  const [timeSlot, setTimeSlot] = useState(initialData?.timeSlot || "09:00");
  const [startDate, setStartDate] = useState(
    initialData?.startDate || format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ||
      format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  );
  const [interval, setInterval] = useState(initialData?.interval || 1);
  const [description, setDescription] = useState(
    initialData?.description || ""
  );

  // Auto-generate description based on form values
  useEffect(() => {
    let desc = "";

    if (frequency === "weekly") {
      const dayNames = daysOfWeekSelected
        .map((day) => daysOfWeek.find((d) => d.value === day)?.label)
        .join(", ");
      desc = `Every ${dayNames} at ${
        timeSlotOptions.find((t) => t.value === timeSlot)?.label
      }`;
    } else if (frequency === "monthly") {
      // For monthly, we'd need to determine if it's by day of month or day of week
      // Simplifying for now
      desc = `Monthly at ${
        timeSlotOptions.find((t) => t.value === timeSlot)?.label
      }`;
    }

    if (interval > 1) {
      desc = desc.replace("Every", `Every ${interval}`);
    }

    setDescription(desc);
  }, [frequency, daysOfWeekSelected, timeSlot, interval]);

  // Handle day selection toggle
  const toggleDay = (day: number) => {
    if (daysOfWeekSelected.includes(day)) {
      setDaysOfWeekSelected(daysOfWeekSelected.filter((d) => d !== day));
    } else {
      setDaysOfWeekSelected([...daysOfWeekSelected, day]);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create an RFC-5545 compliant rule (simplified version)
    const timeString = timeSlot.replace(":", "") + "00";
    const dtstart = startDate.replace(/-/g, "") + "T" + timeString + "Z";

    let rrule = `FREQ=${frequency.toUpperCase()};INTERVAL=${interval}`;

    if (frequency === "weekly" && daysOfWeekSelected.length > 0) {
      const byDay = daysOfWeekSelected
        .map((day) => {
          const weekdays = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
          return weekdays[day];
        })
        .join(",");
      rrule += `;BYDAY=${byDay}`;
    }

    const rule = `DTSTART:${dtstart}\nRRULE:${rrule}`;

    onSave({
      _id: initialData?._id || `rule-${Date.now()}`,
      rule,
      description,
      timeSlot,
      daysOfWeek: daysOfWeekSelected,
      frequency,
      interval,
      startDate,
      endDate,
      exceptions: initialData?.exceptions || [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">
          {initialData
            ? "Edit Recurring Availability"
            : "Add Recurring Availability"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Time Slot */}
      <div>
        <label
          htmlFor="timeSlot"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Time Slot
        </label>
        <select
          id="timeSlot"
          value={timeSlot}
          onChange={(e) => setTimeSlot(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          {timeSlotOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Frequency */}
      <div>
        <label
          htmlFor="frequency"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Repeats
        </label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value as "weekly" | "monthly")}
          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {frequencyOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Interval */}
      <div>
        <label
          htmlFor="interval"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Every
        </label>
        <div className="flex items-center gap-2">
          <input
            id="interval"
            type="number"
            min="1"
            max="12"
            value={interval}
            onChange={(e) => setInterval(parseInt(e.target.value))}
            className="w-20 rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-700">
            {frequency === "weekly" ? "week(s)" : "month(s)"}
          </span>
        </div>
      </div>

      {/* Days of Week (only for weekly) */}
      {frequency === "weekly" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Days of Week
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  daysOfWeekSelected.includes(day.value)
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                } border hover:bg-opacity-80 transition-colors`}
              >
                {day.label.substring(0, 3)}
              </button>
            ))}
          </div>
          {daysOfWeekSelected.length === 0 && (
            <p className="text-red-500 text-xs mt-1">
              Please select at least one day
            </p>
          )}
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Start Date
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            End Date
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Summary
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          disabled={frequency === "weekly" && daysOfWeekSelected.length === 0}
        >
          <Check className="w-4 h-4 mr-1" />
          {initialData ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};

export default RecurringAvailabilityForm;
