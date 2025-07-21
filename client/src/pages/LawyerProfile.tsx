import { findUser, updateUser } from "@/api/user/userApi";
import { RootState } from "@/redux/store";
import { AdvocateProps } from "@/types/Types";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { MoreVertical } from "lucide-react";

export default function LawyerProfile() {
  const [advocate, setAdvocate] = useState<AdvocateProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);
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
      const response = await findUser(user?.id as string, token);
      if (response.status === 200) {
        const userData = response.data.user;

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

        const finalUser = {
          ...userData,
          languages,
          address: {
            ...defaultAddress,
            ...address,
          },
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
  }, [user?.id, token]);

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

      const response = await updateUser(submitData, token);

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
    return <div className="w-full p-6 text-center">Loading profile...</div>;
  }

  if (!advocate) {
    return (
      <div className="w-full p-6 text-center">
        Failed to load profile. Please refresh the page.
      </div>
    );
  }

  return (
    <div className="w-full p-6 border-l border-gray-200">
      {!isEditing ? (
        // View Mode
        <>
          <div className="flex gap-5 mb-5">
            <img
              src={
                advocate?.profilePhoto
                  ? `${advocate.profilePhoto}`
                  : // ? `${import.meta.env.VITE_API_URL}/uploads/${
                    //     advocate.profilePhoto
                    //   }`
                    "/default-profile.jpg"
              }
              alt="Lawyer photo"
              className="w-30 h-44 rounded-lg object-cover"
            />

            <div className="flex-1">
              <div className="flex justify-between items-center relative">
                <h2 className="text-2xl font-bold">{advocate?.name}</h2>

                <div className="relative" ref={dropdownRef}>
                  <button
                    className="p-2 rounded hover:bg-gray-100"
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10">
                      <button
                        onClick={() => {
                          handleEditClick();
                          setShowDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-base text-gray-700">
                {advocate?.category}
                {advocate?.typeOfLawyer && ` • ${advocate?.typeOfLawyer}`}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {advocate?.experience} years Experience
              </div>

              <div className="mt-4 text-sm">
                <div className="mb-2 flex items-center">
                  <span className="font-bold mr-1">Email:</span>{" "}
                  {advocate?.email}
                  <span className="mx-2">|</span>
                  <span className="font-bold mr-1">Phone:</span>{" "}
                  {advocate?.phone}
                </div>

                {advocate?.address && (
                  <div className="mb-2">
                    <span className="font-bold mr-1">Address:</span>{" "}
                    {[
                      advocate.address.street,
                      advocate.address.city,
                      advocate.address.state,
                      advocate.address.pincode,
                      advocate.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "No address provided"}
                  </div>
                )}

                <div className="mb-2">
                  <span className="font-bold mr-1">Certifications:</span>{" "}
                  {advocate?.certification || "Not specified"}
                </div>

                <div className="mb-2 flex items-center flex-wrap">
                  <span className="font-bold mr-1">Languages:</span>{" "}
                  {advocate?.languages &&
                  Array.isArray(advocate.languages) &&
                  advocate.languages.length > 0 ? (
                    advocate.languages.join(", ")
                  ) : (
                    <span>No languages specified</span>
                  )}
                  <span className="mx-2">|</span>
                  <span className="font-bold mr-1">Age:</span>{" "}
                  {advocate?.age || "Not specified"}
                  {advocate?.DOB && (
                    <>
                      <span className="mx-2">|</span>
                      <span className="font-bold mr-1">DOB:</span>{" "}
                      {new Date(advocate.DOB).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-5 mt-5">
            <h3 className="text-lg font-bold mb-4">Bio</h3>
            <p className="text-sm leading-relaxed mb-4">
              {advocate?.bio
                ? advocate?.bio
                : `Bio is not provided, please click the edit option and update your full profile`}
            </p>

            <div className="text-sm mt-4">
              <div className="mb-4">
                <span className="font-bold">Bar Council No:</span>{" "}
                {advocate?.barCouncilRegisterNumber || "Not specified"}
                {advocate?.barCouncilIndia && (
                  <>
                    <span className="mx-2">|</span>
                    <span className="font-bold">Bar Council India:</span>{" "}
                    {advocate?.barCouncilIndia}
                  </>
                )}
              </div>

              {advocate?.practicingField && (
                <div className="mb-4">
                  <span className="font-bold">Practicing Field:</span>{" "}
                  {advocate?.practicingField}
                </div>
              )}

              {advocate?.typeOfAdvocate && (
                <div className="mb-4">
                  <span className="font-bold">Type of Advocate:</span>{" "}
                  {advocate?.typeOfAdvocate}
                </div>
              )}
            </div>

            {/* <div className="mt-4">
              <h3 className="text-lg font-bold mb-3">Services Offered</h3>
              {advocate?.onlineConsultation && (
                <div className="text-sm mb-2 flex items-center">
                  <span className="mr-2">—</span>Legal Consultations
                </div>
              )}
            </div> */}

            <div className="mt-6">
              {/* <h3 className="text-base font-bold mb-3">Overview</h3> */}
              <div className="mt-2">
                {/* <h4 className="text-lg font-bold mb-3">
                  Professional Highlights
                </h4> */}
                {/* Add professional highlights if you have that field */}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Edit Mode
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo */}
              <div className="md:col-span-1 flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 w-full">
                  Profile Photo
                </h3>
                <div className="w-30 h-44 relative mb-4">
                  <img
                    src={
                      profilePhotoPreview ||
                      (advocate?.profilePhoto
                        ? `${advocate.profilePhoto}`
                        : // ? `${import.meta.env.VITE_API_URL}/uploads/${
                          //     advocate.profilePhoto
                          //   }`
                          "/default-profile.jpg")
                    }
                    alt="Profile Preview"
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
                <label className="bg-gray-200 px-4 py-2 rounded cursor-pointer hover:bg-gray-300">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, "profile")}
                  />
                </label>
              </div>

              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    disabled={true}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type of Lawyer
                  </label>
                  <input
                    type="text"
                    name="typeOfLawyer"
                    value={formData.typeOfLawyer || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type of Advocate
                  </label>
                  <input
                    type="text"
                    name="typeOfAdvocate"
                    value={formData.typeOfAdvocate || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={
                      formData.languages && Array.isArray(formData.languages)
                        ? formData.languages.join(", ")
                        : ""
                    }
                    onChange={handleLanguageChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    placeholder="English, Hindi, etc."
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Address</h3>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address?.street || ""}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address?.city || ""}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address?.state || ""}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address?.pincode || ""}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address?.country || ""}
                      onChange={handleAddressChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">
                  Professional Details
                </h3>
              </div>

              <div className="space-y-4 md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bar Council Registration Number
                    </label>
                    <input
                      type="text"
                      name="barCouncilRegisterNumber"
                      value={formData.barCouncilRegisterNumber || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bar Council India
                    </label>
                    <input
                      type="text"
                      name="barCouncilIndia"
                      value={formData.barCouncilIndia || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Certifications
                  </label>
                  <input
                    type="text"
                    name="certification"
                    value={formData.certification || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Practicing Field
                  </label>
                  <input
                    type="text"
                    name="practicingField"
                    value={formData.practicingField || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={4}
                    value={formData.bio || ""}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    placeholder="Tell potential clients about yourself..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="onlineConsultation"
                    name="onlineConsultation"
                    checked={formData.onlineConsultation || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="onlineConsultation"
                    className="text-sm font-medium text-gray-700"
                  >
                    Offers Online Consultation
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
