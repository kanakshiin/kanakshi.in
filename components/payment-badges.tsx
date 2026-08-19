import React from "react";

export function PaymentBadges({ className = "" }: { className?: string }) {
  return (
    <div className={`kanakshi-payment-badges-grid ${className}`}>
      {/* 1. UPI */}
      <div className="payment-badge-card" title="Unified Payments Interface (UPI)">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <path d="M12 7l8 9-8 9h6l8-9-8-9h-6z" fill="#097939" />
          <path d="M22 7l8 9-8 9h6l8-9-8-9h-6z" fill="#ED752E" />
          <text x="44" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="900" fill="#2E3192" letterSpacing="0.5">UPI</text>
        </svg>
      </div>

      {/* 2. Google Pay (GPay) */}
      <div className="payment-badge-card" title="Google Pay">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <g transform="translate(10, 7)">
            {/* G Logo */}
            <path d="M8.5 7.2v2.7h4.3c-.2 1.1-1.3 3.3-4.3 3.3-2.6 0-4.7-2.1-4.7-4.8s2.1-4.8 4.7-4.8c1.5 0 2.5.6 3.1 1.2l2.1-2.1C12.4 1.4 10.6.6 8.5.6 4.3.6.9 4 .9 8.4s3.4 7.8 7.6 7.8c4.4 0 7.3-3.1 7.3-7.5 0-.5 0-.9-.1-1.3H8.5z" fill="#4285F4" />
            <path d="M1.9 5.3l2.2 1.6C4.7 5.3 6.4 4.2 8.5 4.2c1.5 0 2.5.6 3.1 1.2l2.1-2.1C12.4 2 10.6 1.2 8.5 1.2c-3.1 0-5.8 1.8-6.6 4.1z" fill="#EA4335" />
            <path d="M8.5 15.6c2.1 0 3.9-.7 5.2-1.9l-2.1-1.7c-.7.5-1.7.9-3.1.9-2.9 0-4.1-2.2-4.3-3.3L1.9 11.2c.9 2.5 3.5 4.4 6.6 4.4z" fill="#34A853" />
            <path d="M1.9 11.2c-.2-.6-.4-1.3-.4-2s.2-1.4.4-2L4.1 8.8c-.1.5-.2 1-.2 1.6s.1 1.1.2 1.6L1.9 11.2z" fill="#FBBC05" />
          </g>
          {/* Pay Text */}
          <text x="31" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="700" fill="#5F6368">Pay</text>
        </svg>
      </div>

      {/* 3. PhonePe */}
      <div className="payment-badge-card" title="PhonePe UPI">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <rect x="7" y="6" width="20" height="20" rx="4" fill="#5f259f" />
          <path d="M17.5 10v12m0-12h2.5a3 3 0 013 3v0a3 3 0 01-3 3h-2.5m0-6h-4m4 6h-2m-2 0l-3 6" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="31" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="9.5" fontWeight="800" fill="#5f259f">PhonePe</text>
        </svg>
      </div>

      {/* 4. Paytm */}
      <div className="payment-badge-card" title="Paytm Wallet & UPI">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <text x="10" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fontWeight="900" fill="#002970">Pay</text>
          <text x="35" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fontWeight="900" fill="#00B9F5">tm</text>
        </svg>
      </div>

      {/* 5. VISA */}
      <div className="payment-badge-card" title="Visa Cards">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <text x="35" y="22" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="13" fontStyle="italic" fontWeight="900" fill="#1434CB" letterSpacing="0.8">VISA</text>
        </svg>
      </div>

      {/* 6. Mastercard */}
      <div className="payment-badge-card" title="Mastercard">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <circle cx="30" cy="16" r="8.5" fill="#EB001B" />
          <circle cx="40" cy="16" r="8.5" fill="#F79E1B" fillOpacity="0.88" />
        </svg>
      </div>

      {/* 7. RuPay */}
      <div className="payment-badge-card" title="RuPay Debit & Credit Cards">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <text x="10" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="900" fontStyle="italic" fill="#092B66">Ru</text>
          <text x="27" y="21" fontFamily="Arial, Helvetica, sans-serif" fontSize="10.5" fontWeight="900" fontStyle="italic" fill="#E65100">Pay</text>
          <polygon points="50,11 58,16 50,21" fill="#097939" />
          <polygon points="54,11 62,16 54,21" fill="#E65100" />
        </svg>
      </div>

      {/* 8. Net Banking */}
      <div className="payment-badge-card" title="Net Banking All Indian Banks">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#ffffff" />
          <path d="M12 11l8-4 8 4v2H12v-2zm2 4h2v6h-2v-6zm5 0h2v6h-2v-6zm5 0h2v6h-2v-6zM11 23h18v2H11v-2z" fill="#0f172a" />
          <text x="32" y="20" fontFamily="Arial, Helvetica, sans-serif" fontSize="8" fontWeight="800" fill="#0f172a">NET</text>
          <text x="32" y="27" fontFamily="Arial, Helvetica, sans-serif" fontSize="6.5" fontWeight="700" fill="#64748b">BANK</text>
        </svg>
      </div>

      {/* 9. Cash on Delivery (COD) */}
      <div className="payment-badge-card" title="Cash on Delivery Available">
        <svg viewBox="0 0 70 32" width="48" height="22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="70" height="32" rx="4" fill="#16a34a" />
          <text x="35" y="16" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="900" fill="#ffffff" letterSpacing="0.5">COD</text>
          <text x="35" y="24" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="700" fill="#dcfce7" letterSpacing="0.5">AVAILABLE</text>
        </svg>
      </div>
    </div>
  );
}
