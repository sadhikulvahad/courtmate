import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Star, X, Send, User, Edit2, Trash2, Save } from "lucide-react";
import { Review } from "@/types/Types";
import {
  createReview,
  deleteReview,
  updateReview,
} from "@/api/advocate/profileAPI";
import { toast } from "sonner";
import ConfirmationModal from "./ConfirmationModal";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface MyComponentProps {
  advocateId: string | undefined;
  advocateName: string;
  reviews: Review[];
  setReviews: Dispatch<SetStateAction<Review[]>>;
  userId: string | undefined;
}

interface RatingInputProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: number;
  disabled?: boolean;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reviewData: { rating: number; review: string }) => Promise<void>;
  advocateName: string;
  editingReview?: Review | null;
  isEditing?: boolean;
}

interface RatingSummaryProps {
  overallRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

interface ReviewItemProps {
  review: Review;
  onDelete: (reviewId: string) => Promise<void>;
  onEdit: (review: Review) => void;
  canModify?: boolean;
  userId?: string;
}

// Rating Input Component
const RatingInput = ({
  rating,
  setRating,
  size = 24,
  disabled = false,
}: RatingInputProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className={`transition-colors ${
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
          }`}
          onMouseEnter={() => !disabled && setHoveredRating(star)}
          onMouseLeave={() => !disabled && setHoveredRating(0)}
          onClick={() => !disabled && setRating(star)}
        >
          <Star
            size={size}
            className={`${
              star <= (hoveredRating || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
};

// Review Form Modal
const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  advocateName,
  editingReview = null,
  isEditing = false,
}: ReviewModalProps) => {
  const [rating, setRating] = useState(editingReview?.rating || 0);
  const [review, setReview] = useState(editingReview?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or editing review changes
  useEffect(() => {
    if (isOpen) {
      setRating(editingReview?.rating || 0);
      setReview(editingReview?.review || "");
    }
  }, [isOpen, editingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (review.trim().length < 10) {
      toast.error("Please write at least 10 characters for your review");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, review: review.trim() });
      // Reset form
      setRating(0);
      setReview("");
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(editingReview?.rating || 0);
    setReview(editingReview?.review || "");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {isEditing
                ? `Edit Review for ${advocateName}`
                : `Write a Review for ${advocateName}`}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center gap-3">
                <RatingInput rating={rating} setRating={setRating} />
                <span className="text-sm text-gray-600">
                  {rating > 0 && (
                    <>
                      {rating === 1 && "Poor"}
                      {rating === 2 && "Fair"}
                      {rating === 3 && "Good"}
                      {rating === 4 && "Very Good"}
                      {rating === 5 && "Excellent"}
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="review"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Review *
              </label>
              <textarea
                id="review"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                placeholder="Share your experience with this advocate..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
                <p className="text-xs text-gray-500">{review.length}/500</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || rating === 0 || review.trim().length < 10
                }
                className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {isEditing ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    {isEditing ? <Save size={16} /> : <Send size={16} />}
                    {isEditing ? "Update Review" : "Submit Review"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Rating Summary Component
const RatingSummary = ({
  overallRating,
  totalReviews,
  ratingDistribution,
}: RatingSummaryProps) => {
  return (
    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg mb-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800">
          {overallRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.floor(overallRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-200"
                }
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </div>

      <div className="flex-1">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingDistribution[stars] || 0;
          const percentage =
            totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={stars} className="flex items-center mb-1">
              <span className="w-8 text-xs text-gray-600">{stars}★</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden mx-2">
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
                ></div>
              </div>
              <span className="w-10 text-xs text-gray-600 text-right">
                {Math.round(percentage)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Individual Review Component
const ReviewItem = ({
  review,
  onDelete,
  onEdit,
  // canModify = false,
  userId,
}: ReviewItemProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDelete(review._id);
      setShowDeleteModal(false)
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    onEdit(review);
  };

  // Check if current user can modify this review
  const isOwner = review.userId._id === userId;

  return (
    <>
      {showDeleteModal && (
        <ConfirmationModal
          title="Delete Review"
          description="Are you sure you want to delete your review?"
          isOpen={showDeleteModal}
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
      <div className="border-b border-gray-100 pb-4 mb-4 last:border-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            {review.avatar ? (
              <img
                src={review.avatar}
                alt={review.userId.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-100">
                <User size={20} className="text-indigo-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-1">
              <div>
                <h4 className="font-medium text-gray-800">
                  {review.userId.name}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(review.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{review.date}</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEdit}
                    className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors"
                    title="Edit review"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                    title="Delete review"
                  >
                    {isDeleting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">{review.review}</p>
          </div>
        </div>
      </div>
    </>
  );
};

// Main Rating and Review Component
const RatingAndReview = ({
  advocateId,
  advocateName,
  reviews,
  setReviews,
  userId,
}: MyComponentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);

  // Calculate rating statistics
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
    {}
  );

  const handleSubmitReview = async (reviewData: {
    rating: number;
    review: string;
  }) => {
    try {
      if (isEditing && editingReview) {
        // Update existing review

        const response = await updateReview({
          reviewId: editingReview._id,
          review: reviewData.review,
          rating: reviewData.rating,
        });

        if (response?.status === 200) {
          toast.success("Review updated successfully");
          setReviews((prev) =>
            prev.map((r) =>
              r.id === editingReview.id
                ? {
                    ...r,
                    rating: reviewData.rating,
                    review: reviewData.review,
                    date: "Just updated",
                  }
                : r
            )
          );
        } else {
          toast.error(response?.data?.error || "Failed to update review");
        }
      } else {
        // Create new review
        const response = await createReview({
          advocateId,
          userId,
          review: reviewData.review,
          rating: reviewData.rating,
        });

        if (response?.status === 201) {
          toast.success("Review added successfully");
          const newReview = {
            ...response.data.review,
            userId:
              typeof response.data.review.userId === "string"
                ? {
                    _id: response.data.review.userId,
                    name: user?.name || "",
                    email: user?.email || "",
                  }
                : response.data.review.userId,
          };

          setReviews((prev) => [newReview, ...prev]);
        } else {
          toast.error(response?.data?.error || "Failed to add review");
        }
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast.error("An error occurred while submitting the review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await deleteReview(reviewId);

      if (response?.status === 200) {
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((review) => review._id !== reviewId));
      } else {
        toast.error(response?.data?.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
      toast.error("An error occurred while deleting the review");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setIsEditing(false);
  };

  const handleOpenNewReview = () => {
    const alReadyReviewed = reviews.filter(
      (review) => review.userId._id === user?.id
    );

    if (alReadyReviewed.length > 0) {
      toast.error("You Can Only Review Once");
      return;
    }
    setEditingReview(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Client Reviews</h2>
            <button
              onClick={handleOpenNewReview}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Write a Review
            </button>
          </div>

          <RatingSummary
            overallRating={overallRating}
            totalReviews={totalReviews}
            ratingDistribution={ratingDistribution}
          />

          <div className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No reviews yet. Be the first to write a review!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                  onDelete={handleDeleteReview}
                  onEdit={handleEditReview}
                  userId={userId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitReview}
        advocateName={advocateName}
        editingReview={editingReview}
        isEditing={isEditing}
      />
    </div>
  );
};

export default RatingAndReview;
