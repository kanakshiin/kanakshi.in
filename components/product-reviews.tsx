"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchProductReviews, submitProductReview } from "../lib/product-reviews";
import { ProductReviewFeed } from "../lib/types";

type ProductReviewsProps = {
  productName: string;
  productSlug: string;
  initialAverage?: number;
  initialCount?: number;
};

const emptyFeed = (initialAverage: number, initialCount: number): ProductReviewFeed => ({
  summary: {
    avg_rating: initialAverage,
    review_count: initialCount,
    rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  },
  items: [],
  eligibility: {
    is_authenticated: false,
    has_purchased: false,
    can_submit: false,
    reason: "Sign in with the customer account that purchased this product to leave a review.",
  },
  viewer_review: null,
});

function renderStars(rating: number): string {
  return `${"★".repeat(Math.max(0, Math.min(5, rating)))}${"☆".repeat(Math.max(0, 5 - rating))}`;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ProductReviews({
  productName,
  productSlug,
  initialAverage = 0,
  initialCount = 0,
}: ProductReviewsProps) {
  const [feed, setFeed] = useState<ProductReviewFeed>(() => emptyFeed(initialAverage, initialCount));
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductReviews(productSlug);
      setFeed(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, [productSlug]);

  const imagePreviews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const breakdownEntries = [5, 4, 3, 2, 1].map((star) => {
    const breakdownMap = feed.summary.rating_breakdown as Record<string, number> | undefined;
    const raw = breakdownMap?.[String(star)] ?? 0;
    const count = Number(raw || 0);
    const width = feed.summary.review_count > 0 ? (count / feed.summary.review_count) * 100 : 0;

    return { star, count, width };
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!feed.eligibility.can_submit) {
      setError(feed.eligibility.reason || "You cannot review this product yet.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await submitProductReview(productSlug, { rating, comment, images: files });
      setComment("");
      setFiles([]);
      setSuccess("Review submitted. It will appear after admin approval.");
      await loadReviews();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="product-reviews-section">
      <div className="container product-reviews-shell">
        <div className="product-reviews-head">
          <div>
            <p className="eyebrow">Customer Reviews</p>
            <h2>Verified reviews for {productName}</h2>
            <p className="product-reviews-intro">
              Only customers who purchased this product can leave a rating, comment, and photo review.
            </p>
          </div>
          <div className="product-reviews-scorecard">
            <strong>{feed.summary.avg_rating.toFixed(1)}</strong>
            <span>{renderStars(Math.round(feed.summary.avg_rating || 0))}</span>
            <small>{feed.summary.review_count} verified review{feed.summary.review_count === 1 ? "" : "s"}</small>
          </div>
        </div>

        <div className="reviews-summary-grid">
          <div className="reviews-breakdown-card">
            {breakdownEntries.map((entry) => (
              <div key={entry.star} className="reviews-breakdown-row">
                <span>{entry.star} star</span>
                <div className="reviews-breakdown-bar">
                  <i style={{ width: `${entry.width}%` }} />
                </div>
                <strong>{entry.count}</strong>
              </div>
            ))}
          </div>

          <div className="reviews-compose-card">
            {feed.viewer_review ? (
              <div className="review-state-card">
                <strong>Your review is already on this product</strong>
                <p>{feed.viewer_review.is_published ? "It is live on the product page." : "It is waiting for admin approval or has been hidden."}</p>
              </div>
            ) : feed.eligibility.can_submit ? (
              <form className="review-form" onSubmit={handleSubmit}>
                <div className="review-star-picker" aria-label="Select rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`review-star-btn${value <= rating ? " is-active" : ""}`}
                      onClick={() => setRating(value)}
                      aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="auth-field">
                  <label htmlFor="review-comment">Your comment</label>
                  <textarea
                    id="review-comment"
                    rows={5}
                    placeholder="Share quality, finish, packaging, gifting experience, or anything another buyer should know."
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    required
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="review-images">Review images (optional)</label>
                  <input
                    id="review-images"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    onChange={(event) => {
                      const selected = Array.from(event.target.files || []).slice(0, 4);
                      setFiles(selected);
                    }}
                  />
                </div>

                {imagePreviews.length > 0 ? (
                  <div className="review-image-preview-grid">
                    {imagePreviews.map((preview) => (
                      <img key={preview.url} src={preview.url} alt={preview.file.name} />
                    ))}
                  </div>
                ) : null}

                {error ? <div className="review-feedback review-feedback--error">{error}</div> : null}
                {success ? <div className="review-feedback review-feedback--success">{success}</div> : null}

                <button className="button review-submit-button" type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="review-state-card">
                <strong>{feed.eligibility.has_purchased ? "Your account already has a pending review state." : "Verified purchase required"}</strong>
                <p>{feed.eligibility.reason || "Only customers who purchased this product can leave a review."}</p>
              </div>
            )}
          </div>
        </div>

        {loading ? <div className="review-loading-note">Loading latest reviews...</div> : null}

        <div className="reviews-list">
          {feed.items.length > 0 ? (
            feed.items.map((review) => (
              <article key={review.id} className="review-card">
                <div className="review-card-head">
                  <div>
                    <strong>{review.customer_name}</strong>
                    <div className="review-card-meta">
                      <span>{renderStars(review.rating)}</span>
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  {review.is_verified_purchase ? <span className="verified-review-badge">Verified Purchase</span> : null}
                </div>

                <p>{review.comment}</p>

                {review.images.length > 0 ? (
                  <div className="review-card-images">
                    {review.images.map((image) => (
                      <img key={image} src={image} alt={`${review.customer_name} review upload`} />
                    ))}
                  </div>
                ) : null}
              </article>
            ))
          ) : !loading ? (
            <div className="review-empty-state">
              <strong>No published reviews yet</strong>
              <p>The first approved review for this product will appear here.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
