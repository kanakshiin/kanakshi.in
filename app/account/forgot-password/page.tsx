"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { fetchCustomerAuthConfig, resetCustomerPassword, sendCustomerForgotPasswordOtp } from "../../../lib/customer-auth";
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

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!passwordResetAvailable) {
      setError("Password reset by email is temporarily unavailable. Please contact Little Divinity support.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await sendCustomerForgotPasswordOtp(email);
      setOtpSent(true);
      setStatus("A reset OTP has been sent to your email.");
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

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      await resetCustomerPassword({
        email,
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
          <div className="auth-two-column">
            <form className="auth-form" onSubmit={handleSendOtp}>
              <label className="auth-field">
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <button type="submit" className="secondary-button" disabled={loading || configLoading || !passwordResetAvailable}>
                {loading && !otpSent ? "Sending…" : "Send Reset OTP"}
              </button>
            </form>
            <form className="auth-form" onSubmit={handleResetPassword}>
              <label className="auth-field">
                <span>OTP</span>
                <input value={code} onChange={(event) => setCode(event.target.value)} required />
              </label>
              <PasswordField label="New Password" value={password} onChange={setPassword} required autoComplete="new-password" />
              <PasswordField
                label="Confirm Password"
                value={passwordConfirmation}
                onChange={setPasswordConfirmation}
                required
                autoComplete="new-password"
              />
              <button type="submit" className="primary-button" disabled={loading || !otpSent || configLoading || !passwordResetAvailable}>
                {loading && otpSent ? "Resetting…" : "Reset Password"}
              </button>
            </form>
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
