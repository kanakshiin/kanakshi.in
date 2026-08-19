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
    <main className="content-section" style={{ minHeight: "85vh", padding: "3rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "1020px", width: "100%", margin: "0 auto" }}>
        <div className="auth-card-shell">
          
          {/* Brand Experience Column (Shows on top on desktop, bottom on mobile) */}
          <div className="auth-experience-column">
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Kanakshi Privé Club
              </span>

              <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a", marginBottom: "1rem" }}>
                Welcome to the Atelier of Fine Jewellery
              </h2>

              <p style={{ color: "#555555", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Log in to access your order archives, manage delivery addresses, track live courier milestones, and redeem Kanakshi wallet cashback.
              </p>

              {/* Privé Features List */}
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(233, 113, 139, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b83253", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>Kanakshi Wallet Cash</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>Earn loyalty credits and post-purchase non-return cashbacks spendable at checkout.</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(212, 175, 55, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b08d20", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>7-Day Hassle-Free Returns</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>Easy doorstep pickup with 100% money-back guarantee post home trial.</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(233, 113, 139, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b83253", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>100% Certified Authenticity</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>BIS Hallmarked 925 Sterling Silver &amp; Ethical Lab-Grown Diamonds.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(233, 113, 139, 0.18)", paddingTop: "1.2rem", fontSize: "0.82rem", color: "#888888" }}>
              Encrypted 256-Bit SSL Protection · Verified Customer Portal
            </div>
          </div>

          {/* Form Column (Renders FIRST on mobile!) */}
          <div className="auth-form-column">
            <div style={{ marginBottom: "1.8rem" }}>
              <p className="eyebrow" style={{ color: "var(--kanakshi-pink, #e9718b)", letterSpacing: "1.5px", marginBottom: "0.3rem", fontWeight: 700 }}>Member Sign-In</p>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Welcome Back</h1>
              <p style={{ color: "#767676", fontSize: "0.92rem", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                Enter your credentials to securely access your customer account.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d", marginBottom: "0.4rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span>Email Address</span>
                </label>
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
                    width: "100%",
                    padding: "0.8rem 1rem",
                    borderRadius: "14px",
                    border: emailInvalid ? "1.5px solid #ef4444" : "1.5px solid var(--kanakshi-border-dark, #e0e0e0)",
                    background: "#ffffff",
                    fontSize: "0.95rem",
                    color: "#1a1a1a",
                    outline: "none"
                  }}
                />
                {emailInvalid && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>Enter a valid email like name@example.com.</p>}
              </div>

              <div>
                <PasswordField
                  label="Password"
                  value={password}
                  onChange={setPassword}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div style={{
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

              <button
                type="submit"
                disabled={loading}
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
                  gap: "8px",
                  marginTop: "0.5rem"
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                    <span>Signing In…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </button>
            </form>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.8rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid var(--kanakshi-border, #f0f0f0)",
              fontSize: "0.88rem"
            }}>
              <Link href="/account/forgot-password" style={{ color: "#767676", textDecoration: "none", transition: "color 0.2s ease" }}>
                Forgot Password?
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

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Kanakshi.in</p>
          <h2 className="auth-title">Preparing secure login…</h2>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
