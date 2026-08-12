"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminReviews, useModerateReview } from "@/hooks/queries/admin/useAdminStoreReviews";

export default function AdminReviewsPage() {
  const { data: fetchedReviews, isLoading } = useAdminReviews();
  const moderateMutation = useModerateReview();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    setReviews((fetchedReviews ?? []) as any[]);
  }, [fetchedReviews]);

  const handleModeration = async (id: string, status: "approved" | "rejected") => {
    try {
      await moderateMutation.mutateAsync({ id, status });
      setReviews((state) =>
        state.map((review) =>
          review.id === id
            ? { ...review, is_approved: status === "approved", moderation_status: status }
            : review,
        ),
      );
      toast.success(status === "approved" ? "Review approved." : "Review rejected.");
    } catch (error: any) {
      toast.error(error?.message ?? "Failed to moderate review.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#1E293B]">Reviews</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 font-medium border-b border-gray-50">
                <th scope="col" className="px-6 py-4">User</th>
                <th scope="col" className="px-6 py-4">Product</th>
                <th scope="col" className="px-6 py-4">Rating</th>
                <th scope="col" className="px-6 py-4">Comment</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No reviews found</td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-[#1E293B]">{review.profiles?.full_name || "Unknown"}</td>
                    <td className="px-6 py-4 text-gray-500">{review.products?.name || "Unknown"}</td>
                    <td className="px-6 py-4 text-gray-500">{review.rating} / 5</td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        review.moderation_status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : review.is_approved
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {review.moderation_status === "rejected" ? "Rejected" : review.is_approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                      {!review.is_approved && review.moderation_status !== "rejected" && (
                        <button
                          onClick={() => handleModeration(review.id, "approved")}
                          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {review.moderation_status !== "rejected" && (
                        <button
                          onClick={() => handleModeration(review.id, "rejected")}
                          className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors"
                        >
                          Reject
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
