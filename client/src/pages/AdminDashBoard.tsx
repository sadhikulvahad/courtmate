import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  Shield,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { getAdminDashboardData } from "@/api/getAdminDashboard";
import { AdminDashboardData } from "@/types/Types";

const AdminDashboard = () => {
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboardData>();
  const pendingVerifications =
    adminDashboard?.advocates?.filter(
      (adv) => adv.isAdminVerified === "Pending"
    ) || [];

  const activeAdvocates =
    adminDashboard?.advocates?.filter((adv) => adv.isActive === true && adv.isAdminVerified === 'Accepted').length ||
    0;

  const totalAdvocates = adminDashboard?.advocates?.length || 0;

  const revenue = (adminDashboard?.totalBooking || 0) * 100;

  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getAdminDashboardData(user?.id);
        if (response?.status === 201) {
          setAdminDashboard(response.data.dashboardData);
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      }
    };
    fetchDashboard();
  }, []);

  const formatDate = (dateString : Date) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* <AdvocateAdminSidebar/> */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 text-lg">
                  Manage users, advocates, and platform operations
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {adminDashboard?.totalUser}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Advocates
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {activeAdvocates}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    of {totalAdvocates} total
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Verifications
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {pendingVerifications.length}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Requires attention
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Platform Revenue
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    ₹{revenue.toLocaleString()}
                  </p>
                  {/* <p className="text-sm text-green-600 mt-1">
                    +12% from last month
                  </p> */}
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Pending Verifications */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-yellow-500" />
                    Pending Advocate Verifications
                  </h2>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {pendingVerifications.length} pending
                  </span>
                </div>

                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {pendingVerifications.map((advocate) => (
                    <div key={advocate.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {advocate.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {advocate.category} • {advocate.experience}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>📧 {advocate.email}</div>
                            <div>📱 {advocate.phone}</div>
                            <div>🆔 {advocate.barCouncilRegisterNumber}</div>
                            <div>📅 {formatDate(advocate.verifiedAt)}</div>
                          </div>
                        </div>
                      </div>

                      {/* <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            handleVerification(advocate.id, "approve")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleVerification(advocate.id, "reject")
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div> */}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
