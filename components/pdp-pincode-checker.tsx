"use client";

import React, { useState } from "react";

export function PdpPincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "invalid">("idle");
  const [deliveryDate, setDeliveryDate] = useState("");

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pincode.replace(/[^0-9]/g, "");
    if (cleanPin.length !== 6) {
      setStatus("invalid");
      return;
    }

    setStatus("checking");
    setTimeout(() => {
      // Calculate estimated delivery: 2-3 days from now
      const d = new Date();
      d.setDate(d.getDate() + 3);
      const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
      setDeliveryDate(d.toLocaleDateString("en-IN", options));
      setStatus("available");
    }, 400);
  };

  return (
    <div className="pdp-delivery-check-box">
      <div className="pdp-delivery-title">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--kanakshi-pink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="2" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <span>Delivery &amp; Pincode Availability</span>
      </div>

      <form onSubmit={handleCheck} className="pdp-pincode-form">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit Pincode"
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/[^0-9]/g, ""));
            if (status !== "idle") setStatus("idle");
          }}
          className="pdp-pincode-input"
        />
        <button type="submit" className="pdp-pincode-btn">
          {status === "checking" ? "Checking..." : "Check"}
        </button>
      </form>

      {status === "available" && (
        <div className="pdp-delivery-result success">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div>
            <strong>Free Insured Express Delivery</strong> by <span>{deliveryDate}</span>
            <div style={{ fontSize: "0.74rem", color: "#666666", marginTop: "2px" }}>
              Cash on Delivery (COD) &amp; Express Doorstep Trials available for {pincode}.
            </div>
          </div>
        </div>
      )}

      {status === "invalid" && (
        <div className="pdp-delivery-result error">
          <span>Please enter a valid 6-digit Indian Pincode.</span>
        </div>
      )}
    </div>
  );
}
