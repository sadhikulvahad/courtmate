import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { X, User, Mail, Calendar } from "lucide-react";
import { UserData } from "@/types/Types";
import Button from "../Button";
import { BlockUser } from "@/api/user/userApi";
import { toast } from "sonner";
import ConfirmationModal from "@/components/ConfirmationModal";

interface UserModalProps {
  user: UserData;
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
}

const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  token,
}) => {
  const [localUser, setLocalUser] = useState<UserData>(user);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleBlockUser = async (id: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await BlockUser(id, token);
      if (response?.data.success) {
        setLocalUser((prev) => ({
          ...prev,
          isBlocked: !prev.isBlocked,
        }));

        toast.success(
          response.data.message ||
            `User ${localUser.isBlocked ? "unblocked" : "blocked"} successfully`
        );
      } else {
        toast.error(response?.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Blocking failed:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        title={localUser.isBlocked ? "Unblock User" : "Block User"}
        description={`Are you sure you want to ${
          localUser.isBlocked ? "unblock" : "block"
        } ${localUser.name}?`}
        isOpen={confirmationModal}
        onCancel={() => setConfirmationModal(false)}
        onConfirm={() => {
          setConfirmationModal(false);
          handleBlockUser(localUser.id);
        }}
      />

      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-2xl font-bold">
                User Details
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{localUser.name || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{localUser.email || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{localUser.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end bg-gray-50">
              <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
                <Button
                  label={localUser.isBlocked ? "Unblock" : "Block"}
                  className={`px-4 py-2 ${
                    localUser.isBlocked
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white rounded`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmationModal(true);
                  }}
                  disabled={isLoading}
                />
                <Button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  label="Close"
                  variant="secondary"
                />
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default UserModal;
