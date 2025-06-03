// src/components/Calendar/UserBookingsView.tsx
import { useState } from "react";
import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { CalendarDate, Slot, RecurringRule } from "@/types/Types";
import { toast } from "sonner";


interface UserBookingsViewProps {
  currentMonth: Date;
  selectedDate: Date | null;
  calendarDates: CalendarDate[];
  availableSlots: Slot[];
  selectedSlot: Slot | null;
  predefinedSlots: { id: number; time: string; label: string }[];
  isAdvocate: boolean | null;
  recurringRules: RecurringRule[];
  onDateSelect: (date: Date | null) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onSlotSelect: (slot: Slot) => void;
  onBookSlot: () => void;
  onAddCustomSlot: (slotDate: Date) => void;
  onAddRecurringRule: (rule: RecurringRule) => void;

}

const UserBookingsView = ({
  currentMonth,
  selectedDate,
  calendarDates,
  availableSlots,
  selectedSlot,
  predefinedSlots,
  isAdvocate,
  recurringRules,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onSlotSelect,
  onBookSlot,
  onAddCustomSlot,
  onAddRecurringRule,
}: UserBookingsViewProps) => {
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newRule, setNewRule] = useState({
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    daysOfWeek: [] as number[],
    timeSlot: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  console.log(recurringRules);

  const handleDateClick = (date: Date) => {
    const today = startOfDay(new Date());
    const clickedDate = startOfDay(date);

    // Check if the clicked date is in the past
    if (isBefore(clickedDate, today)) {
      toast.error("Cannot select dates in the past.");
      return;
    }

    // If date is valid, select it
    onDateSelect(date);
  };

  const handleAddSlot = () => {
    if (!newSlotDate || !newSlotTime) {
      toast.error("Please select a date and time.");
      return;
    }
    const slotDate = new Date(`${newSlotDate}T${newSlotTime}`);
    if (slotDate < new Date()) {
      toast.error("Cannot add slots in the past.");
      return;
    }
    onAddCustomSlot(slotDate);
    setNewSlotDate("");
    setNewSlotTime("");
  };

  const handleAddRule = () => {
    if (
      !newRule.frequency ||
      newRule.daysOfWeek.length === 0 ||
      !newRule.timeSlot ||
      !newRule.startDate ||
      !newRule.endDate
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (new Date(newRule.startDate) > new Date(newRule.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }
    const rule: RecurringRule = {
      _id: `rule-${Date.now()}`,
      description:
        newRule.description ||
        `Every ${newRule.frequency} at ${newRule.timeSlot}`,
      startDate: newRule.startDate,
      endDate: newRule.endDate,
      frequency: newRule.frequency,
      daysOfWeek: newRule.daysOfWeek,
      timeSlot: newRule.timeSlot,
      exceptions: [],
    };
    onAddRecurringRule(rule);
    setNewRule({
      frequency: "weekly",
      daysOfWeek: [],
      timeSlot: "",
      startDate: "",
      endDate: "",
      description: "",
    });
  };

  return (
    <div className="space-y-6">
      {!isAdvocate && (
        <div className="rounded bg-white p-6 shadow">
          <div className="flex justify-between mb-4">
            <button
              onClick={onPreviousMonth}
              className="px-4 py-2 text-blue-500 hover:bg-gray-100 rounded"
            >
              Previous
            </button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h3>
            <button
              onClick={onNextMonth}
              className="px-4 py-2 text-blue-500 hover:bg-gray-100 rounded"
            >
              Next
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
            {calendarDates.map((date, index) => {
              const isPastDate =
                date.date &&
                isBefore(startOfDay(date.date), startOfDay(new Date()));
              const isSelected =
                date.date && selectedDate && isSameDay(date.date, selectedDate);

              return (
                <div
                  key={index}
                  onClick={() => {
                    if (date.date) {
                      handleDateClick(date.date);
                    }
                  }}
                  className={`p-2 text-center rounded relative transition-colors
                ${isSelected ? "bg-blue-500 text-white" : ""}
                ${date.isToday ? "border-2 border-blue-500" : ""}
                ${
                  date.hasSlots && !isSelected
                    ? "bg-green-50 border border-green-200"
                    : ""
                }
                  ${
                    isPastDate && !isSelected ? "bg-gray-100 text-gray-400" : ""
                  }
                  ${!date.day ? "cursor-default bg-gray-50" : "cursor-pointer"}
                  ${
                    !isPastDate && date.day && !isSelected
                      ? "hover:bg-gray-100"
                      : ""
                  }
                    ${isPastDate && date.day ? "cursor-not-allowed" : ""}
                    `}
                >
                  {date.day || ""}
                  {date.hasSlots && date.day && (
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isAdvocate && (
        <>
          <div className="rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">Add One-Time Slot</h3>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="date"
                value={newSlotDate}
                onChange={(e) => setNewSlotDate(e.target.value)}
                className="rounded border p-2 w-full sm:w-auto"
                min={format(new Date(), "yyyy-MM-dd")}
              />
              <select
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="rounded border p-2 w-full sm:w-auto"
              >
                <option value="">Select Time</option>
                {predefinedSlots.map((slot) => (
                  <option key={slot.id} value={slot.time}>
                    {slot.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSlot}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Add Slot
              </button>
            </div>
          </div>

          <div className="rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">
              Add Recurring Availability
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Frequency</label>
                <select
                  value={newRule.frequency}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      frequency: e.target.value as
                        | "daily"
                        | "weekly"
                        | "monthly",
                    })
                  }
                  className="rounded border p-2 w-full"
                >
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Days of Week
                </label>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <label key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newRule.daysOfWeek.includes(day)}
                        onChange={(e) => {
                          const updatedDays = e.target.checked
                            ? [...newRule.daysOfWeek, day]
                            : newRule.daysOfWeek.filter((d) => d !== day);
                          setNewRule({ ...newRule, daysOfWeek: updatedDays });
                        }}
                        className="mr-1"
                      />
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Time Slot</label>
                <select
                  value={newRule.timeSlot}
                  onChange={(e) =>
                    setNewRule({ ...newRule, timeSlot: e.target.value })
                  }
                  className="rounded border p-2 w-full"
                >
                  <option value="">Select Time</option>
                  {predefinedSlots.map((slot) => (
                    <option key={slot.id} value={slot.time}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  value={newRule.startDate}
                  onChange={(e) =>
                    setNewRule({ ...newRule, startDate: e.target.value })
                  }
                  className="rounded border p-2 w-full"
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="datetime-local"
                  value={newRule.endDate}
                  onChange={(e) =>
                    setNewRule({ ...newRule, endDate: e.target.value })
                  }
                  className="rounded border p-2 w-full"
                  min={
                    newRule.startDate ||
                    format(new Date(), "yyyy-MM-dd'T'HH:mm")
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule({ ...newRule, description: e.target.value })
                  }
                  className="rounded border p-2 w-full"
                  placeholder="e.g., Weekly consultation slot"
                />
              </div>
              <button
                onClick={handleAddRule}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Add Recurring Rule
              </button>
            </div>
          </div>

          <div className="rounded bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold">
              Existing Availability Rules
            </h3>
            {!recurringRules || recurringRules?.length === 0 ? (
              <p className="text-gray-500">No recurring rules set.</p>
            ) : (
              <ul className="space-y-4">
                {recurringRules?.map((rule) => (
                  <li key={rule._id} className="border-b py-2">
                    <div>
                      <p className="font-medium">{rule.description}</p>
                      <p className="text-sm text-gray-600">
                        {rule.frequency.charAt(0).toUpperCase() +
                          rule.frequency.slice(1)}{" "}
                        on{" "}
                        {rule.daysOfWeek
                          .map(
                            (day) =>
                              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                day
                              ]
                          )
                          .join(", ")}{" "}
                        at {rule.timeSlot}
                      </p>
                      <p className="text-sm text-gray-600">
                        From {format(new Date(rule.startDate), "MMM d, yyyy")}{" "}
                        to {format(new Date(rule.endDate), "MMM d, yyyy")}
                      </p>
                      {rule.exceptions && rule.exceptions.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Exceptions:{" "}
                          {rule.exceptions
                            .map((d) => format(d, "MMM d, yyyy"))
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {selectedDate && !isAdvocate && (
        <div className="rounded bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold">
            Available Slots on {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {availableSlots
              .filter(
                (slot) =>
                  isSameDay(new Date(slot.date), selectedDate) &&
                  slot.isAvailable
              )
              .map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => {
                    onSlotSelect(slot);
                  }}
                  className={`p-2 rounded border
                    ${
                      selectedSlot?.id === slot.id
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 border-gray-300"
                    }
                    hover:bg-blue-100 transition-colors`}
                >
                  {format(slot.time, "h:mm a")}
                </button>
              ))}
            {availableSlots?.filter(
              (slot) =>
                isSameDay(new Date(slot.date), selectedDate) && slot.isAvailable
            ).length === 0 && (
              <p className="text-gray-500">No slots available for this date.</p>
            )}
          </div>
          {selectedSlot && (
            <button
              onClick={onBookSlot}
              className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Book Selected Slot
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserBookingsView;
