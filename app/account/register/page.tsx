"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { fetchCustomerAuthConfig, registerCustomer } from "../../../lib/customer-auth";

export default function CustomerRegisterPage() {
  const router = useRouter();
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setHelper(null);

    try {
      await fetchCustomerAuthConfig();
      const data = await registerCustomer(form);
      if (data.requires_verification) {
        router.push(`/account/verify-email?email=${encodeURIComponent(form.email)}`);
        return;
      }

      setHelper("Account created successfully. You can log in now.");
      router.push("/account/login");
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
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label className="auth-field">
              <span>Phone</span>
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            </label>
            <label className="auth-field">
              <span>Confirm Password</span>
              <input type="password" value={form.password_confirmation} onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))} required />
            </label>
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
            <Link href="/account/login" className="text-link">Already have an account?</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
