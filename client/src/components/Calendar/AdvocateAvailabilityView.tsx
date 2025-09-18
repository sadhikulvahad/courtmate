import { useState } from "react";
import { format } from "date-fns";
import { RecurringRule } from "@/types/Types";
import { toast } from "sonner";

interface AdvocateAvailabilityViewProps {
  recurringRules: RecurringRule[];
  selectedDate: Date | null;
  onDateChange: (date: Date | null) => void;
  onAddCustomSlot: (slotDate: Date) => void;
  onAddRecurringRule: (rule: RecurringRule) => void;
  onUpdateRule: (rule: RecurringRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onAddException: (ruleId: string, date: Date) => void;
  predefinedSlots: { id: number; time: string; label: string }[];
}

const AdvocateAvailabilityView = ({
  recurringRules,
  onAddCustomSlot,
  onAddRecurringRule,
  onDeleteRule,
  onAddException,
  predefinedSlots,
}: AdvocateAvailabilityViewProps) => {
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("");
  const [newRule, setNewRule] = useState({
    frequency: "weekly" as "weekly" | "monthly",
    daysOfWeek: [] as number[],
    timeSlot: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [exceptionDate, setExceptionDate] = useState("");
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

  // Handle adding a custom slot
  const handleAddSlot = () => {
    if (!newSlotDate || !newSlotTime) {
      toast.error("Please select a date and time.");
      return;
    }
    const slotDate = new Date(`${newSlotDate}T${newSlotTime}:00Z`);
    if (slotDate < new Date()) {
      toast.error("Cannot add slots in the past.");
      return;
    }
    onAddCustomSlot(slotDate);
    setNewSlotDate("");
    setNewSlotTime("");
  };

  // Handle adding a recurring rule
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
      timeSlot: `${newRule.timeSlot}:00Z`,
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

  // Handle adding an exception
  const handleAddRuleException = (ruleId: string) => {
    if (!exceptionDate) {
      toast.error("Please select an exception date.");
      return;
    }
    onAddException(ruleId, new Date(exceptionDate));
    setExceptionDate("");
    setSelectedRuleId(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Custom Slot */}
      <div className="rounded bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Add One-Time Slot</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <input
            type="date"
            value={newSlotDate}
            onChange={(e) => setNewSlotDate(e.target.value)}
            className="rounded border p-2 w-full sm:w-auto"
            min={format(new Date(), "yyyy-MM-dd")} // Prevent past dates
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

      {/* Add Recurring Rule */}
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
                  frequency: e.target.value as "weekly" | "monthly",
                })
              }
              className="rounded border p-2 w-full"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Days of Week</label>
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
                newRule.startDate || format(new Date(), "yyyy-MM-dd'T'HH:mm")
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

      {/* Existing Rules */}
      <div className="rounded bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Your Availability Rules</h3>
        {recurringRules.length === 0 ? (
          <p className="text-gray-500">No recurring rules set.</p>
        ) : (
          <ul className="space-y-4">
            {recurringRules?.map((rule) => (
              <li key={rule._id} className="border-b py-2">
                <div className="flex justify-between">
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
                      From {format(new Date(rule.startDate), "MMM d, yyyy")} to{" "}
                      {format(new Date(rule.endDate), "MMM d, yyyy")}
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedRuleId(rule._id)}
                      className="text-blue-500 hover:underline"
                    >
                      Add Exception
                    </button>
                    <button
                      onClick={() => onDeleteRule(rule._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {selectedRuleId === rule._id && (
                  <div className="mt-2 flex space-x-2">
                    <input
                      type="date"
                      value={exceptionDate}
                      onChange={(e) => setExceptionDate(e.target.value)}
                      className="rounded border p-2"
                      min={rule.startDate}
                      max={rule.endDate}
                    />
                    <button
                      onClick={() => handleAddRuleException(rule._id)}
                      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Add Exception
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdvocateAvailabilityView;
