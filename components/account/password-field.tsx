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
  placeholder,
  autoComplete
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          id={inputId}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ width: "100%", paddingRight: "3.5rem" }}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          style={{
            position: "absolute",
            right: "0.8rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--accent)",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 600,
            outline: "none"
          }}
        >
          {showPassword ? "HIDE" : "SHOW"}
        </button>
      </div>
    </label>
  );
}
