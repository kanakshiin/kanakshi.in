"use client";

export function NotFoundBackButton() {
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      }}
    >
      Back to Previous Page
    </button>
  );
}
