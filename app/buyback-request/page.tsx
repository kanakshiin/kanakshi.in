"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BuybackRequestRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code") || "";
    router.replace(`/warranty-portal?tab=buyback${code ? `&code=${code}` : ""}`);
  }, [router, searchParams]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#faf8f5" }}>
      <div className="text-center">
        <div className="spinner-border text-gold mb-3" role="status" style={{ color: "#c5a880" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted small">Redirecting to Warranty & Buyback Portal...</p>
      </div>
    </div>
  );
}

export default function BuybackRequestRedirect() {
  return (
    <Suspense fallback={<RegistryRedirectFallback />}>
      <BuybackRequestRedirectContent />
    </Suspense>
  );
}

function RegistryRedirectFallback() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: "#faf8f5" }}>
      <div className="text-center">
        <div className="spinner-border mb-3" role="status" style={{ color: "#c5a880" }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted small">Preparing buyback request portal…</p>
      </div>
    </div>
  );
}
