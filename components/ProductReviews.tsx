"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  images: string | null;
  guestName: string | null;
  createdAt: string;
  user: { name: string } | null;
}

function StarSelector({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          className={`text-3xl leading-none transition-transform hover:scale-110 ${
            star <= (hovered || rating) ? "text-amber-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

interface ProductReviewsProps {
  productSlug: string;
}

export default function ProductReviews({ productSlug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews/${productSlug}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchReviews();
    const handler = () => fetchReviews();
    window.addEventListener("reviewsRefetch", handler);
    return () => window.removeEventListener("reviewsRefetch", handler);
  }, [fetchReviews]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const fd = new FormData();
        fd.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          if (uploadData.url) uploadedUrls.push(uploadData.url);
        }
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug,
          rating,
          comment: comment.trim(),
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          images: uploadedUrls,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setRating(0);
        setComment("");
        setGuestName("");
        setGuestEmail("");
        setImageFiles([]);
        setImagePreviews([]);
        window.dispatchEvent(new Event("reviewsRefetch"));
      } else {
        const data = await res.json();
        setSubmitError(data.error || "Failed to submit review. Please try again.");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reviewerName = (r: ReviewItem) =>
    r.user?.name || r.guestName || "Anonymous";

  const parseImages = (raw: string | null): string[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  return (
    <section
      id="reviews-section"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Customer Reviews
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <div className="flex text-amber-400 text-lg leading-none">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </div>
            <span className="text-sm text-gray-500">
              {avgRating.toFixed(1)} out of 5 &middot;{" "}
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* ── Review List ── */}
          <div>
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-gray-500 py-4 text-sm">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => {
                  const imgs = parseImages(r.images);
                  return (
                    <div
                      key={r.id}
                      className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                            {reviewerName(r).charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {reviewerName(r)}
                          </span>
                        </div>
                        <time className="text-xs text-gray-400 shrink-0">
                          {new Date(r.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                      <div className="flex text-amber-400 text-base mb-2 leading-none">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </div>
                      {r.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {r.comment}
                        </p>
                      )}
                      {imgs.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {imgs.map((url, i) => (
                            <Image
                              key={i}
                              src={url}
                              alt={`Review photo ${i + 1}`}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Review Form ── */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Write a Review
            </h3>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <div className="text-green-500 text-4xl mb-2">✓</div>
                <p className="font-semibold text-green-800">
                  Thank you for your review!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Your review has been submitted and is pending approval.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Write another review
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Rating <span className="text-red-500">*</span>
                  </label>
                  <StarSelector rating={rating} onRate={setRating} />
                </div>

                <div>
                  <label
                    htmlFor="review-name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email{" "}
                    <span className="text-gray-400 font-normal">
                      (not published)
                    </span>
                  </label>
                  <input
                    id="review-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="review-comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Comment
                  </label>
                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="Share your experience with this product…"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photos{" "}
                    <span className="text-gray-400 font-normal">(up to 3)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Preview ${i + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {submitError && (
                  <p className="text-sm text-red-600">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {submitting ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
