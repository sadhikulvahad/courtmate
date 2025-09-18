import { useEffect, useState } from "react";
import {
  Wallet,
  RefreshCw,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/ui/NavBar";
import { Transaction, WalletData } from "@/types/Types";
import { GetWallet } from "@/api/wallet";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const WalletComponent = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  // Mock data - replace with real data from your API
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    currency: "INR",
    refunds: [],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: walletData.currency || "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await GetWallet(user!.id);

        setWalletData(response.data.wallet.wallet);
        setTransactions(response.data.wallet.transactions);
      } catch (error) {
        console.error("Failed to fetch wallet data", error);
      }
    };

    fetchWalletData();
  }, []);

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-600">
                Refunds from cancelled bookings
              </p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 mb-2">Available Balance</p>
                <h2 className="text-3xl font-bold">
                  {formatCurrency(walletData.balance)}
                </h2>
                <p className="text-sm text-blue-200 mt-2">
                  From {walletData?.refunds?.length} cancelled bookings
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-full">
                <RefreshCw className="w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Refund History */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Refund History</h3>
              <p className="text-sm text-gray-600">
                All refunds from cancelled advocate bookings
              </p>
            </div>

            {transactions.length > 0 ? (
              <div className="divide-y">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{tx.description || tx.type}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                    <div
                      className={`font-semibold text-lg ${
                        tx.type === "credit" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                No transactions yet
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="mt-6 bg-white rounded-xl p-4 shadow-sm border">
            <h3 className="font-medium text-gray-900 mb-3">
              Using Your Wallet Balance
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  Your wallet balance can be used to pay for future advocate
                  bookings
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  During checkout, your wallet balance will be automatically
                  applied
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
                <p className="text-sm text-gray-600">
                  If your booking costs more than your balance, you can pay the
                  difference
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WalletComponent;
