import { useEffect, useState } from "react";
import { Phone, Calendar, Clock, ChevronLeft } from "lucide-react";
import NavBar from "@/components/ui/NavBar";
import { GetHostory } from "@/api/Booking"; // Fix typo if it's GetHistory
import { Booking } from "@/types/Types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const MyActivityPage = () => {
  const [callHistory, setCallHistory] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        setLoading(true);
        const response = await GetHostory();
        if (response.status === 200) {
          setCallHistory(response.data.data);
        } else {
          setError("Failed to fetch call history");
        }
      } catch (err) {
        console.error(err);
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCallHistory();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              My Activity
            </h1>
            <p className="text-gray-600 text-md">Track your call history</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Call History
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 text-lg">
                    Loading call history...
                  </p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <p className="text-red-500 text-lg">{error}</p>
                </div>
              ) : callHistory.length === 0 ? (
                <div className="p-8 text-center">
                  <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No calls found matching your criteria
                  </p>
                </div>
              ) : (
                callHistory.map((call) => (
                  <div
                    key={call.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {call.advocate.name}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>Video call / Chat</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(call.date), "dd MMM yyyy")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {format(new Date(call.time), "hh:mm a")}
                            </span>
                          </div>

                          {/* <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{call.status}</span>
                          </div> */}
                        </div>

                        {call.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {call.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyActivityPage;
