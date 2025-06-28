import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Star,
  Bell,
  //   Users,
  BookOpen,
  // TrendingUp,
  //   CheckCircle,
  //   AlertCircle,
  MessageCircle,
  // Phone,
  Video,
  FileText,
  //   User,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { getAdvocateDashboardData } from "@/api/getAdvocateDashboardData";
import {
  Booking,
  CaseProps,
  DashboardData,
  Notification,
  Review,
} from "@/types/Types";

const AdvocateDashboard: React.FC = () => {
  const [dashBoardData, setDashboardData] = useState<DashboardData>();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getAdvocateDashboardData(token, user?.id);
        console.log(response);
        if (response?.status === 201) {
          setDashboardData(response.data.dashboardData);
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    };
    fetchDashboardData();
  }, []);

  const findAverageRating = (reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return parseFloat((total / reviews.length).toFixed(1));
  };

  const upcomingSessions = (bookings: Booking[]): Booking[] => {
    const now = new Date();

    const upcoming = bookings
      .filter((booking) => {
        if (booking.status !== "confirmed") return false;

        const dateTime = new Date(booking.date);
        const time = new Date(booking.time);

        dateTime.setHours(time.getHours());
        dateTime.setMinutes(time.getMinutes());
        dateTime.setSeconds(0);
        dateTime.setMilliseconds(0);

        return dateTime > now;
      })
      .sort((a, b) => {
        const aDateTime = new Date(a.date);
        const bDateTime = new Date(b.date);

        aDateTime.setHours(
          new Date(a.time).getHours(),
          new Date(a.time).getMinutes()
        );
        bDateTime.setHours(
          new Date(b.time).getHours(),
          new Date(b.time).getMinutes()
        );

        return aDateTime.getTime() - bDateTime.getTime(); // ascending
      })
      .slice(0, 3); // take top 3

    return upcoming;
  };

  const upcomingCases = (cases: CaseProps[]): CaseProps[] => {
    const now = new Date();

    return cases
      .filter((c) => new Date(c.nextHearingDate) > now) // future cases only
      .sort(
        (a, b) =>
          new Date(a.nextHearingDate).getTime() -
          new Date(b.nextHearingDate).getTime()
      ) // soonest first
      .slice(0, 3); // top 3
  };

  const recentNotification = (
    notifications: Notification[]
  ): Notification[] => {
    return notifications
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) // newest first
      .slice(0, 3);
  };

  const latestReviews = (reviews: Review[]): Review[] => {
    return reviews
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3); // get top 3 recent reviews
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "hearing":
        return "text-red-600 bg-red-100";
      case "mediation":
        return "text-blue-600 bg-blue-100";
      case "filing":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="w-4 h-4" />;
      case "review":
        return <Star className="w-4 h-4" />;
      case "case":
        return <FileText className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        {/* <h2>DashBoard</h2> */}
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashBoardData?.totalBooking.length}
                </p>
                {/* <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p> */}
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Available Slots
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashBoardData?.availableSlots.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">This week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Rating
                </p>
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {findAverageRating(dashBoardData?.reviews || [])}
                  </p>
                  <div className="flex ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <
                          Math.floor(
                            findAverageRating(dashBoardData?.reviews || [])
                          )
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {dashBoardData?.reviews?.length} reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">All Cases</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashBoardData?.cases.length}
                </p>
                {/* <p className="text-sm text-gray-500 mt-1">
                  {mockData.metrics.completedCases} completed
                </p> */}
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Upcoming Sessions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingSessions(dashBoardData?.totalBooking || []).map(
                    (session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Video className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {session.isAvailable}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {session.notes}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {new Date(session.time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              session.status
                            )}`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Cases */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Upcoming Cases
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingCases(dashBoardData?.cases || []).map((case_) => (
                    <div
                      key={case_._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${getPriorityColor(
                            case_.priority
                          )}`}
                          style={{ backgroundColor: "currentColor" }}
                        > </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {case_.title}
                          </h3>
                          <p>
                            {case_.caseType} case
                          </p>
                          <p>
                            {case_.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {case_.hearingHistory?.[
                            case_.hearingHistory.length - 1
                          ] || "No hearings yet"}
                        </p>
                        <p className="text-sm text-gray-500">
                          Next:{" "}
                          {new Date(case_.nextHearingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-600" />
                  Notifications
                  <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                    {dashBoardData?.notifications.filter((n) => n.read).length}
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentNotification(dashBoardData?.notifications || []).map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg ${
                          !notification.read ? "bg-blue-50" : "bg-gray-50"
                        } hover:bg-gray-100 transition-colors`}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            !notification.read ? "bg-blue-100" : "bg-gray-200"
                          }`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm ${
                              !notification.read
                                ? "font-medium text-gray-900"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-green-600" />
                  Recent Reviews
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {latestReviews(dashBoardData?.reviews || []).map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">
                          {review.userId.name}
                        </h3>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {review.review}
                      </p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateDashboard;
