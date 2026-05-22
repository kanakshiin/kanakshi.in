"use client";

import { useEffect, useState } from "react";

export function UrgencyTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target midnight local time
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 23, minutes: 59, seconds: 59 };
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return { hours, minutes, seconds };
    };

    // Initialize timer instantly
    setTimeLeft(calculateTimeRemaining());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) {
    // Beautiful loading skeleton matching the exact timer dimensions
    return (
      <div className="urgency-timer-skeleton">
        <div className="skeleton-pulse"></div>
      </div>
    );
  }

  const formatNum = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="urgency-timer-card">
      <div className="timer-badge-header">
        <span className="live-pulse-dot"></span>
        <span className="badge-text">Daily Divine Deal</span>
      </div>

      <div className="timer-title-row">
        <span>Offer ends in:</span>
      </div>

      {/* Ticking Clock Deck */}
      <div className="timer-clock-deck">
        <div className="clock-digit-wrapper">
          <span className="clock-digit">{formatNum(timeLeft.hours)}</span>
          <span className="clock-label">hours</span>
        </div>
        <span className="clock-divider">:</span>
        <div className="clock-digit-wrapper">
          <span className="clock-digit">{formatNum(timeLeft.minutes)}</span>
          <span className="clock-label">mins</span>
        </div>
        <span className="clock-divider">:</span>
        <div className="clock-digit-wrapper seconds-glow">
          <span className="clock-digit">{formatNum(timeLeft.seconds)}</span>
          <span className="clock-label">secs</span>
        </div>
      </div>

      {/* Scarcity Stock Meter */}
      <div className="timer-stock-meter">
        <div className="meter-label-row">
          <span>Only <strong className="scarce-highlight">3 items remaining</strong> in stock</span>
          <span className="claimed-highlight">94% claimed</span>
        </div>
        <div className="meter-track">
          <div className="meter-fill" style={{ width: "94%" }}></div>
        </div>
      </div>
    </div>
  );
}
