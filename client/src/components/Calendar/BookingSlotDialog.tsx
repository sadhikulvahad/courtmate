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
  bookingType: "followup" | "new" | "";
  setPaymentMethod: React.Dispatch<
    React.SetStateAction<"wallet" | "stripe" | "">
  >;
  paymentMethod: "wallet" | "stripe" | "";
  setBookingType: React.Dispatch<React.SetStateAction<"followup" | "new" | "">>;
  caseId: string;
  setCaseId: React.Dispatch<React.SetStateAction<string>>;
}

const BookingSlotDialog: React.FC<bookingProps> = ({
  bookingDetails,
  onClose,
  onProceedToPayment,
  advocate,
  setPaymentMethod,
  paymentMethod,
  setBookingType,
  bookingType,
  caseId,
  setCaseId,
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
    onProceedToPayment();
  };

  // Step 1: Terms and Conditions
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
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
                      • The ₹100 platform fee is <strong>refundable</strong>
                    </p>
                    <p>
                      • If you cancel this booking, you must do so at least 3
                      hours before the consultation to be eligible for a refund
                      of the platform fee
                    </p>
                    <p>
                      • Only the consultation fee (if applicable) may be
                      refunded as per advocate's policy
                    </p>
                    <p>• Any refunded amount will be credited to your wallet</p>
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
                acknowledge that this fee is refundable only if I cancel at
                least 3 hours before the consultation, as per the cancellation
                policy.
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

  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setStep(step - 1)}
                className="text-gray-400 hover:text-gray-500 mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-medium text-gray-900">
                Choose Booking Type
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Follow-up Booking Option */}
            <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bookingType"
                  value="followup"
                  checked={bookingType === "followup"}
                  onChange={(e) => setBookingType(e.target.value as "followup")}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    Follow-up Booking
                  </h3>
                  <p className="text-sm text-gray-600">
                    You already have a case with this advocate. Enter your case
                    ID below.
                  </p>
                  {bookingType === "followup" && (
                    <input
                      type="text"
                      placeholder="Enter Case ID"
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                      className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </label>
            </div>

            {/* New Booking Option */}
            <div className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer">
              <label className="flex items-start gap-3">
                <input
                  type="radio"
                  name="bookingType"
                  value="new"
                  checked={bookingType === "new"}
                  onChange={(e) => setBookingType(e.target.value as "new")}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <h3 className="font-medium text-gray-900">New Booking</h3>
                  <p className="text-sm text-gray-600">
                    You don’t have an existing case. Continue to create a new
                    case with this advocate.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!bookingType}
              onClick={() => {
                if (bookingType === "followup" && !caseId) {
                  setError("Please enter your Case ID.");
                  return;
                }
                if (bookingType === "new") {
                  setStep(3); // Go to next step for new booking
                } else {
                  setStep(4); // Skip to payment for follow-up
                }
              }}
              className={`px-6 py-2 rounded-md flex items-center font-medium text-white ${
                bookingType
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => setStep(step - 1)}
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

        {/* Body */}
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Ready to Confirm Your Booking?
            </h3>
            <p className="text-gray-600 text-sm">
              Choose your preferred payment method
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
                <hr className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Platform Fee:</span>
                  <span className="text-blue-600">₹100</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-800 mb-2">Payment Method</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value as "wallet")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pay from Wallet</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => setPaymentMethod(e.target.value as "stripe")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Pay via Stripe</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!paymentMethod}
              onClick={() => handleProceedToPayment()}
              className={`px-6 py-2 rounded-md flex items-center font-medium text-white ${
                paymentMethod
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {paymentMethod === "wallet"
                ? "Pay with Wallet"
                : paymentMethod === "stripe"
                ? "Pay with Stripe"
                : "Select Payment"}
              <CreditCard className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSlotDialog;
