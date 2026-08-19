"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { fetchCustomerAuthConfig, resetCustomerPassword, sendCustomerForgotPasswordOtp } from "../../../lib/customer-auth";
import { isValidEmailInput, normalizeEmailInput } from "../../../lib/form-inputs";
import { CustomerAuthConfig } from "../../../lib/types";

function ForgotPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<CustomerAuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");

  useEffect(() => {
    let active = true;

    async function loadConfig() {
      setConfigLoading(true);

      try {
        const nextConfig = await fetchCustomerAuthConfig();
        if (!active) {
          return;
        }

        setConfig(nextConfig);
        if (!nextConfig.customer_email_active || !nextConfig.email_otp_enabled) {
          setError("Password reset by email is temporarily unavailable. Please contact Kanakshi concierge support.");
        }
      } catch (err) {
        if (!active) {
          return;
        }

        setError(err instanceof Error ? err.message : "Unable to load password reset settings.");
      } finally {
        if (active) {
          setConfigLoading(false);
        }
      }
    }

    void loadConfig();

    return () => {
      active = false;
    };
  }, []);

  const passwordResetAvailable = Boolean(config?.customer_email_active && config?.email_otp_enabled);
  const emailInvalid = email.length > 0 && !isValidEmailInput(email);

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailInvalid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!passwordResetAvailable) {
      setError("Password reset by email is temporarily unavailable. Please contact Kanakshi support.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await sendCustomerForgotPasswordOtp(normalizeEmailInput(email));
      setOtpSent(true);
      setStatus("A reset OTP has been sent to your email. Enter the OTP below and choose your new password.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordResetAvailable) {
      setError("Password reset by email is temporarily unavailable. Please contact Kanakshi support.");
      return;
    }

    if (emailInvalid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!otpSent) {
      setError("Request your reset OTP first.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("New password and confirm password must match.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await resetCustomerPassword({
        email: normalizeEmailInput(email),
        code,
        password,
        password_confirmation: passwordConfirmation
      });
      setStatus("Password reset successful! Redirecting you to sign in…");
      setTimeout(() => {
        router.push(`/account/login?redirect=${encodeURIComponent(redirect)}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-section" style={{ minHeight: "85vh", padding: "3rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "1020px", width: "100%", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          borderRadius: "28px",
          overflow: "hidden",
          border: "1px solid var(--line)",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 45px -15px rgba(0, 0, 0, 0.08)"
        }}>
          
          {/* Left Brand Experience Column */}
          <div style={{
            padding: "3rem 2.5rem",
            background: "linear-gradient(145deg, #fff5f7 0%, #fff9fa 50%, #fdf8ee 100%)",
            borderRight: "1px solid rgba(233, 113, 139, 0.2)",
            color: "#2d2d2d",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative"
          }}>
            <div>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 14px",
                borderRadius: "20px",
                background: "rgba(233, 113, 139, 0.12)",
                border: "1px solid rgba(233, 113, 139, 0.3)",
                color: "#b83253",
                fontSize: "0.78rem",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "1.5rem"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Account Security
              </span>

              <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a", marginBottom: "1rem" }}>
                Recover Your Atelier Account
              </h2>

              <p style={{ color: "#555555", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Forgot your password? Enter your registered email address and we will instantly send a secure 6-digit OTP code to verify your identity.
              </p>

              {/* Privé Security Features */}
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(233, 113, 139, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b83253", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>Hostinger-Secured Email OTP</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>High-priority OTP delivery straight to your inbox within seconds.</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(212, 175, 55, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b08d20", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>Encrypted Password Reset</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>Military-grade bcrypt hashing protects your customer wallet &amp; orders.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(233, 113, 139, 0.18)", paddingTop: "1.2rem", fontSize: "0.82rem", color: "#888888" }}>
              Encrypted 256-Bit SSL Protection · Verified Customer Portal
            </div>
          </div>

          {/* Right Form Column */}
          <div style={{ padding: "3.2rem 2.6rem", display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff" }}>
            <div style={{ marginBottom: "1.8rem" }}>
              <p className="eyebrow" style={{ color: "var(--kanakshi-pink, #e9718b)", letterSpacing: "1.5px", marginBottom: "0.3rem", fontWeight: 700 }}>Password Recovery</p>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Reset Password</h1>
              <p style={{ color: "#767676", fontSize: "0.92rem", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                {otpSent ? "Enter your received OTP and choose a new password." : "Enter your email address to receive a password reset OTP."}
              </p>
            </div>

            {/* Step 1: Send OTP */}
            <form onSubmit={handleSendOtp} style={{ display: "grid", gap: "1rem", marginBottom: "1.2rem" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d", marginBottom: "0.4rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>Registered Email</span>
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                    placeholder="name@example.com"
                    required
                    className="auth-input"
                    style={{
                      flex: 1,
                      padding: "0.8rem 1rem",
                      borderRadius: "14px",
                      border: emailInvalid ? "1.5px solid #ef4444" : "1.5px solid var(--kanakshi-border-dark, #e0e0e0)",
                      background: "#ffffff",
                      fontSize: "0.95rem",
                      color: "#1a1a1a",
                      outline: "none"
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || configLoading || !passwordResetAvailable || emailInvalid || !email}
                    className="primary-button"
                    style={{
                      padding: "0.8rem 1.4rem",
                      borderRadius: "14px",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {loading && !otpSent ? "Sending…" : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
                {emailInvalid && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>Enter a valid email address.</p>}
              </div>
            </form>

            {/* Step 2: Enter OTP & New Password */}
            {otpSent && (
              <form onSubmit={handleResetPassword} style={{ display: "grid", gap: "1.1rem", padding: "1.4rem", background: "var(--kanakshi-pink-subtle, #fff9fa)", borderRadius: "18px", border: "1px solid rgba(233, 113, 139, 0.25)" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d", marginBottom: "0.4rem" }}>
                    6-Digit Reset OTP Code *
                  </label>
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, config?.otp_length || 6))}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={`Enter ${config?.otp_length || 6}-digit OTP from email`}
                    className="auth-input"
                    style={{
                      width: "100%",
                      padding: "0.85rem 1rem",
                      borderRadius: "12px",
                      border: "1.5px solid var(--kanakshi-border-dark, #e0e0e0)",
                      fontSize: "1.2rem",
                      letterSpacing: "5px",
                      textAlign: "center",
                      fontWeight: 800,
                      color: "#1a1a1a",
                      background: "#ffffff",
                      outline: "none"
                    }}
                  />
                </div>

                <div>
                  <PasswordField
                    label="New Password"
                    value={password}
                    onChange={setPassword}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <PasswordField
                    label="Confirm New Password"
                    value={passwordConfirmation}
                    onChange={setPasswordConfirmation}
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || configLoading || !passwordResetAvailable || code.length < (config?.otp_length || 6)}
                  className="primary-button"
                  style={{
                    width: "100%",
                    padding: "0.95rem 1.8rem",
                    borderRadius: "14px",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  {loading && otpSent ? (
                    <>
                      <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                      <span>Updating Password…</span>
                    </>
                  ) : (
                    <>
                      <span>Set New Password &amp; Sign In</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </>
                  )}
                </button>
              </form>
            )}

            {error && (
              <div style={{
                marginTop: "1rem",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#b91c1c",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span>{error}</span>
              </div>
            )}

            {status && (
              <div style={{
                marginTop: "1rem",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
                color: "#15803d",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{status}</span>
              </div>
            )}

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.8rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid var(--kanakshi-border, #f0f0f0)",
              fontSize: "0.88rem"
            }}>
              <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: "#767676", textDecoration: "none", transition: "color 0.2s ease" }}>
                ← Back to Sign In
              </Link>
              <Link href={`/account/register?redirect=${encodeURIComponent(redirect)}`} style={{ color: "var(--kanakshi-pink, #e9718b)", fontWeight: 700, textDecoration: "none", transition: "color 0.2s ease" }}>
                Create New Account →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CustomerForgotPasswordPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Kanakshi.in</p>
          <h2 className="auth-title">Preparing password recovery…</h2>
        </div>
      </main>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
