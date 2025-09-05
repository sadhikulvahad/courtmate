import { useCallback, useEffect, useState } from "react";
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
  Briefcase,
  Bookmark,
  ChevronLeft,
} from "lucide-react";
import {
  findUser,
  GetSavedAdvocates,
  toggleSaveAdvocate,
} from "@/api/user/userApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Advocate, BadgeProps, RatingStarsProps, Review } from "@/types/Types";
import { toast } from "sonner";
import { CreateConversation } from "@/api/chatApi";
import RatingAndReview from "@/components/Review";
import { findReviews } from "@/api/advocate/profileAPI";
import LocationMap from "@/components/ui/LocationMap";

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

interface Ad {
  _id: string;
  id?: string;
}

const AdvocateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advocate, setAdvocate] = useState<Advocate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [savedAdvocates, setSavedAdvocates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);

  const isSaved = id ? savedAdvocates.includes(id) : false;

  useEffect(() => {
    const fetchAdvocate = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const response = await findUser(id);
        setAdvocate(response.data.user);
        // setSimilarAdvocates(mockSimilar);
      } catch (error) {
        console.error("Error fetching advocate:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdvocate();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async (advocateId: string | undefined) => {
      if (!advocateId) return;

      try {
        const response = await findReviews(advocateId);
        if (response?.status === 200) {
          setReviews(response.data.reviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews(advocate?.id);
  }, [advocate?.id]);

  const startChat = async () => {
    if (!user) {
      toast.error("Please log in to start a chat");
      navigate("/signup");
      return;
    }

    if (!id) {
      toast.error("Invalid advocate ID");
      return;
    }

    try {
      const conversation = await CreateConversation(id, "advocate");
      navigate(
        `/chat?conversationId=${conversation?.data._id}&advocateId=${conversation?.data.participants[1].userId}`
      );
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat. Please try again.");
    }
  };

  const handleShare = async () => {
    const shareText = `Advocate Profile: Check this out!\n\n${window.location.href}`;
    const encodedText = encodeURIComponent(shareText);

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Advocate Profile",
          text: shareText,
          url: window.location.href,
        });
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send/?text=${encodedText}`;
        const opened = window.open(whatsappUrl, "_blank");

        if (!opened) {
          try {
            await navigator.clipboard.writeText(shareText);
            toast.success("Profile link copied to clipboard!");
          } catch (clipError) {
            console.error("Clipboard copy failed:", clipError);
            toast.error("Failed to share or copy");
          }
        }
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Sharing failed");
    }
  };

  const toggleSaved = useCallback(
    async (advocateId: string) => {
      try {
        // Call API
        const response = await toggleSaveAdvocate(advocateId);

        if (response?.data?.success) {
          setSavedAdvocates((prev) => {
            if (prev.includes(advocateId)) {
              return prev.filter((id) => id !== advocateId);
            } else {
              return [...prev, advocateId];
            }
          });

          // Show success message
          const isCurrentlySaved = savedAdvocates.includes(advocateId);
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

  useEffect(() => {
    const getSavedAdvocates = async () => {
      try {
        const response = await GetSavedAdvocates();
        const saved = response?.data?.advocates || [];
        const savedIds = saved.map((adv: Ad) => adv._id || adv.id);

        setSavedAdvocates(savedIds);
      } catch (error) {
        console.error("Failed to fetch saved advocates:", error);
        toast.error("Error loading saved advocates");
      }
    };

    getSavedAdvocates();
  }, []);

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
                      // src={`${import.meta.env.VITE_API_URL}/uploads/${
                      //   advocate?.profilePhoto
                      // }`}
                      src={`${advocate?.profilePhoto}`}
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
                      <button
                        onClick={() => id && toggleSaved(id)}
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

                  <div className="p-4 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Contact Information
                    </h3>
                    <div className="flex flex-row gap-4">
                      {/* Left Column: Contact Details */}
                      <div className="flex-1 space-y-3">
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
                          <span className="text-gray-700">
                            {advocate?.email}
                          </span>
                        </div>

                        {advocate?.address && (
                          <div className="flex items-start">
                            <div className="p-2 bg-gray-100 rounded-full mr-3 mt-1">
                              <MapPin size={16} className="text-gray-600" />
                            </div>
                            <div className="text-gray-700">
                              <p>{advocate.address.street}</p>
                              <p>
                                {advocate.address.city},{" "}
                                {advocate.address.state}
                              </p>
                              <p>{advocate.address.pincode}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Map */}
                      {advocate?.address && (
                        <div className="flex-1">
                          <div className="rounded-lg shadow">
                            <LocationMap address={advocate.address} />
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
                        Handled various cases related to {advocate?.category}{" "}
                        law and client consultation.
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

            {activeTab === "reviews" && (
              <RatingAndReview
                advocateId={id}
                advocateName={advocate?.name}
                reviews={reviews}
                setReviews={setReviews}
                userId={user?.id}
              />
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
                    <button
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                      onClick={() => navigate(`/booking/${advocate.id}`)}
                    >
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
                  <button
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    onClick={() => navigate(`/booking/${id}`)}
                  >
                    <Calendar size={18} className="mr-2" />
                    Book Appointment
                  </button>

                  <button
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    onClick={startChat}
                  >
                    <MessageSquare size={18} className="mr-2 text-indigo-600" />
                    Send Message
                  </button>

                  <button
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
                    onClick={handleShare}
                  >
                    <Share2 size={18} className="mr-2" />
                    Share Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvocateProfile;
