"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { loginCustomer, storeCustomerToken } from "../../../lib/customer-auth";
import { isValidEmailInput, normalizeEmailInput } from "../../../lib/form-inputs";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");
  const emailInvalid = email.length > 0 && !isValidEmailInput(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailInvalid) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loginCustomer({ email: normalizeEmailInput(email), password });
      storeCustomerToken(data.token);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to login.";
      setError(message);
      if (message.toLowerCase().includes("verify your email")) {
        router.push(`/account/verify-email?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirect)}`);
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
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                className={emailInvalid ? "input-invalid" : ""}
                aria-invalid={emailInvalid}
                value={email}
                onChange={(event) => setEmail(normalizeEmailInput(event.target.value))}
                placeholder="name@example.com"
                required
              />
              {emailInvalid ? <p className="auth-field-error">Enter a valid email like `name@example.com`.</p> : null}
            </label>
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
            />
            {error ? <p className="auth-error">{error}</p> : null}
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Signing In…" : "Login"}
            </button>
          </form>
          <div className="auth-link-row">
            <Link href="/account/forgot-password" className="text-link">Forgot Password</Link>
            <Link href={`/account/register?redirect=${encodeURIComponent(redirect)}`} className="text-link">Create Account</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Little Divinity</p>
          <h2 className="auth-title">Preparing secure login…</h2>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
