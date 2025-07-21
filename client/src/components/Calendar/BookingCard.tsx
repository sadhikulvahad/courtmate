import React from "react";
import { format } from "date-fns";
import { Clock, Calendar, Mail, AlertCircle, Check, X } from "lucide-react";
import { Booking } from "@/types/Types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreateConversation } from "@/api/chatApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface BookingCardProps {
  booking: Booking;
  onPostpone: (booking: Booking) => void;
  // onCancel: (bookingId: string) => void;
  isAdvocate: boolean | null;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPostpone,
  // onCancel,
  // isAdvocate,
}) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-100";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-100";
      case "postponed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Check className="w-4 h-4 mr-1" />;
      case "pending":
        return <Clock className="w-4 h-4 mr-1" />;
      case "cancelled":
        return <X className="w-4 h-4 mr-1" />;
      case "postponed":
        return <AlertCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const startChat = async () => {
    console.log('kasjd')
    if (!user) {
      toast.error("Please log in to start a chat");
      navigate("/signup");
      return;
    }

    if (!booking.advocate.id) {
      toast.error("Invalid advocate ID");
      return;
    }

    try {
      const conversation = await CreateConversation(
        booking.advocate.id,
        "advocate"
      );
      navigate(
        `/chat?conversationId=${conversation?.data._id}&advocateId=${conversation?.data.participants[1].userId}`
      );
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  return (
    <>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden transition-all hover:shadow-md">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              {booking?.advocate?.name ? (
                <h3 className="font-medium text-gray-900">
                  {booking?.advocate?.name}
                </h3>
              ) : (
                ""
              )}

              <div className="flex items-center text-gray-500 text-sm mt-1">
                <Mail className="w-3 h-3 mr-1" />
                <span>
                  {booking?.advocate?.email
                    ? booking?.advocate?.email
                    : booking.isAvailable
                    ? "Available"
                    : "Booked"}
                </span>
              </div>
            </div>
            {/* {booking?.advocate?.name ? ( */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                booking?.status
              )}`}
            >
              {getStatusIcon(booking?.status)}
              <span className="capitalize">{booking?.status}</span>
            </div>
            {/* ) : (
              ""
            )} */}
          </div>

          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex items-center text-gray-700 mb-2">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>
                {format(
                  new Date(booking.date).toISOString(),
                  "EEEE, MMMM d, yyyy"
                )}
              </span>
            </div>
            <div className="flex items-center text-gray-700">
              <Clock className="w-4 h-4 mr-2 text-gray-500" />
              <span>
                {format(new Date(booking.time).toISOString(), "h:mm a")}
              </span>
            </div>
          </div>
          {booking.notes && (
            <div className="mt-3 bg-gray-50 p-2 rounded text-sm text-gray-600">
              <p>{booking.notes}</p>
            </div>
          )}

          {booking.postponeReason && (
            <div className="mt-2 flex items-start">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-gray-500">
                <span className="font-medium">Postponed:</span>{" "}
                {booking.postponeReason}
              </p>
            </div>
          )}

          {/* Actions */}
          {(booking.status === "confirmed" ||
            booking.status === "pending" ||
            (!booking.advocate?.name && new Date(booking.date) > new Date())) &&
            booking.status !== "postponed" && (
              <div className="mt-4 flex justify-end space-x-2">
                {booking.advocate?.name && (
                  <button
                    onClick={startChat}
                    className="px-3 py-1 bg-green-400 text-black text-sm rounded hover:bg-green-100 transition-colors"
                  >
                    Chat with {booking.advocate.name}
                  </button>
                )}
                <button
                  onClick={() => onPostpone(booking)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 text-sm rounded hover:bg-blue-100 transition-colors"
                >
                  Postpone
                </button>
                {/* {isAdvocate ? (
                  <button
                    onClick={() => onCancel(booking.id)}
                    className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors"
                  >
                    Cancel
                  </button>
                ) : null} */}
              </div>
            )}
        </div>
      </div>
    </>
  );
};

export default BookingCard;
