import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// ✅ Moved these components OUTSIDE main component
const SuccessPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
    <div className="max-w-2xl w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 text-lg">
            Your consultation has been confirmed
          </p>
        </div>

        {/* Next Steps */}
        {/* <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What's Next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Confirmation Email</p>
                <p className="text-gray-600 text-sm">
                  Check your email for detailed booking information and meeting link
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Calendar Reminder</p>
                <p className="text-gray-600 text-sm">
                  Add this appointment to your calendar so you don't miss it
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Prepare Documents</p>
                <p className="text-gray-600 text-sm">
                  Gather any relevant documents for your consultation
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        {/* <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Add to Calendar</span>
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Download Receipt</span>
          </button>
        </div> */}
      </div>

      {/* Support Info */}
      {/* <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600 mb-3">Need help or want to reschedule?</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
            <Phone className="w-4 h-4" />
            <span>Call Support</span>
          </button>
          <button className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
            <Mail className="w-4 h-4" />
            <span>Email Us</span>
          </button>
        </div>
      </div> */}
    </div>
  </div>
);

const CancelPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <div className="max-w-2xl w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600 text-lg">
            Your booking was not completed
          </p>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">
                What happened?
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                Your payment was cancelled and no charges were made to your
                account. Your consultation slot has not been reserved.
              </p>
              <p className="text-yellow-700 text-sm">
                If this was unintentional, you can try booking again or contact
                our support team for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Try Payment Again</span>
          </button>
          <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
            <ArrowLeft className="w-5 h-5" />
            <span>Choose Different Slot</span>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PaymentPages = () => {
  const { status } = useParams<{ status: string }>();
  const [currentPage, setCurrentPage] = useState<string | undefined>();
  const navigate = useNavigate();
  useEffect(() => {
    setCurrentPage(status);
  }, [status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/bookings");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return currentPage === "success" ? <SuccessPage /> : <CancelPage />;
};

export default PaymentPages;
