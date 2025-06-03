import React, { useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, Calendar, Clock, X } from "lucide-react";
import { Booking } from "@/types/Types";

interface PostponeDialogProps {
  isOpen: boolean;
  booking: Booking;
  onClose: () => void;
  onPostpone: (date: string, time: string, reason: string) => void;
}

const PostponeDialog: React.FC<PostponeDialogProps> = ({
  isOpen,
  booking,
  onClose,
  onPostpone,
}) => {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const timeOptions = [
    { value: "09:00", label: "9:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "11:00", label: "11:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "15:00", label: "3:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "17:00", label: "5:00 PM" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      setError("Please select both date and time");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for postponing");
      return;
    }

    onPostpone(date, time, reason);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
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

        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex text-red-800 items-center">
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

          <div className="space-y-4">
            <div>
              <label
                htmlFor="new-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Date
              </label>
              <input
                id="new-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="new-time"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Time
              </label>
              <select
                id="new-time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {timeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
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

            {error && <div className="text-red-500 text-sm">{error}</div>}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Postpone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostponeDialog;
