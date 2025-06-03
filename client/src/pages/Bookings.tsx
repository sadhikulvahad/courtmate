import { getBookings, postPoneBooking } from "@/api/Booking";
import PostponeDialog from "@/components/Calendar/PostponeDialog";
import UserBookingView from "@/components/Calendar/UserBookingView";
import Loader from "@/components/ui/Loading";
import NavBar from "@/components/ui/NavBar";
import { RootState } from "@/redux/store";
import { Booking } from "@/types/Types";
import axios from "axios";
import { isBefore, isValid, startOfDay, parse } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ShowPostponeDialog, setShowPostponeDialog] = useState(false);
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const isAdvocate = user?.role === "advocate" ? true : false;

  const predefinedSlots = [
    { id: 1, time: "09:00", label: "9:00 AM" },
    { id: 2, time: "10:00", label: "10:00 AM" },
    { id: 3, time: "11:00", label: "11:00 AM" },
    { id: 4, time: "12:00", label: "12:00 PM" },
    { id: 5, time: "13:00", label: "1:00 PM" },
    { id: 6, time: "14:00", label: "2:00 PM" },
    { id: 7, time: "15:00", label: "3:00 PM" },
    { id: 8, time: "16:00", label: "4:00 PM" },
    { id: 9, time: "17:00", label: "5:00 PM" },
  ];

  const validateDate = (
    date: Date | string,
    allowToday: boolean = false
  ): boolean => {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (!isValid(parsedDate)) return false;
    const today = startOfDay(new Date());
    return allowToday
      ? !isBefore(parsedDate, today)
      : isBefore(today, parsedDate);
  };

  const validateTimeSlot = (timeSlot: string): boolean => {
    return (
      /^\d{2}:\d{2}$/.test(timeSlot) &&
      predefinedSlots.some((slot) => slot.time === timeSlot)
    );
  };

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const bookings = await getBookings(user.id, token);
          setBookings(bookings.data.bookings);
        }
      } catch (error) {
        console.log(error);
        toast.error("something wrong or You dont have any bookings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handlePostpone = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowPostponeDialog(true);
  };

  const handlePostponeConfirm = async (
    date: string,
    time: string,
    reason?: string
  ) => {
    if (!selectedBooking) return;

    const parsedDate = parse(date, "yyyy-MM-dd", new Date());
    const parsedTime = parse(
      `${date}T${time}`,
      "yyyy-MM-dd'T'HH:mm",
      new Date()
    );

    if (!validateDate(parsedDate) || !validateDate(parsedTime)) {
      toast.error("Postponed date or time is invalid or in the past.");
      return;
    }

    if (!validateTimeSlot(time)) {
      toast.error("Postponed time is invalid or outside predefined slots.");
      return;
    }

    try {
      const response = await postPoneBooking(
        date,
        time,
        reason!,
        selectedBooking.id,
        token
      );

      if (response.status === 200) {
        setBookings(
          bookings.map((booking) =>
            booking.id === selectedBooking.id
              ? {
                  ...booking,
                  date: parsedDate,
                  time: parsedTime,
                  status: "postponed",
                  postponeReason: reason || "Postponed by user",
                }
              : booking
          )
        );
        setShowPostponeDialog(false);
        setSelectedBooking(null);
        toast.success("Slot postponed successfully!");
      }
    } catch (error: unknown) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data.error ||
            "There is a problem in postponing your slot"
        );
      } else {
        toast.error("There is a problem in postponing your slot");
      }
    }
  };

  const onCancel = async () => {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <Loader />
      </div>
    );
  }
  return (
    <div>
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8 ">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span>Back</span>
          </button>
        </div>
        <UserBookingView
          bookings={bookings}
          onPostpone={handlePostpone}
          onCancel={onCancel}
          isAdvocate={isAdvocate}
        />
      </div>
      {ShowPostponeDialog && selectedBooking && (
        <PostponeDialog
          isOpen={ShowPostponeDialog}
          booking={selectedBooking}
          onClose={() => setShowPostponeDialog(false)}
          onPostpone={handlePostponeConfirm}
        />
      )}
    </div>
  );
};

export default Bookings;
