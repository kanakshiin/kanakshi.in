"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { resendCustomerVerificationOtp, storeCustomerToken, verifyCustomerEmailOtp } from "../../lib/customer-auth";

type VerifyEmailFormProps = {
  initialEmail: string;
};

export function VerifyEmailForm({ initialEmail }: VerifyEmailFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const data = await verifyCustomerEmailOtp({ email, code });
      storeCustomerToken(data.token);
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    setStatus(null);

    try {
      await resendCustomerVerificationOtp(email);
      setStatus("A new OTP has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.");
    } finally {
      setResending(false);
    }
  }

  return (
    <section className="auth-card">
      <small className="eyebrow">Verify Email</small>
      <h1 className="auth-title">Complete Verification</h1>
      <p className="auth-muted">Enter the OTP sent to your email to activate your customer account.</p>
      <form className="auth-form" onSubmit={handleVerify}>
        <label className="auth-field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="auth-field">
          <span>OTP</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} required />
        </label>
        {error ? <p className="auth-error">{error}</p> : null}
        {status ? <p className="auth-success">{status}</p> : null}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Verifying…" : "Verify Email"}
        </button>
      </form>
      <div className="auth-link-row">
        <button type="button" className="text-link auth-link-button" onClick={handleResend} disabled={resending}>
          {resending ? "Resending…" : "Resend OTP"}
        </button>
        <Link href="/account/login" className="text-link">Back to Login</Link>
      </div>
    </section>
  );
}
