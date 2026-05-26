"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { fetchCustomerAuthConfig, resetCustomerPassword, sendCustomerForgotPasswordOtp } from "../../../lib/customer-auth";
import { isValidEmailInput, normalizeEmailInput } from "../../../lib/form-inputs";
import { CustomerAuthConfig } from "../../../lib/types";

function ForgotPasswordForm() {
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
          setError("Password reset by email is temporarily unavailable. Please contact Little Divinity support.");
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
      setError("Password reset by email is temporarily unavailable. Please contact Little Divinity support.");
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
      setError("Password reset by email is temporarily unavailable. Please contact Little Divinity support.");
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
      setStatus("Password reset successful. You can log in now.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-section auth-page">
      <div className="container">
        <section className="auth-card auth-wide-card">
          <small className="eyebrow">Forgot Password</small>
          <h1 className="auth-title">Reset Customer Password</h1>
          <p className="auth-muted">Request a reset OTP first, then set your new password. Little Divinity sends this OTP to your registered email.</p>
          {configLoading ? <p className="auth-muted">Checking reset availability…</p> : null}
          <div className="auth-stack">
            <form className="auth-form" onSubmit={handleSendOtp}>
              <div className="auth-inline-action">
                <label className="auth-field" style={{ margin: 0 }}>
                  <span>Email</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    className={emailInvalid ? "input-invalid" : ""}
                    aria-invalid={emailInvalid}
                    value={email}
                    onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                    required
                    placeholder="Enter your registered email"
                  />
                  {emailInvalid ? <p className="auth-field-error">Enter a valid email like `name@example.com`.</p> : null}
                </label>
                <button type="submit" className="secondary-button auth-inline-button" disabled={loading || configLoading || !passwordResetAvailable}>
                  {loading && !otpSent ? "Sending…" : otpSent ? "Resend OTP" : "Send Reset OTP"}
                </button>
              </div>
            </form>

            {otpSent ? (
              <form className="auth-form auth-stack auth-reveal-panel" onSubmit={handleResetPassword}>
                <label className="auth-field">
                  <span>OTP</span>
                  <input
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, config?.otp_length || 6))}
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder={`Enter ${config?.otp_length || 6}-digit OTP`}
                  />
                </label>
                <PasswordField label="New Password" value={password} onChange={setPassword} required autoComplete="new-password" />
                <PasswordField
                  label="Confirm Password"
                  value={passwordConfirmation}
                  onChange={setPasswordConfirmation}
                  required
                  autoComplete="new-password"
                />
                <p className="auth-muted" style={{ margin: 0 }}>
                  Your new password must be different from the current password.
                </p>
                <button type="submit" className="primary-button" disabled={loading || configLoading || !passwordResetAvailable}>
                  {loading && otpSent ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            ) : (
              <div className="auth-reveal-placeholder">
                <p className="auth-muted" style={{ margin: 0 }}>
                  OTP, new password, and confirm password will appear here after the reset OTP is sent.
                </p>
              </div>
            )}
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          {status ? <p className="auth-success">{status}</p> : null}
          <div className="auth-link-row">
            <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="text-link">Back to Login</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CustomerForgotPasswordPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page auth-suspense-shell">
        <div className="auth-suspense-card">
          <p className="eyebrow auth-pulse">Little Divinity</p>
          <h2 className="auth-title">Preparing password reset…</h2>
        </div>
      </main>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
