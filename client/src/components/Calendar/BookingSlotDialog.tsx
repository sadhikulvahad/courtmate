import { AdvocateProps, Slot } from "@/types/Types";
import {
  AlertTriangle,
  X,
  CreditCard,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";
import { format } from "date-fns";

interface bookingProps {
  bookingDetails: Slot;
  onClose: () => void;
  onProceedToPayment: () => void;
  advocate: AdvocateProps;
}

const BookingSlotDialog: React.FC<bookingProps> = ({
  bookingDetails,
  onClose,
  onProceedToPayment,
  advocate,
}) => {
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const handleStep1Continue = () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions to continue");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleProceedToPayment = () => {
    console.log('hey')
    onProceedToPayment()
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError("");
  };

  // Step 1: Terms and Conditions
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">
              Booking Terms & Conditions
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <CreditCard className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <h3 className="font-medium text-amber-800 mb-2">
                    Platform Fee: ₹100
                  </h3>
                  <ul className="text-amber-700 space-y-1">
                    <li>• This fee is required to confirm your booking</li>
                    <li>• Payment is processed securely through Stripe</li>
                    <li>• Fee is charged once per booking confirmation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm">
                  <h3 className="font-medium text-red-800 mb-2">
                    Important Cancellation Policy
                  </h3>
                  <div className="text-red-700 space-y-1">
                    <p>
                      • The ₹100 platform fee is <strong>non-refundable</strong>
                    </p>
                    <p>
                      • If you cancel this booking after payment, you will not
                      receive a refund of the platform fee
                    </p>
                    <p>
                      • Only the consultation fee (if applicable) may be
                      refunded as per advocate's policy
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <div className="text-sm text-gray-700">
                <h3 className="font-medium text-gray-800 mb-2">
                  What happens next?
                </h3>
                <ol className="list-decimal list-inside space-y-1">
                  <li>You'll be redirected to secure Stripe payment</li>
                  <li>
                    After successful payment, your booking will be confirmed
                  </li>
                  <li>You'll receive confirmation details via email/SMS</li>
                  <li>The advocate will be notified of your booking</li>
                </ol>
              </div>
            </div>

            <div className="flex items-start space-x-2 mb-4">
              <input
                type="checkbox"
                id="terms-agreement"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setError("");
                }}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms-agreement"
                className="text-sm text-gray-700"
              >
                I understand and agree to pay the ₹100 platform fee. I
                acknowledge that this fee is non-refundable and understand the
                cancellation policy.
              </label>
            </div>

            {error && (
              <div className="text-red-500 text-sm mb-4 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStep1Continue}
                disabled={!agreedToTerms}
                className={`px-4 py-2 rounded-md text-white flex items-center ${
                  agreedToTerms
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Continue to Payment
                <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Final Confirmation & Payment
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleBackToStep1}
              className="text-gray-400 hover:text-gray-500 mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Confirm & Pay</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Ready to Confirm Your Booking?
            </h3>
            <p className="text-gray-600 text-sm">
              You'll be redirected to Stripe for secure payment
            </p>
          </div>

          {bookingDetails && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="font-medium text-gray-800 mb-3">
                Booking Summary:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Advocate:</span>
                  <span className="font-medium">{advocate.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {format(
                      new Date(bookingDetails.date),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {format(new Date(bookingDetails.time), "h:mm a")}
                  </span>
                </div>
                {/* {bookingDetails.consultationType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{bookingDetails.consultationType}</span>
                  </div>
                )} */}
                <hr className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Platform Fee:</span>
                  <span className="text-blue-600">₹100</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <div className="flex items-center text-green-800 text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>
                Your payment is secured by Stripe's industry-leading security
              </span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleBackToStep1}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedToPayment}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium"
            >
              Pay ₹100 And Book Your Slot
              <CreditCard className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSlotDialog;
