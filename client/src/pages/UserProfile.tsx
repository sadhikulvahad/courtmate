import { ChevronLeft, Search, Bookmark } from "lucide-react";
import NavBar from "@/components/ui/NavBar";
import { RootState } from "@/redux/store";
import { Advocate } from "@/types/Types";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { toast } from "sonner";
import {
  findUser,
  updateUser,
  GetSavedAdvocates,
  toggleSaveAdvocate,
} from "@/api/user/userApi";
import ResetPasswordModal from "../components/ui/ResetPasswordModal";
import { generateSignedUrl } from "@/utils/getSignUrl";

export default function UserProfile() {
  const [user, setUser] = useState<Advocate>();
  const [savedAdvocates, setSavedAdvocates] = useState<Advocate[]>([]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<Advocate>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user: authUser, token } = useSelector(
    (state: RootState) => state.auth
  );

  // Fetch user profile and saved advocates
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const userResponse = await findUser(authUser?.id as string);

        const userData = userResponse.data.user;
        if (userResponse.status === 200) {
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
            imageUrl: photoUrl,
          };
          setUser(finalUser);
          setEditedUser(userResponse.data.user);
        } else {
          toast.error(
            userResponse.data.error || "Failed to fetch user details"
          );
        }

        // Fetch saved advocates
        const advocatesResponse = await GetSavedAdvocates();
        const saved = advocatesResponse?.data?.advocates || [];
        setSavedAdvocates(saved);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch user data or saved advocates");
      }
    };

    if (authUser?.id && token) {
      fetchUserData();
    }
  }, []);

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser(user || {});
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!editedUser || !user) return;

    setIsLoading(true);

    try {
      if (!isValidPhoneNumber(editedUser.phone!)) {
        toast.error("Please enter a valid mobile number");
        return;
      }

      const formData = new FormData();
      Object.entries(editedUser).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await updateUser(formData);
      if (response?.status === 200) {
        setUser(response.data.userData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response?.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaved = useCallback(
    async (advocateId: string) => {
      try {
        const response = await toggleSaveAdvocate(advocateId);
        if (response?.data?.success) {
          const isCurrentlySaved = savedAdvocates.some(
            (adv) => adv.id === advocateId
          );
          const updated = isCurrentlySaved
            ? savedAdvocates.filter((adv) => adv.id !== advocateId)
            : [...savedAdvocates, response.data.advocate];

          setSavedAdvocates(updated);
          toast.success(
            isCurrentlySaved
              ? "Advocate removed from saved list"
              : "Advocate added to saved list"
          );
        } else {
          toast.error("Failed to update saved advocates");
        }
      } catch (error) {
        console.error("Error saving advocate:", error);
        toast.error("An error occurred while saving advocate");
      }
    },
    [savedAdvocates]
  );

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <button
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft size={20} className="mr-1" />
              <span>Back</span>
            </button>
          </div>

          {/* Profile and Saved Advocates Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Section */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                <div className="flex justify-center">
                  <div className="w-40 h-40 bg-gray-500 rounded-full flex items-center justify-center text-white text-6xl font-semibold">
                    {user?.profilePhoto ? (
                      <img
                        src={`${user.imageUrl}`}
                        // src={`${import.meta.env.VITE_API_URL}/Uploads/${
                        //   user.profilePhoto
                        // }`}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user?.name?.[0] || "?"
                    )}
                  </div>
                </div>

                {/* Profile Information */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editedUser.name || ""}
                        onChange={handleInputChange}
                        className="text-3xl font-semibold border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <h1 className="text-3xl font-semibold">{user?.name}</h1>
                    )}
                    <button
                      className="text-indigo-600 font-medium hover:underline"
                      onClick={handleEditToggle}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editedUser.email || ""}
                          disabled={true}
                          onChange={handleInputChange}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <PhoneInput
                          type="tel"
                          name="phone"
                          value={editedUser.phone || ""}
                          onChange={(value) => {
                            setEditedUser((prev) => ({
                              ...prev,
                              phone: value,
                            }));
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors mr-2"
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-lg mb-1">{user?.email}</p>
                      <p className="text-lg mb-6">{user?.phone}</p>
                      <button
                        className="text-indigo-600 font-medium hover:underline"
                        onClick={handleOpenPasswordModal}
                      >
                        Change Password
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Advocates Section */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Saved Advocates</h2>
              {savedAdvocates.length === 0 ? (
                <div className="text-center py-6">
                  <Search className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="text-gray-600 mt-2">No saved advocates found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {savedAdvocates.map((advocate) => (
                    <div
                      key={advocate.id}
                      className="bg-gray-50 rounded-lg shadow hover:shadow-md transition-all duration-300 border border-gray-100 p-4 flex-shrink-0"
                    >
                      <div className="relative">
                        <button
                          onClick={() => toggleSaved(advocate.id)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-white shadow hover:shadow-md transition-all duration-200"
                        >
                          <Bookmark
                            size={16}
                            className={`transition-colors duration-200 ${
                              savedAdvocates.some(
                                (adv) => adv.id === advocate.id
                              )
                                ? "text-red-500 fill-current"
                                : "text-gray-400 hover:text-red-400"
                            }`}
                          />
                        </button>
                        <div className="flex items-start space-x-3">
                          <img
                            src={`${advocate.profilePhoto}`}
                            // src={`${import.meta.env.VITE_API_URL}/Uploads/${
                            //   advocate.profilePhoto
                            // }`}
                            alt={advocate.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold truncate">
                              {advocate.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {advocate.category}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {advocate.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reset Password Modal */}
        {authUser && (
          <ResetPasswordModal
            isOpen={isPasswordModalOpen}
            onClose={handleClosePasswordModal}
            user={authUser}
          />
        )}
      </div>
    </>
  );
}
