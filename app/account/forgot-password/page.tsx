"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { resetCustomerPassword, sendCustomerForgotPasswordOtp } from "../../../lib/customer-auth";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          <p className="auth-muted">Request a reset OTP first, then set your new password.</p>
          <div className="auth-two-column">
            <form className="auth-form" onSubmit={handleSendOtp}>
              <label className="auth-field">
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              </label>
              <button type="submit" className="secondary-button" disabled={loading}>
                {loading && !otpSent ? "Sending…" : "Send Reset OTP"}
              </button>
            </form>
            <form className="auth-form" onSubmit={handleResetPassword}>
              <label className="auth-field">
                <span>OTP</span>
                <input value={code} onChange={(event) => setCode(event.target.value)} required />
              </label>
              <label className="auth-field">
                <span>New Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </label>
              <label className="auth-field">
                <span>Confirm Password</span>
                <input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required />
              </label>
              <button type="submit" className="primary-button" disabled={loading || !otpSent}>
                {loading && otpSent ? "Resetting…" : "Reset Password"}
              </button>
            </form>
          </div>
          {error ? <p className="auth-error">{error}</p> : null}
          {status ? <p className="auth-success">{status}</p> : null}
          <div className="auth-link-row">
            <Link href="/account/login" className="text-link">Back to Login</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
