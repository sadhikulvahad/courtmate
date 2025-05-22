import { findUser, updateUser } from "@/api/user/userApi";
import NavBar from "@/components/ui/NavBar";
import { RootState } from "@/redux/store";
import { Advocate } from "@/types/Types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ResetPasswordModal from "../components/ui/ResetPasswordModal";

export default function UserProfile() {
  const [user, setUser] = useState<Advocate>();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<Advocate>>({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { user: authUser, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await findUser(authUser?.id as string, token);
        if (response.status === 200) {
          setUser(response.data.user);
          setEditedUser(response.data.user); // Initialize edited user with current data
        } else {
          toast.error(response.data.error);
        }
      } catch (error) {
        console.log(error);
        toast.error("Failed to fetch user details");
      }
    };
    fetchUser();
  }, [authUser?.id, token]);

  const handleOpenPasswordModal = () => {
    setIsPasswordModalOpen(true);
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
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

      const response = await updateUser(formData, token);

      if (response?.status === 200) {
        setUser(response.data.userData);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } else {
        toast.error(response?.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex justify-between p-6">
        <div className="left-12 top-20">
          <button
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-200 transition-all duration-300"
            onClick={() => navigate(-1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow border border-2 p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            <div className="flex justify-center">
              <div className="w-40 h-40 bg-gray-500 rounded-full flex items-center justify-center text-white text-6xl font-semibold">
                {user?.profilePhoto
                  ? `${import.meta.env.BASE_URL}/uploads/${user?.profilePhoto}`
                  : user?.name
                  ? user.name[0]
                  : "?"}
              </div>
            </div>

            {/* Profile information */}
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
                    <input
                      type="tel"
                      name="phone"
                      value={editedUser.phone || ""}
                      onChange={handleInputChange}
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
                </>
              )}

              {!isEditing && (
                <button
                  className="text-indigo-600 font-medium mb-10 hover:underline"
                  onClick={handleOpenPasswordModal}
                >
                  Change Password
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="rounded rounded-md border border-2 shadow-xl w-96 max-w-xl md:mr-24 flex flex-col items-center border-gray-200 px-8">
          <div className="font-poppins p-4 text-xl font-bold relative">
            Saved Advocates
          </div>
          <div className="w-full border border-2 shadow-xl rounded rounded-md p-2">
            <div className="w-14 h-14 bg-gray-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {user?.profilePhoto
                ? `${import.meta.env.BASE_URL}/uploads/${user?.profilePhoto}`
                : user?.name
                ? user.name[0]
                : "?"}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      {authUser && (
        <ResetPasswordModal
          isOpen={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
          token={token}
          user={authUser}
        />
      )}
    </>
  );
}
