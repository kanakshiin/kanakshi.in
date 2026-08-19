"use client";

import React, { useState } from "react";

type PincodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onSelectPincode: (pincode: string, city: string) => void;
};

export function KanakshiPincodeModal({ isOpen, onClose, currentPincode, onSelectPincode }: PincodeModalProps) {
  const [pincodeInput, setPincodeInput] = useState(currentPincode || "");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  if (!isOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincodeInput.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Please enter a valid 6-digit Indian pincode.");
      return;
    }
    setError("");
    setIsChecking(true);

    setTimeout(() => {
      setIsChecking(false);
      let detectedCity = "Express Delivery (2-3 Days)";
      if (clean.startsWith("11") || clean.startsWith("12") || clean.startsWith("20")) {
        detectedCity = "Delhi NCR (Next Day Delivery)";
      } else if (clean.startsWith("40") || clean.startsWith("41")) {
        detectedCity = "Mumbai / Pune (2 Days)";
      } else if (clean.startsWith("56") || clean.startsWith("57")) {
        detectedCity = "Bengaluru (2 Days)";
      } else if (clean.startsWith("70")) {
        detectedCity = "Kolkata (2-3 Days)";
      }
      onSelectPincode(clean, detectedCity);
      onClose();
    }, 400);
  };

  return (
    <div className="kanakshi-modal-backdrop" onClick={onClose}>
      <div className="kanakshi-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Check Delivery & Services</h3>
          <button onClick={onClose} aria-label="Close modal" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--kanakshi-text-muted)", display: "flex" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "var(--kanakshi-text-body)", marginBottom: "20px" }}>
          Enter your delivery pincode to check exact delivery dates, cash on delivery availability, and free shipping benefits.
        </p>

        <form onSubmit={handleCheck}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={pincodeInput}
              onChange={(e) => {
                setPincodeInput(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                border: "1px solid var(--kanakshi-border-dark)",
                borderRadius: "var(--radius-sm)",
                fontSize: "1rem",
                outline: "none"
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={isChecking}
              className="kanakshi-btn kanakshi-btn-primary"
              style={{ padding: "0 24px" }}
            >
              {isChecking ? "Checking..." : "Apply"}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: "0.82rem", color: "#de350b", marginBottom: "12px" }}>
              {error}
            </p>
          )}
        </form>

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--kanakshi-border)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "12px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--kanakshi-pink-subtle)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--kanakshi-black)" }}>Free Express Shipping</div>
              <div style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>On all orders across India with zero handling charges</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--kanakshi-pink-subtle)", color: "var(--kanakshi-pink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--kanakshi-black)" }}>100% Insured Transit</div>
              <div style={{ fontSize: "0.78rem", color: "var(--kanakshi-text-muted)" }}>Tamper-proof sealed jewellery packaging with courier insurance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
