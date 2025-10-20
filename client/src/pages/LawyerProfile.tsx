import { findUser, updateUser } from "@/api/user/userApi";
import { RootState } from "@/redux/store";
import { AdvocateProps } from "@/types/Types";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  FileText,
  Globe,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
} from "lucide-react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { generateSignedUrl } from "@/utils/getSignUrl";

export default function LawyerProfile() {
  const [advocate, setAdvocate] = useState<AdvocateProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AdvocateProps>>({});
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(
    null
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await findUser(user?.id as string);
      if (response.status === 200) {
        const userData = response.data.user;
        console.log(userData);
        // Fix languages if needed
        let languages = userData.languages;
        if (typeof languages === "string") {
          try {
            languages = JSON.parse(languages);
          } catch {
            languages = []; // fallback
          }
        } else if (Array.isArray(languages)) {
          // Check if it's an array with a single stringified JSON string
          try {
            if (
              languages.length === 1 &&
              typeof languages[0] === "string" &&
              languages[0].includes("[")
            ) {
              languages = JSON.parse(languages[0]);
            }
          } catch {
            languages = []; // fallback
          }
        }

        // Ensure address structure is consistent
        const defaultAddress = {
          street: "",
          city: "",
          state: "",
          country: "",
          pincode: "",
        };

        const address = userData.address || defaultAddress;

        let photoUrl = "";
        if (userData.profilePhoto) {
          try {
            photoUrl = await generateSignedUrl(userData.profilePhoto);
          } catch (err) {
            console.error("Error generating signed URL", err);
          }
        }

        const finalUser = {
          ...userData,
          languages,
          address: {
            ...defaultAddress,
            ...address,
          },
          imageUrl: photoUrl,
        };

        setAdvocate(finalUser);
        setFormData(finalUser);
      } else {
        toast.error(response.data.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user?.id]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function safelyParseLanguages(input: string | string[] | unknown): string[] {
    try {
      if (typeof input === "string") {
        // If it's a JSON string, parse it
        if (input.startsWith("[") || input.startsWith('"')) {
          input = JSON.parse(input);
        } else {
          // If it's a comma-separated string
          return input
            .split(",")
            .map((lang) => lang.trim())
            .filter((lang) => lang !== "");
        }
      }

      if (Array.isArray(input)) {
        return input
          .map((item) =>
            typeof item === "string"
              ? item.trim().replace(/^"|"$/g, "")
              : String(item)
          )
          .filter((item) => item !== "");
      }
    } catch (error) {
      console.warn("Failed to parse languages:", error);
    }
    return [];
  }

  const handleEditClick = () => {
    setIsEditing(true);
    const advocateData = JSON.parse(JSON.stringify(advocate || {}));

    advocateData.languages = safelyParseLanguages(advocateData.languages);

    setFormData(advocateData);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfilePhotoPreview(null);
    setProfilePhotoFile(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const addressField = name.replace(
      "address.",
      ""
    ) as keyof AdvocateProps["address"];

    setFormData((prev) => ({
      ...prev,
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        ...(prev.address || {}),
        [addressField]: value,
      },
    }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only split if there's actual content
    const languages = value
      ? value
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang !== "")
      : [];
    setFormData((prev) => ({
      ...prev,
      languages,
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "profile" | "certificate"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fileType === "profile") {
        setProfilePhotoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setProfilePhotoPreview(previewUrl);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = new FormData();

      // Prepare complete form data with all fields
      const dataToSubmit = {
        ...formData,
        languages: formData.languages ? formData.languages : [],
        address: {
          street: formData.address?.street || "",
          city: formData.address?.city || "",
          state: formData.address?.state || "",
          country: formData.address?.country || "",
          pincode: formData.address?.pincode || "",
        },
      };
      if (!isValidPhoneNumber(dataToSubmit.phone!)) {
        return toast.error("Please enter a valid mobile number");
      }
      // Append all form fields
      Object.entries(dataToSubmit).forEach(([key, value]) => {
        if (key === "languages") {
          // Send languages as comma-separated string
          submitData.append("languages", (value as string[]).join(", "));
        } else if (key === "address") {
          // Append each address field as top-level keys
          Object.entries(value).forEach(([subKey, subValue]) => {
            submitData.append(subKey, String(subValue || ""));
          });
        } else if (key === "experience") {
          submitData.append("yearsOfPractice", String(value || ""));
          submitData.append("experience", String(value || ""));
        } else if (value !== null && value !== undefined) {
          submitData.append(key, String(value));
        }
      });

      // Append profile photo if changed
      if (profilePhotoFile) {
        submitData.append("profilePhoto", profilePhotoFile);
      }

      const response = await updateUser(submitData);

      if (response?.status === 200) {
        // Process user data to ensure correct formats
        const userData = response.data.userData;

        // Fix languages in response
        if (userData.languages) {
          userData.languages = safelyParseLanguages(userData.languages);
        } else {
          userData.languages = [];
        }

        // Fix address in response
        if (userData.address && typeof userData.address === "string") {
          try {
            userData.address = JSON.parse(userData.address);
          } catch {
            userData.address = {
              street: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            };
          }
        }

        setAdvocate(userData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
      } else {
        toast.error(response?.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating the profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!advocate) {
    return (
      <div className="w-full p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Failed to load profile
        </h3>
        <p className="text-gray-600">Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!isEditing ? (
          // 👉 PROFESSIONAL VIEW MODE
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src={
                        advocate?.profilePhoto
                          ? `${advocate.imageUrl}`
                          : "/default-profile.jpg"
                      }
                      alt="Lawyer photo"
                      className="w-32 h-40 rounded-xl object-cover ring-4 ring-white shadow-lg"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        {advocate?.name}
                      </h1>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {advocate?.category}
                        </span>
                        {advocate?.typeOfLawyer && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {advocate?.typeOfLawyer}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-xs text-gray-500">
                            User ID:
                          </span>
                          <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md text-gray-700">
                            {advocate?.userId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <button
                        className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                        onClick={() => setShowDropdown((prev) => !prev)}
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                      {showDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                          <button
                            onClick={() => {
                              handleEditClick();
                              setShowDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                          >
                            <FileText className="w-4 h-4 mr-3" />
                            Edit Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{advocate?.experience} Years Experience</span>
                    </div>
                    {advocate?.age && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{advocate?.age} Years</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {advocate?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {advocate?.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {[
                      advocate.address.street,
                      advocate.address.city,
                      advocate.address.state,
                      advocate.address.pincode,
                      advocate.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No address"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-8 pb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bio Section */}
                <div className="lg:col-span-2">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Professional Bio
                    </h2>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {advocate?.bio || (
                        <span className="text-gray-500 italic">
                          Bio not provided. Click edit to update your profile.
                        </span>
                      )}
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-900">
                          Bar Council: {advocate?.barCouncilRegisterNumber}
                        </span>
                      </div>
                      {advocate?.practicingField && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            Practice Area: {advocate?.practicingField}
                          </span>
                        </div>
                      )}
                      {advocate?.typeOfAdvocate && (
                        <div className="flex items-center gap-3 text-sm">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            Type: {advocate?.typeOfAdvocate}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <span className="font-semibold text-gray-900">
                          Certifications: {advocate?.certification || "None"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Languages & DOB */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {advocate?.languages &&
                        Array.isArray(advocate.languages) &&
                        advocate.languages.length > 0 ? (
                          advocate.languages.map((lang, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </div>
                    </div>
                    {advocate?.DOB && (
                      <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Date of Birth
                        </h3>
                        <p className="text-gray-600">
                          {new Date(advocate.DOB).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Services Sidebar */}
                <div>
                  <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Services Offered
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {advocate?.onlineConsultation
                            ? "Online Consultations"
                            : "In-Person Consultations"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // 👉 PROFESSIONAL EDIT MODE
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Professional Profile
              </h1>
              <p className="text-gray-600 mt-1">Update your information</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Photo */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <div className="w-32 h-40 mx-auto mb-4 relative">
                      <img
                        src={
                          profilePhotoPreview ||
                          (advocate?.profilePhoto
                            ? `${advocate.imageUrl}`
                            : "/default-profile.jpg")
                        }
                        alt="Profile Preview"
                        className="w-full h-full rounded-xl object-cover ring-4 ring-gray-100 shadow-md"
                      />
                    </div>
                    <label className="inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <FileText className="w-4 h-4 mr-2" />
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "profile")}
                      />
                    </label>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="lg:col-span-3 space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ""}
                        disabled={true}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        disabled={true}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone *
                      </label>
                      <PhoneInput
                        name="phone"
                        value={formData.phone || ""}
                        onChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            phone: value,
                          }));
                        }}
                        className="w-full"
                        inputClassName="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="DOB"
                        value={
                          formData.DOB
                            ? new Date(formData.DOB).toISOString().substr(0, 10)
                            : ""
                        }
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type of Lawyer
                      </label>
                      <input
                        type="text"
                        name="typeOfLawyer"
                        value={formData.typeOfLawyer || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience || ""}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Languages (comma separated)
                      </label>
                      <input
                        type="text"
                        name="languages"
                        value={
                          formData.languages &&
                          Array.isArray(formData.languages)
                            ? formData.languages.join(", ")
                            : ""
                        }
                        onChange={handleLanguageChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="English, Hindi, Tamil"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">
                  Address Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address?.pincode || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address?.country || ""}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-6">
                  Professional Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bar Council Registration No. *
                    </label>
                    <input
                      type="text"
                      name="barCouncilRegisterNumber"
                      value={formData.barCouncilRegisterNumber || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bar Council India
                    </label>
                    <input
                      type="text"
                      name="barCouncilIndia"
                      value={formData.barCouncilIndia || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Certifications
                    </label>
                    <input
                      type="text"
                      name="certification"
                      value={formData.certification || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Practicing Field
                    </label>
                    <input
                      type="text"
                      name="practicingField"
                      value={formData.practicingField || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Professional Bio *
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={formData.bio || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Tell potential clients about your expertise and experience..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="onlineConsultation"
                        name="onlineConsultation"
                        checked={formData.onlineConsultation || false}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        Offers Online Consultation
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
