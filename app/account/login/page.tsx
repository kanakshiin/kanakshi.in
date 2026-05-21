"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { loginCustomer, storeCustomerToken } from "../../../lib/customer-auth";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await loginCustomer({ email, password });
      storeCustomerToken(data.token);
      router.push("/account");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to login.";
      setError(message);
      if (message.toLowerCase().includes("verify your email")) {
        router.push(`/account/verify-email?email=${encodeURIComponent(email)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-section auth-page">
      <div className="container">
        <section className="auth-card">
          <small className="eyebrow">Customer Login</small>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-muted">Login to view your account, saved details, and future orders.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Signing In…" : "Login"}
            </button>
          </form>
          <div className="auth-link-row">
            <Link href="/account/forgot-password" className="text-link">Forgot Password</Link>
            <Link href="/account/register" className="text-link">Create Account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
