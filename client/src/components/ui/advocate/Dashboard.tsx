import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { completeProfile, profileUpdate } from "@/api/advocate/profileAPI";
import { CheckCircle } from "lucide-react";
import { formDataProps } from "@/types/Types";
import AdvocateDashboard from "./AdvocateDashboard";

const Dashboard = () => {
  const [isModal, setIsModal] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [formData, setFormData] = useState<formDataProps>({
    barCouncilNumber: "",
    yearsOfPractice: 0,
    age: "",
    typeOfAdvocate: "",
    category: "",
    practicingField: "",
    languages: "",
    street: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    onlineConsultation: false,
    profilePhoto: null,
    bciCertificate: null,
    bciCertificatePreview: "",
    termsAccepted: false,
  });
  const [step, setStep] = useState(1);
  const [previewImage, setPreviewImage] = useState("");

  const profilePhotoRef = useRef<HTMLInputElement>(null);
  const bciCertificateRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated, user, token } = useSelector(
    (state: RootState) => state.auth
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signup");
    }

    if (user?.role !== "advocate") {
      navigate("*");
    }

    const getDetails = async () => {
      try {
        const response = await completeProfile(user?.id, token);
        if (response?.status === 200) {
          if (!response?.data?.user?.barCouncilRegisterNumber) {
            setIsModal(true);
          }
          if (response?.data?.user?.isAdminVerified === "Pending") {
            setSubmitModal(true);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong..");
      }
    };
    getDetails();
  }, [isAuthenticated, navigate, token, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof formDataProps
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));

      // If you need a preview URL for images:
      if (field === "profilePhoto") {
        const previewUrl = URL.createObjectURL(file);
        // Store preview URL in separate state if needed
        setPreviewImage(previewUrl);
      }
    }
  };

  const handleStep1 = () => {
    if (
      !formData.barCouncilNumber ||
      !formData.yearsOfPractice ||
      !formData.age ||
      !formData.typeOfAdvocate ||
      !formData.category ||
      !formData.practicingField ||
      !formData.languages ||
      !formData.street ||
      !formData.city ||
      !formData.pincode ||
      !formData.state ||
      !formData.country
    ) {
      return toast.error("All fields are required");
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      return toast.error(
        "Please accept the Terms of Service and Privacy Policy"
      );
    }

    // Validate files exist and are proper File objects
    if (
      !(formData.bciCertificate instanceof File) ||
      !(formData.profilePhoto instanceof File)
    ) {
      return toast.error("Invalid file format - please select proper files");
    }

    if (!token) return toast.error("No token provided");

    // Preserve original File objects
    const id = user?.id;
    const form = new FormData();

    if (id) {
      form.append("id", id);
    }

    // Append files with original metadata
    form.append("profilePhoto", formData.profilePhoto as File);
    form.append("bciCertificate", formData.bciCertificate as File);

    // Append other fields
    form.append("barCouncilNumber", formData.barCouncilNumber);
    form.append("yearsOfPractice", String(formData.yearsOfPractice));
    form.append("age", formData.age);
    form.append("typeOfAdvocate", formData.typeOfAdvocate);
    form.append("category", formData.category);
    form.append("practicingField", formData.practicingField);
    form.append("languages", formData.languages);
    form.append("street", formData.street);
    form.append("city", formData.city);
    form.append("state", formData.state);
    form.append("country", formData.country);
    form.append("pincode", formData.pincode);
    form.append("onlineConsultation", String(formData.onlineConsultation));

    try {
      const response = await profileUpdate(form, token);
      if (response?.status === 200) {
        setIsModal(false);
        setSubmitModal(true);
        toast.success(response?.data?.message);
      } else {
        toast.error(response?.data?.error || "Update failed");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to update profile");
    }
  };

  const renderCertificatePreview = () => {
    if (!formData.bciCertificate) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <span className="text-gray-400">No certificate</span>
        </div>
      );
    }

    if (formData.bciCertificate.type.startsWith("image/")) {
      return (
        <img
          src={formData.bciCertificatePreview}
          alt="Certificate Preview"
          className="w-full h-full object-cover"
        />
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-2">
        <svg
          className="w-12 h-12 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm text-gray-600">PDF Document</span>
        <a
          href={formData.bciCertificatePreview}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 text-xs mt-1"
        >
          View PDF
        </a>
      </div>
    );
  };

  return (
    <>
    <AdvocateDashboard />
      {submitModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your request has been sent for verification. You will be informed
              once your account has been verified.
            </p>
          </div>
        </div>
      )}

      {isModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                Professional Information:
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bar Council Registration Number
                        </label>
                        <input
                          type="text"
                          name="barCouncilNumber"
                          value={formData.barCouncilNumber}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Years of Practice
                        </label>
                        <input
                          type="number"
                          name="yearsOfPractice"
                          value={formData.yearsOfPractice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type of Advocate
                        </label>
                        <select
                          name="typeOfAdvocate"
                          value={formData.typeOfAdvocate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select type</option>
                          <option value="senior">Senior Advocate</option>
                          <option value="junior">Junior Advocate</option>
                          <option value="independent">
                            Independent Advocate
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select category</option>
                          <option value="civil">Civil</option>
                          <option value="criminal">Criminal</option>
                          <option value="corporate">Corporate</option>
                          <option value="family">Family</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Practicing Field
                        </label>
                        <select
                          name="practicingField"
                          value={formData.practicingField}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select field</option>
                          <option value="constitutional">
                            Constitutional Law
                          </option>
                          <option value="criminal">Criminal Law</option>
                          <option value="corporate">Corporate Law</option>
                          <option value="family">Family Law</option>
                          <option value="property">Property Law</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Languages
                        </label>
                        <input
                          type="text"
                          name="languages"
                          value={formData.languages}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., English, Hindi, Tamil"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Office Address
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            name="street"
                            placeholder="Street"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="onlineConsultation"
                          checked={formData.onlineConsultation}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Online Consultation Available
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        type="button"
                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        onClick={handleStep1}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2 content - corrected structure */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Profile Photo Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg shadow-md overflow-hidden relative">
                          {formData.profilePhoto ? (
                            <img
                              src={previewImage}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <span className="text-gray-400">No photo</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={profilePhotoRef}
                          onChange={(e) => handleFileChange(e, "profilePhoto")}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => profilePhotoRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                          Select Your Profile Photo
                        </button>
                      </div>

                      {/* BCI Certificate Upload */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg shadow-md overflow-hidden relative">
                          {renderCertificatePreview()}
                        </div>
                        <input
                          type="file"
                          ref={bciCertificateRef}
                          onChange={(e) =>
                            handleFileChange(e, "bciCertificate")
                          }
                          accept="image/*,.pdf"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => bciCertificateRef.current?.click()}
                          className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                        >
                          Upload Your BCI Certificate
                        </button>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="flex items-center space-x-2 mt-6">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.termsAccepted}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            termsAccepted: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700">
                        I agree to the Terms of Service and Privacy Policy
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-between mt-6">
                      <button
                        type="button"
                        className="px-6 py-2 text-black hover:bg-gray-300 bg-gray-200 rounded-md"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2 bg-green-500 text-white rounded-md transition-colors ${
                          !formData.termsAccepted
                            ? "cursor-not-allowed opacity-75"
                            : "hover:bg-green-600"
                        }`}
                        disabled={!formData.termsAccepted}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
