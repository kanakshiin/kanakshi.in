"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { fetchCustomerAuthConfig, registerCustomer } from "../../../lib/customer-auth";
import { formatIndianPhone, isValidEmailInput, normalizeEmailInput, normalizeIndianPhone } from "../../../lib/form-inputs";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [helper, setHelper] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");
  const emailInvalid = form.email.length > 0 && !isValidEmailInput(form.email);
  const phoneInvalid = form.phone.length > 0 && form.phone.length < 10;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (emailInvalid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.phone && form.phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    setHelper(null);

    try {
      await fetchCustomerAuthConfig();
      const data = await registerCustomer({
        ...form,
        email: normalizeEmailInput(form.email),
        phone: normalizeIndianPhone(form.phone),
      });
      if (data.requires_verification) {
        router.push(`/account/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }

      setHelper("Account created successfully. You can log in now.");
      router.push(`/account/login?redirect=${encodeURIComponent(redirect)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="content-section auth-page">
      <div className="container">
        <section className="auth-card auth-wide-card">
          <small className="eyebrow">Create Account</small>
          <h1 className="auth-title">Start Your Little Divinity Account</h1>
          <p className="auth-muted">Use your email to create a customer account. Verification rules follow the admin-configured settings.</p>
          <form className="auth-form auth-grid-form" onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Full Name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                spellCheck={false}
                className={emailInvalid ? "input-invalid" : ""}
                aria-invalid={emailInvalid}
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: normalizeEmailInput(event.target.value) }))}
                placeholder="name@example.com"
                required
              />
              {emailInvalid ? <p className="auth-field-error">Enter a valid email like `name@example.com`.</p> : null}
            </label>
            <label className="auth-field">
              <span>Phone</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                maxLength={11}
                className={phoneInvalid ? "input-invalid" : ""}
                aria-invalid={phoneInvalid}
                value={formatIndianPhone(form.phone)}
                onChange={(event) =>
                  setForm((current) => ({ ...current, phone: normalizeIndianPhone(event.target.value) }))
                }
                placeholder="10-digit mobile number"
              />
              {phoneInvalid ? <p className="auth-field-error">Use a valid 10-digit Indian mobile number.</p> : null}
            </label>
            <PasswordField
              label="Password"
              value={form.password}
              onChange={(value) => setForm((current) => ({ ...current, password: value }))}
              required
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm Password"
              value={form.password_confirmation}
              onChange={(value) => setForm((current) => ({ ...current, password_confirmation: value }))}
              required
              autoComplete="new-password"
            />
            <div className="auth-field auth-field-note">
              <span>Password Rule</span>
              <p>Use at least 8 characters with uppercase, lowercase, and a number.</p>
            </div>
            {error ? <p className="auth-error auth-grid-span">{error}</p> : null}
            {helper ? <p className="auth-success auth-grid-span">{helper}</p> : null}
            <div className="auth-grid-span">
              <button type="submit" className="primary-button" disabled={loading}>
                {loading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
          <div className="auth-link-row">
            <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} className="text-link">Already have an account?</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Little Divinity</p>
          <h2 className="auth-title">Preparing secure registration…</h2>
        </div>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}
