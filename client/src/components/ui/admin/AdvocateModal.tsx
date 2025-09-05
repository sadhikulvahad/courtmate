import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  X,
  Mail,
  Calendar,
  Phone,
  MapPin,
  Briefcase,
  Star,
} from "lucide-react";
import { AdvocateProps } from "@/types/Types";
import { SendVerificaton } from "@/api/admin/advocatesApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Loader from "../Loading";
import Button from "../Button";
import { BlockUser } from "@/api/user/userApi";
import ConfirmationModal from "../../ConfirmationModal";

interface AdvocateModalProps {
  advocate: AdvocateProps;
  isOpen: boolean;
  onClose: () => void;
}

const AdvocateModal: React.FC<AdvocateModalProps> = ({
  advocate,
  isOpen,
  onClose,
}) => {
  const [localAdvocate, setLocalAdvocate] = useState(advocate);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);

  useEffect(() => {
    setLocalAdvocate(advocate);
  }, [advocate]);

  const { token } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  if (!token) {
    navigate("/signup");
  }
  if (!advocate) return null;

  const handleVerification = async (
    status: "Request" | "Accepted" | "Pending" | "Rejected",
    id: string
  ) => {
    setIsLoading(true);
    const response = await SendVerificaton(status, id);
    if (response?.status === 200) {
      setLocalAdvocate((prev) =>
        prev ? { ...prev, isAdminVerified: status } : prev
      );
      toast.success(response.data.message);
      setIsLoading(false);
    } else {
      toast.error(response?.data.error);
      setIsLoading(false);
    }
    setLocalAdvocate((prev) =>
      prev ? { ...prev, isAdminVerified: status } : prev
    );
  };

  const handleBlockUser = async (id: string) => {
    if (!token) return;

    setIsLoading(true); // Show loading indicator

    try {
      const response = await BlockUser(id);

      if (response?.data.success) {
        // Update the local state
        setLocalAdvocate((prev) =>
          prev ? { ...prev, isBlocked: !prev.isBlocked } : prev
        );

        toast.success(
          response.data.message ||
            `User ${
              localAdvocate.isBlocked ? "unblocked" : "blocked"
            } successfully`
        );
      } else {
        toast.error(response?.data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Blocking failed:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsLoading(false); // Hide loading indicator whether successful or not
    }
  };

  return (
    <>
      <ConfirmationModal
        title={localAdvocate.isBlocked ? "UnBlock Advocate" : "Block Advocate"}
        description={`Are you sure you want to ${
          localAdvocate.isBlocked ? "unblock" : "block"
        } ${localAdvocate.name}?`}
        isOpen={confirmationModal}
        onCancel={() => setConfirmationModal(false)}
        onConfirm={() => {
          setConfirmationModal(false);
          handleBlockUser(localAdvocate.id);
        }}
      />
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-white/70 flex items-center justify-center">
          <Loader />
        </div>
      )}
      <Dialog open={isOpen} onClose={onClose} className="relative z-20">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Dialog.Panel className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-2xl font-bold">
                Advocate Details
              </Dialog.Title>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-6 mb-6">
                <img
                  // src={`${import.meta.env.VITE_API_URL}/uploads/${
                  //   localAdvocate.profilePhoto
                  // }`}
                  src={`${localAdvocate.profilePhoto}`}
                  alt="profile"
                  className="object-cover w-32 h-32 rounded-lg"
                />

                <div>
                  <h3 className="text-2xl font-bold">{localAdvocate.name}</h3>
                  <p className="text-gray-600">{localAdvocate.category}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-gray-500">(124 reviews)</span>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 mt-2 text-sm rounded-full ${
                      localAdvocate.isAdminVerified === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : localAdvocate.isAdminVerified === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  ></span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{localAdvocate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Join Date</p>
                      <p className="font-medium">{localAdvocate.verifiedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-medium">
                        {localAdvocate.experience} Years
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">+91 {localAdvocate.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {localAdvocate.address.state},{" "}
                        {localAdvocate.address.city}
                      </p>
                      <p className="font-medium">
                        {localAdvocate.address.street},{" "}
                        {localAdvocate.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-2 font-medium">About</h4>
                <p className="text-gray-600">
                  Experienced corporate lawyer specializing in mergers and
                  acquisitions, contract law, and business litigation. Proven
                  track record of successfully handling complex legal matters
                  for both domestic and international clients.
                </p>
              </div>
            </div>

            <div className="flex justify-end bg-gray-50">
              <div className="flex gap-3 p-6 rounded-b-lg">
                {localAdvocate.isAdminVerified === "Pending" && (
                  <>
                    <Button
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      onClick={() =>
                        handleVerification("Accepted", localAdvocate.id)
                      }
                      label={"Approve"}
                      variant="primary"
                    />
                    <Button
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      onClick={() =>
                        handleVerification("Rejected", localAdvocate.id)
                      }
                      label={"Reject"}
                      variant="primary"
                    />
                  </>
                )}
                {localAdvocate.isAdminVerified === "Accepted" && (
                  <>
                    <Button
                      label={localAdvocate.isBlocked ? "UnBlock" : "Block"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmationModal(true);
                      }}
                      className={`px-4 py-2 text-sm font-medium text-white ${
                        !localAdvocate.isBlocked
                          ? "bg-red-600 rounded-md hover:bg-red-700"
                          : "bg-green-600 rounded-md hover:bg-green-700"
                      }`}
                      variant="primary"
                    />
                  </>
                )}
                <Button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-900 rounded-md hover:bg-gray-50"
                  label={"Close"}
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

export default AdvocateModal;
