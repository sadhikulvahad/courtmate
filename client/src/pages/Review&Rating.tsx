import { useState, useEffect } from "react";
import { Star, User, Search, Filter } from "lucide-react";
import { findReviews } from "@/api/advocate/profileAPI";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Review } from "@/types/Types";

const AdvocateReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  const { user } = useSelector((state: RootState) => state.auth);

  // Calculate overall statistics for summary section
  const totalReviews = reviews.length;
  const overallRating =
    totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

  const ratingDistribution = reviews.reduce(
    (acc: Record<number, number>, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>
  );

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await findReviews(user?.id,);
      setReviews(response?.data.reviews);
    };
    fetchReviews();
  }, []);

  // Filter reviews based on search and rating filter
  useEffect(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.review.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    // Sort by date (newest first)
    filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, ratingFilter]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Client Reviews
          </h1>
          <p className="text-gray-600">
            See what your clients are saying about your services
          </p>
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {overallRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={
                      i < Math.floor(overallRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {totalReviews}{" "}
                {totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="flex-1 max-w-sm">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars] || 0;
                const percentage =
                  totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={stars} className="flex items-center mb-2">
                    <span className="flex items-center w-16 text-sm text-gray-600">
                      {stars}{" "}
                      <Star
                        size={12}
                        className="ml-1 text-yellow-400 fill-yellow-400"
                      />
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mx-3">
                      <div
                        className={`h-full transition-all duration-300 ${
                          stars >= 4
                            ? "bg-green-500"
                            : stars === 3
                            ? "bg-yellow-400"
                            : stars === 2
                            ? "bg-orange-400"
                            : "bg-red-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-500">
                {searchTerm || ratingFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "You haven't received any reviews yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredReviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {review.avatar ? (
                        <img
                          src={review.avatar}
                          alt={review.userId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100">
                          <User size={20} className="text-blue-600" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {review.userId.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(new Date(review.date))}
                        </span>
                      </div>

                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={
                              i < review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-200"
                            }
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {review.rating} out of 5
                        </span>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredReviews.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {filteredReviews.length} of {totalReviews} reviews
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvocateReviewsPage;
