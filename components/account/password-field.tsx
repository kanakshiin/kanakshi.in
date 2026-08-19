"use client";

import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  required = false,
  placeholder = "Enter your password",
  autoComplete
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%" }}>
      <label htmlFor={inputId} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>{label}</span>
      </label>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="auth-input"
          style={{
            width: "100%",
            padding: "0.8rem 3rem 0.8rem 1rem",
            borderRadius: "14px",
            border: "1px solid var(--kanakshi-border-dark, #e0e0e0)",
            background: "#ffffff",
            fontSize: "0.95rem",
            color: "#1a1a1a",
            outline: "none",
            transition: "all 0.2s ease",
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)"
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: showPassword ? "var(--kanakshi-pink, #e9718b)" : "#8e9ca8",
            cursor: "pointer",
            padding: "6px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            outline: "none",
            transition: "color 0.2s ease, transform 0.2s ease"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--kanakshi-pink, #e9718b)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = showPassword ? "var(--kanakshi-pink, #e9718b)" : "#8e9ca8")}
        >
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
