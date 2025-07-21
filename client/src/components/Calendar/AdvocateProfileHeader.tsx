import { Mail, MapPin, Phone } from "lucide-react";
import { AdvocateProps } from "@/types/Types";
import { useNavigate } from "react-router-dom";

interface AdvocateProfileHeaderProps {
  advocate: AdvocateProps | undefined;
}

export default function AdvocateProfileHeader({
  advocate,
}: AdvocateProfileHeaderProps) {
  const navigate = useNavigate();
  if (!advocate) return null;

  return (
    <div
      className="bg-white rounded-lg shadow overflow-hidden mb-6"
      onClick={() => navigate(-1)}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Image + Main Info */}
          <div className="flex gap-4">
            {/* Image */}
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
              <img
                src={`${advocate?.profilePhoto}`}
                // src={`${import.meta.env.VITE_API_URL}/uploads/${
                //   advocate?.profilePhoto
                // }`}
                alt={advocate?.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Advocate Name + Basic Info */}
            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {advocate?.name}
              </h1>
              <p className="text-gray-600">Age : {advocate?.age}</p>
              <span className="text-sm text-gray-600 mt-1">
                {advocate?.experience} experience
              </span>
            </div>
          </div>

          {/* Right Side Contact Info */}
          <div className="flex flex-col gap-2 text-gray-600 mt-4 md:mt-0">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{advocate?.address?.city}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span className="text-sm">{advocate?.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm">{advocate?.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
