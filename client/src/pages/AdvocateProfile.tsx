import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "@/components/ui/NavBar";
import Loader from "@/components/ui/Loading";
import {
  MapPin,
  Calendar,
  MessageSquare,
  Star,
  Award,
  Check,
  Share2,
  Phone,
  Mail,
  Clock,
//   FileText,
  Briefcase,
  Bookmark,
  ChevronLeft,
} from "lucide-react";
import { findUser } from "@/api/user/userApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Advocate, AvailabilityTableProps, BadgeProps, RatingStarsProps, Review, ReviewProps } from "@/types/Types";


// Reuse the RatingStars component from your list page
const RatingStars = ({ rating }: RatingStarsProps) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.floor(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-200"
          }
        />
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Badge component from your list page
const Badge = ({ children, color = "gray" }: BadgeProps) => {
  const colorClasses = {
    gray: "bg-gray-100 text-gray-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
};

// Review component
const ReviewComponent = ({ review }: ReviewProps) => {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <img
            src={review.avatar || "/api/placeholder/40/40"}
            alt={review.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-medium text-gray-800">{review.name}</h4>
            <span className="text-xs text-gray-500">{review.date}</span>
          </div>
          <RatingStars rating={review.rating} />
          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

// const AvailabilityTable = ({ availability }: AvailabilityTableProps) => {
//   const days = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];

//   return (
//     <div className="border rounded-lg overflow-hidden">
//       <table className="w-full text-sm">
//         <thead className="bg-gray-50">
//           <tr>
//             <th className="px-4 py-2 text-left font-medium text-gray-600">
//               Day
//             </th>
//             <th className="px-4 py-2 text-left font-medium text-gray-600">
//               Hours
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {days.map((day) => {
//             const dayLower = day.toLowerCase() as keyof typeof availability;
//             return (
//               <tr key={day} className="border-t border-gray-100">
//                 <td className="px-4 py-3 font-medium">{day}</td>
//                 <td className="px-4 py-3">
//                   {availability?.[dayLower] ? (
//                     <span className="text-green-600">
//                       {availability[dayLower]}
//                     </span>
//                   ) : (
//                     <span className="text-gray-400">Not Available</span>
//                   )}
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// const SimilarAdvocateCard = ({
//   advocate,
//   onViewProfile,
// }: SimilarAdvocateCardProps) => {
//   return (
//     <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
//       <div className="flex items-center gap-3 mb-3">
//         <div className="w-12 h-12 rounded-full overflow-hidden">
//           <img
//             src={`${import.meta.env.VITE_API_URL}/uploads/${
//               advocate.profilePhoto
//             }`}
//             alt={advocate.name}
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div>
//           <h4 className="font-semibold text-gray-800">{advocate.name}</h4>
//           <p className="text-xs text-gray-500">{advocate.typeOfAdvocate}</p>
//         </div>
//       </div>
//       <div className="flex justify-between items-center">
//         <Badge color="indigo">{advocate.category}</Badge>
//         {advocate.rating && <RatingStars rating={advocate.rating} />}
//       </div>
//       <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
//         <MapPin size={12} className="text-gray-400" />
//         <span>
//           {advocate.address?.city}, {advocate.address?.state}
//         </span>
//       </div>
//       <button
//         onClick={() => onViewProfile(advocate.id)}
//         className="w-full mt-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
//       >
//         View Profile
//       </button>
//     </div>
//   );
// };

interface RouteParams {
  id: string;
  [key: string]: string;
}

const AdvocateProfile = () => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [advocate, setAdvocate] = useState<Advocate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isSaved, setIsSaved] = useState<boolean>(false);
  // Mock data for similar advocates - in a real app, you'd fetch this
//   const [similarAdvocates, setSimilarAdvocates] = useState<Advocate[]>([]);

  // Mock reviews - in a real app, you'd fetch these
  const [reviews, setReviews] = useState<Review[]>([
//     {
//       id: 1,
//       name: "Michael Johnson",
//       rating: 5,
//       date: "2 weeks ago",
//       comment:
//         "Excellent advocate! Helped me resolve my case efficiently and professionally.",
//       avatar: "/api/placeholder/40/40",
//     },
//     {
//       id: 2,
//       name: "Sarah Williams",
//       rating: 4.5,
//       date: "1 month ago",
//       comment: "Very knowledgeable and responsive. Would definitely recommend.",
//       avatar: "/api/placeholder/40/40",
//     },
//     {
//       id: 3,
//       name: "David Martinez",
//       rating: 5,
//       date: "2 months ago",
//       comment:
//         "Outstanding service. The advocate was thorough and explained everything clearly.",
//       avatar: "/api/placeholder/40/40",
//     },
  ]);

  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchAdvocate = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await findUser(id, token);
        setAdvocate(response.data.user);
        // setSimilarAdvocates(mockSimilar);
      } catch (error) {
        console.error("Error fetching advocate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocate();
  }, []);
  console.log(advocate)
  const handleSave = () => {
    setIsSaved(!isSaved);
    // In a real app, you'd save this to the user's profile
  };

//   const handleViewSimilarProfile = (advocateId: string) => {
//     navigate(`/advocates/${advocateId}`);
//   };

  const getCategoryColor = (category: string): BadgeProps["color"] => {
    const categories: Record<string, BadgeProps["color"]> = {
      Criminal: "red",
      Family: "blue",
      Corporate: "indigo",
      Property: "purple",
      Immigration: "green",
    };
    return categories[category] || "indigo";
  };

    if (isLoading || !advocate) {
      return (
        <div className="min-h-screen bg-gray-50">
          <NavBar />
          <Loader />
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb & back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            <span>Back to advocates</span>
          </button>
        </div>

        {/* Profile header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
          <div className="relative">
            {/* Cover photo */}
            {/* <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div> */}

            {/* Profile photo & basic info */}
            <div className="px-6 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile photo */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${
                        advocate?.profilePhoto
                      }`}
                      alt={advocate?.name}
                      className="w-full h-full object-cover"
                    />
                    {advocate?.rating && advocate.rating >= 4.5 && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-white px-2 py-1 text-xs font-bold rounded-bl-lg flex items-center">
                        <Award size={12} className="mr-1" />
                        Top Rated
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic info */}
                <div className="flex-grow pt-4 md:pt-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center">
                        <h1 className="text-3xl font-bold text-gray-800">
                          {advocate?.name}
                        </h1>
                        {advocate?.onlineConsultation && (
                          <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            Online Available
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-gray-600 font-medium">
                        {advocate?.typeOfAdvocate}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        <Badge color={getCategoryColor(advocate?.category)}>
                          {advocate?.category}
                        </Badge>

                        {advocate?.rating && (
                          <div className="flex items-center">
                            <RatingStars rating={advocate.rating} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex flex-wrap gap-3">
                      {/* <button className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors duration-200 shadow-sm">
                        <Calendar size={18} />
                        <span>Book Consultation</span>
                      </button>

                      <button className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200">
                        <MessageSquare size={18} className="text-indigo-600" />
                        <span>Send Message</span>
                      </button> */}

                      <button
                        onClick={handleSave}
                        className={`flex items-center justify-center gap-2 border ${
                          isSaved
                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                            : "border-gray-200 bg-white text-gray-700"
                        } hover:bg-gray-50 font-medium py-2.5 px-5 rounded-lg transition-colors duration-200`}
                      >
                        <Bookmark
                          size={18}
                          className={isSaved ? "fill-indigo-600" : ""}
                        />
                        <span>{isSaved ? "Saved" : "Save"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "overview"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("experience")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "experience"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Experience & Education
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "reviews"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("availability")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
              activeTab === "availability"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Availability
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left column: Tab content */}
          <div className="flex-1">
            {/* Overview tab */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    About {advocate?.name}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {advocate?.bio ||
                      `${advocate?.name} is a ${
                        advocate?.experience
                      } year experienced ${
                        advocate?.typeOfAdvocate
                      } specializing in ${advocate?.category} law. Based in ${
                        advocate?.address?.city || "your city"
                      }, they provide expert legal advice and representation.`}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-indigo-50 rounded-full mr-4">
                        <Award size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium text-gray-800">
                          {advocate?.experience} Years
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-3 bg-blue-50 rounded-full mr-4">
                        <Check size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          BCI Registration
                        </p>
                        <p className="font-medium text-gray-800">
                          {advocate?.barCouncilRegisterNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-3 bg-purple-50 rounded-full mr-4">
                        <MapPin size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-800">
                          {advocate?.address?.city}, {advocate?.address?.state}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="p-3 bg-green-50 rounded-full mr-4">
                        <Briefcase size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Specialization</p>
                        <p className="font-medium text-gray-800">
                          {advocate?.category} Law
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {advocate?.languages?.map((language, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {advocate?.cirtification && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Certifications
                      </h3>
                      <p className="text-gray-700">{advocate.cirtification}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-full mr-3">
                          <Phone size={16} className="text-gray-600" />
                        </div>
                        <span className="text-gray-700">
                          {advocate?.phone}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-full mr-3">
                          <Mail size={16} className="text-gray-600" />
                        </div>
                        <span className="text-gray-700">{advocate?.email}</span>
                      </div>

                      {advocate?.address && (
                        <div className="flex items-start">
                          <div className="p-2 bg-gray-100 rounded-full mr-3 mt-1">
                            <MapPin size={16} className="text-gray-600" />
                          </div>
                          <div className="text-gray-700">
                            <p>{advocate.address.street}</p>
                            <p>
                              {advocate.address.city}, {advocate.address.state}
                            </p>
                            <p>{advocate.address.pincode}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience tab */}
            {activeTab === "experience" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Experience
                  </h2>

                  {/* This is mock data - in a real app, you'd fetch this from the API */}
                  <div className="mb-8">
                    <div className="relative pl-8 pb-6 border-l border-gray-200">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-indigo-100 border-2 border-indigo-500 rounded-full -translate-x-1/2"></div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-indigo-600">
                          2020 - Present
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Senior Advocate
                      </h3>
                      <p className="text-gray-600">
                        Singh & Associates, Mumbai
                      </p>
                      <p className="mt-2 text-gray-600">
                        Specializing in {advocate?.category} law cases with a
                        focus on client representation in court.
                      </p>
                    </div>

                    <div className="relative pl-8 pb-6 border-l border-gray-200">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded-full -translate-x-1/2"></div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          2015 - 2020
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Associate Advocate
                      </h3>
                      <p className="text-gray-600">Legal Partners LLP, Delhi</p>
                      <p className="mt-2 text-gray-600">
                        Handled various cases related to {advocate?.category} law
                        and client consultation.
                      </p>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded-full -translate-x-1/2"></div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          2012 - 2015
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Junior Advocate
                      </h3>
                      <p className="text-gray-600">
                        Sharma Legal Services, Bangalore
                      </p>
                      <p className="mt-2 text-gray-600">
                        Started career with focus on research and case
                        preparation.
                      </p>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Education
                  </h2>

                  {/* This is mock data - in a real app, you'd fetch this from the API */}
                  <div>
                    <div className="relative pl-8 pb-6 border-l border-gray-200">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-indigo-100 border-2 border-indigo-500 rounded-full -translate-x-1/2"></div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-indigo-600">
                          2010 - 2012
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        LLM in Corporate Law
                      </h3>
                      <p className="text-gray-600">
                        National Law University, Delhi
                      </p>
                      <p className="mt-2 text-gray-600">
                        Specialized in corporate legal structures and business
                        law with honors.
                      </p>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-gray-100 border-2 border-gray-400 rounded-full -translate-x-1/2"></div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-gray-600">
                          2006 - 2010
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Bachelor of Laws (LLB)
                      </h3>
                      <p className="text-gray-600">
                        Government Law College, Mumbai
                      </p>
                      <p className="mt-2 text-gray-600">
                        Graduated with first class honors, participated in
                        national moot court competitions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      Client Reviews
                    </h2>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      Write a Review
                    </button>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">
                        {advocate?.rating ? advocate.rating.toFixed(1) : "4.8"}
                      </div>
                      <div className="flex justify-center mb-1">
                        <RatingStars rating={advocate?.rating || 4.8} />
                      </div>
                      <p className="text-sm text-gray-500">
                        {reviews.length} reviews
                      </p>
                    </div>

                    <div className="flex-1">
                      {/* Rating distribution - this is mock data */}
                      <div className="flex items-center mb-1">
                        <span className="w-8 text-xs text-gray-600">5★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: "75%" }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-gray-600 text-right">
                          75%
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <span className="w-8 text-xs text-gray-600">4★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-green-400 h-full"
                            style={{ width: "15%" }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-gray-600 text-right">
                          15%
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <span className="w-8 text-xs text-gray-600">3★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-yellow-400 h-full"
                            style={{ width: "7%" }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-gray-600 text-right">
                          7%
                        </span>
                      </div>
                      <div className="flex items-center mb-1">
                        <span className="w-8 text-xs text-gray-600">2★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-orange-400 h-full"
                            style={{ width: "3%" }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-gray-600 text-right">
                          3%
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-8 text-xs text-gray-600">1★</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="bg-red-400 h-full"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                        <span className="w-8 text-xs text-gray-600 text-right">
                          0%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {reviews.map((review) => (
                      <ReviewComponent key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Availability tab */}
            {activeTab === "availability" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Availability Schedule
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Below is the weekly availability schedule for{" "}
                    {advocate?.name}. You can book a consultation during these
                    hours.
                  </p>

                  {/* This is mock data - in a real app, you'd fetch this from the API */}
                  {/* <AvailabilityTable
                    availability={{
                      monday: "9:00 AM - 5:00 PM",
                      tuesday: "9:00 AM - 5:00 PM",
                      wednesday: "9:00 AM - 5:00 PM",
                      thursday: "9:00 AM - 5:00 PM",
                      friday: "9:00 AM - 5:00 PM",
                      saturday: "10:00 AM - 2:00 PM",
                      sunday: "",
                    }}
                  /> */}

                  <div className="mt-6 bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-start">
                      <Clock size={20} className="text-indigo-600 mt-1 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          Consultation Duration
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          Each consultation session is typically 45 minutes.
                          Extended consultations available upon request.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    onClick={()=> navigate(`/booking/${advocate.id}`)}>
                      <Calendar size={18} className="mr-2" />
                      Schedule a Consultation
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {/* Quick actions card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Quick Actions</h3>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <button className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                  onClick={() => navigate(`/booking/${id}`)}>
                    <Calendar size={18} className="mr-2" />
                    Book Appointment
                  </button>

                  <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <MessageSquare size={18} className="mr-2 text-indigo-600" />
                    Send Message
                  </button>

                  {/* <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Phone size={18} className="mr-2 text-green-600" />
                    Call Now
                  </button> */}

                  {/* <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <FileText size={18} className="mr-2 text-blue-600" />
                    Download Profile
                  </button> */}

                  <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Share2 size={18} className="mr-2" />
                    Share Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Similar advocates card */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">
                  Similar Advocates
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {similarAdvocates?.map((simAdvocate) => (
                    <SimilarAdvocateCard
                      key={simAdvocate.id}
                      advocate={simAdvocate}
                      onViewProfile={handleViewSimilarProfile}
                    />
                  ))}
                </div>

                <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
                  <Users size={16} className="mr-2" />
                  View More Advocates
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateProfile;
