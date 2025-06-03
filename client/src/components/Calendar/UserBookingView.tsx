import { Calendar } from "lucide-react";
import BookingCard from "@/components/Calendar/BookingCard";
import { Booking } from "@/types/Types";

interface UserBookingViewProps {
  bookings: Booking[];
  onPostpone: (booking: Booking) => void;
  onCancel: (bookingId: string) => void;
  isAdvocate : boolean | null
}

export default function UserBookingView({
  bookings,
  onPostpone,
  onCancel,
  isAdvocate
}: UserBookingViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-medium text-gray-900">{isAdvocate ? "My Slots" : "My Bookings"}</h2>
      </div>

      <div className="p-4">
        {bookings?.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-3" />
            <h3 className="text-gray-700 font-medium mb-1">
              {isAdvocate ? "No Slots found" : "No bookings found"}
            </h3>
            <p className="text-gray-500 text-sm">
              You haven't made any appointments yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings?.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPostpone={onPostpone}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}