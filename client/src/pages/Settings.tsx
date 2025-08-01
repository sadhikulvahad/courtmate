import { useState, useEffect, useMemo } from "react";
import {
  ChevronRight,
  Search,
  Moon,
  Sun,
  BadgeDollarSign,
  Phone,
  ChevronLeft,
  ChevronRight as ChevronRightPagination,
} from "lucide-react";
import {
  createSubscription,
  getAllSubscription,
  getSubscription,
} from "@/api/subscriptionApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { Booking } from "@/types/Types";
import { GetHostory } from "@/api/booking";

// TypeScript Interfaces
interface Subscription {
  _id?: string;
  advocateId: string;
  plan: "basic" | "professional" | "enterprise";
  price: number;
  billingCycle: "monthly" | "yearly";
  nextBillingDate: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Plan {
  _id: string;
  plan: "basic" | "professional" | "enterprise";
  price: number;
  billingCycle: "monthly" | "yearly";
  features: string[];
}

interface UsageStats {
  caseSearches: number;
  documentsGenerated: number;
  aiConsultations: number;
}

const AdvocateSettings = () => {
  const [activeSection, setActiveSection] = useState<
    "subscription" | "callHistory"
  >("subscription");
  const [callHistory, setCallHistory] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState({
    subscription: true,
    plans: true,
    callHistory: true,
  });
  const [error, setError] = useState("");
  const { user, token } = useSelector((state: RootState) => state.auth);

  // Subscription state
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [usageStats] = useState<UsageStats>({
    caseSearches: 247,
    documentsGenerated: 89,
    aiConsultations: 12,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of bookings per page

  const menuItems = [
    { _id: "subscription", label: "Subscription", icon: BadgeDollarSign },
    { _id: "callHistory", label: "Call History", icon: Phone },
  ];

  const userId = useMemo(() => user?.id, [user]);
  // Load call history
  useEffect(() => {
    const getHistory = async () => {
      if (!userId || !token) {
        setError("User not authenticated");
        setLoading((prev) => ({ ...prev, callHistory: false }));
        return;
      }

      try {
        const response = await GetHostory(token);
        if (response?.status === 200) {
          setCallHistory(response.data.data);
        } else {
          setError("Failed to load call history");
        }
      } catch (err) {
        setError("Failed to load call history");
        console.error("Error loading call history:", err);
      } finally {
        setLoading((prev) => ({ ...prev, callHistory: false }));
      }
    };
    getHistory();
  }, [userId, token]);

  // Load subscription data
  useEffect(() => {
    const loadSubscriptionData = async () => {
      if (!userId || !token) {
        setError("User not authenticated");
        setLoading({ subscription: false, plans: false, callHistory: false });
        return;
      }

      try {
        // Load current subscription
        const subscription = await getSubscription(userId, token);
        if (subscription?.status === 200) {
          setCurrentSubscription(subscription.data);
        } else if (subscription?.status === 404) {
          setCurrentSubscription(null);
        } else {
          setError("Failed to load subscription");
        }
      } catch (err) {
        setError("Failed to load subscription data");
        console.error("Error loading subscription:", err);
      } finally {
        setLoading((prev) => ({ ...prev, subscription: false }));
      }

      try {
        // Load available plans
        const plans = await getAllSubscription(token);
        if (plans?.status === 200) {
          setAvailablePlans(plans.data);
        } else {
          setError("Failed to load available plans");
        }
      } catch (err) {
        setError("Failed to load available plans");
        console.error("Error loading plans:", err);
      } finally {
        setLoading((prev) => ({ ...prev, plans: false }));
      }
    };
    loadSubscriptionData();
  }, [userId, token]);

  // Handle plan change
  const handlePlanChange = async (
    plan: "basic" | "professional" | "enterprise",
    price: number,
    billingCycle: "monthly" | "yearly" = "monthly"
  ) => {
    if (!userId || !token) {
      setError("User not authenticated");
      return;
    }

    if (currentSubscription) {
      toast.error("You already have a subscription");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, subscription: true }));
      const subscriptionData = {
        advocateId: userId,
        plan,
        price,
        billingCycle,
        nextBillingDate: new Date(
          Date.now() +
            (billingCycle === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
        ).toISOString(),
      };

      const result = await createSubscription(subscriptionData, token);
      const { url } = result.data;

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (err) {
      setError("Failed to initiate payment. Please try again.");
      console.error("Error initiating payment:", err);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, subscription: false }));
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = callHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(callHistory.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );

  const renderContent = () => {
    if (loading.subscription || loading.plans || loading.callHistory) {
      return <LoadingSpinner />;
    }

    if (!userId || !token) {
      return <ErrorMessage message="Please log in to view settings" />;
    }

    switch (activeSection) {
      case "subscription":
        return (
          <div>
            <h1 className="text-2xl font-normal text-gray-900 mb-6">
              Subscription
            </h1>
            {error && <ErrorMessage message={error} />}
            {/* Current Plan */}
            {currentSubscription ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Current Plan
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-medium text-gray-900">
                      {currentSubscription.plan.charAt(0).toUpperCase() +
                        currentSubscription.plan.slice(1)}{" "}
                      Plan
                    </h3>
                    <p className="text-sm text-gray-600">
                      Full access to all legal research tools
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{currentSubscription.price}
                    </p>
                    <p className="text-sm text-gray-600">
                      per {currentSubscription.billingCycle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Next billing date:{" "}
                      {new Date(
                        currentSubscription.nextBillingDate
                      ).toLocaleDateString()}
                    </p>
                    {/* <p className="text-sm text-green-600">
                      ✓ Auto-renewal enabled
                    </p> */}
                  </div>
                  {/* <div className="space-x-3">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      onClick={() => setActiveSection("subscription")}
                    >
                      Change Plan
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      onClick={() => toast("Billing management coming soon!")}
                    >
                      Manage Billing
                    </button>
                  </div> */}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <p className="text-sm text-gray-600">
                  No active subscription. Choose a plan below.
                </p>
              </div>
            )}
            {/* Usage Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Usage This Month
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {usageStats.caseSearches}
                  </p>
                  <p className="text-sm text-gray-600">Case searches</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (usageStats.caseSearches / 500) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {usageStats.documentsGenerated}
                  </p>
                  <p className="text-sm text-gray-600">Documents generated</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (usageStats.documentsGenerated / 200) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {usageStats.aiConsultations}
                  </p>
                  <p className="text-sm text-gray-600">AI consultations</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (usageStats.aiConsultations / 50) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Available Plans */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Available Plans
              </h2>
              {availablePlans.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No plans available at the moment.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availablePlans.map((plan) => (
                    <div
                      key={plan._id}
                      className={`border rounded-lg p-4 ${
                        plan.plan === currentSubscription?.plan
                          ? "border-2 border-blue-600 relative"
                          : "border-gray-200"
                      }`}
                    >
                      {plan.plan === currentSubscription?.plan && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Current Plan
                        </div>
                      )}
                      <h3 className="font-medium text-gray-900">
                        {plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)}
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        ₹{plan.price}
                        <span className="text-sm font-normal text-gray-600">
                          /{plan.billingCycle}
                        </span>
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-600">
                        {plan.features?.length ? (
                          plan.features.map((feature, index) => (
                            <li key={index}>• {feature}</li>
                          ))
                        ) : (
                          <li>• No features listed</li>
                        )}
                      </ul>
                      <div className="mt-4">
                        <select
                          className="w-full mb-2 p-2 border border-gray-200 rounded-lg text-sm"
                          value={plan.billingCycle}
                          onChange={(e) =>
                            handlePlanChange(
                              plan.plan,
                              plan.price,
                              e.target.value as "monthly" | "yearly"
                            )
                          }
                          disabled={
                            loading.subscription ||
                            plan.plan === currentSubscription?.plan
                          }
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                        <button
                          className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
                            plan.plan === currentSubscription?.plan
                              ? "text-white bg-blue-600 cursor-not-allowed opacity-50"
                              : "text-white bg-blue-600 hover:bg-blue-700"
                          }`}
                          onClick={() =>
                            handlePlanChange(
                              plan.plan,
                              plan.price,
                              plan.billingCycle
                            )
                          }
                          disabled={
                            loading.subscription ||
                            plan.plan === currentSubscription?.plan
                          }
                        >
                          {plan.plan === currentSubscription?.plan
                            ? "Current Plan"
                            : loading.subscription
                            ? "Processing..."
                            : "Select Plan"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case "callHistory":
        return (
          <div>
            <h1 className="text-2xl font-normal text-gray-900 mb-6">
              Call History
            </h1>
            {error && <ErrorMessage message={error} />}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {callHistory.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No call history available.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Advocate
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Notes
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Postpone Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((booking) => (
                          <tr
                            key={booking.id}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              {new Date(booking.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              {new Date(booking.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4">
                              {booking.advocate.name} ({booking.advocate.email})
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : booking.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {booking.notes || "-"}
                            </td>
                            <td className="px-6 py-4">
                              {booking.postponeReason || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                      Showing {indexOfFirstItem + 1} to{" "}
                      {Math.min(indexOfLastItem, callHistory.length)} of{" "}
                      {callHistory.length} entries
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg ${
                          currentPage === 1
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg ${
                          currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <ChevronRightPagination className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex">
      {/* Sidebar - Left side */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search settings"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item._id}
                onClick={() =>
                  setActiveSection(item._id as "subscription" | "callHistory")
                }
                className={`inline-flex items-center w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                  activeSection === item._id
                    ? "bg-blue-50 border-r-2 border-blue-600 text-blue-600"
                    : "text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{item.label}</span>
                {activeSection === item._id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle for dark/light mode */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-full"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 mr-2" />
            ) : (
              <Moon className="w-4 h-4 mr-2" />
            )}
            {darkMode ? "Light mode" : "Dark Mode"}
          </button>
        </div>
      </div>

      {/* Main content area - Right side */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdvocateSettings;
