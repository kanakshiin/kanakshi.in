"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState, Suspense } from "react";

import { PasswordField } from "../../../components/account/password-field";
import { sanitizeRedirectPath } from "../../../lib/auth-redirect";
import { fetchCustomerAuthConfig, registerCustomer } from "../../../lib/customer-auth";
import { formatIndianPhone, isValidEmailInput, normalizeEmailInput, normalizeIndianPhone } from "../../../lib/form-inputs";
import { WalletConfig } from "../../../lib/types";

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
  const [walletConfig, setWalletConfig] = useState<WalletConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helper, setHelper] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");
  const emailInvalid = form.email.length > 0 && !isValidEmailInput(form.email);
  const phoneInvalid = form.phone.length > 0 && form.phone.length < 10;

  useEffect(() => {
    fetchCustomerAuthConfig()
      .then((cfg) => {
        if (cfg.wallet) {
          setWalletConfig(cfg.wallet);
        }
      })
      .catch(() => {});
  }, []);

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
      const data = await registerCustomer({
        ...form,
        email: normalizeEmailInput(form.email),
        phone: normalizeIndianPhone(form.phone),
      });
      if (data.requires_verification) {
        router.push(`/account/verify-email?email=${encodeURIComponent(form.email)}&redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      setHelper("Account created successfully with your welcome wallet bonus! You can log in now.");
      router.push(`/account/login?redirect=${encodeURIComponent(redirect)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setLoading(false);
    }
  }

  const signupBonus = walletConfig?.signup_bonus_amount ?? 500;

  return (
    <main className="content-section" style={{ minHeight: "85vh", padding: "3rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "1080px", width: "100%", margin: "0 auto" }}>
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
                Join Kanakshi Privé
              </span>

              <h2 style={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.25, color: "#1a1a1a", marginBottom: "1rem" }}>
                Create Your Account &amp; Unlock Welcome Rewards
              </h2>

              <p style={{ color: "#555555", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.8rem" }}>
                Join India&apos;s premier certified fine jewellery circle. Enjoy member-exclusive pricing, priority concierge service, and instant wallet rewards on every purchase.
              </p>

              {/* Dynamic Welcome Bonus Highlight Card */}
              {walletConfig?.signup_bonus_enabled !== false && signupBonus > 0 ? (
                <div style={{
                  padding: "1.2rem 1.4rem",
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, rgba(233, 113, 139, 0.12) 0%, rgba(212, 175, 55, 0.15) 100%)",
                  border: "1px solid rgba(212, 175, 55, 0.35)",
                  marginBottom: "2rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#b08d20", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.82rem" }}>
                      ₹
                    </div>
                    <strong style={{ color: "#92400e", fontSize: "1rem" }}>Instant ₹{signupBonus} Welcome Credit</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#451a03", lineHeight: 1.45 }}>
                    Sign up today and receive ₹{signupBonus} directly into your Kanakshi Cash wallet, spendable like real money across all fine jewellery collections!
                  </p>
                </div>
              ) : (
                <div style={{
                  padding: "1.2rem 1.4rem",
                  borderRadius: "18px",
                  background: "rgba(233, 113, 139, 0.08)",
                  border: "1px solid rgba(233, 113, 139, 0.25)",
                  marginBottom: "2rem"
                }}>
                  <strong style={{ color: "#b83253", fontSize: "0.98rem", display: "block", marginBottom: "4px" }}>
                    Exclusive Member Privileges
                  </strong>
                  <p style={{ margin: 0, fontSize: "0.84rem", color: "#555555", lineHeight: 1.45 }}>
                    Activate your personal account for seamless orders, insured 7-day home trials, and loyalty cashbacks on every non-returned order.
                  </p>
                </div>
              )}

              {/* Privé Pillars */}
              <div style={{ display: "grid", gap: "1.2rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(212, 175, 55, 0.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b08d20", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>7-Day Easy Returns &amp; Exchanges</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>Shop with absolute confidence with insured doorstep reverse pickups.</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(233, 113, 139, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#b83253", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <div>
                    <strong style={{ color: "#1a1a1a", fontSize: "0.92rem", display: "block" }}>Post-Purchase Non-Return Cashbacks</strong>
                    <span style={{ color: "#666666", fontSize: "0.84rem", lineHeight: 1.4, display: "block" }}>Earn extra wallet rewards on every successfully delivered, non-returned piece.</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "2.5rem", borderTop: "1px solid rgba(233, 113, 139, 0.18)", paddingTop: "1.2rem", fontSize: "0.82rem", color: "#888888" }}>
              100% Privacy Protected · Zero Spam Guaranteed
            </div>
          </div>

          {/* Form Column (Renders FIRST on mobile!) */}
          <div className="auth-form-column">
            <div style={{ marginBottom: "1.8rem" }}>
              <p className="eyebrow" style={{ color: "var(--kanakshi-pink, #e9718b)", letterSpacing: "1.5px", marginBottom: "0.3rem", fontWeight: 700 }}>New Registration</p>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Create Account</h1>
              <p style={{ color: "#767676", fontSize: "0.92rem", margin: "0.4rem 0 0", lineHeight: 1.5 }}>
                Fill in your details below to activate your member cockpit.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.2rem" }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d", marginBottom: "0.4rem" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="auth-input"
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem",
                    borderRadius: "14px",
                    border: "1.5px solid var(--kanakshi-border-dark, #e0e0e0)",
                    background: "#ffffff",
                    fontSize: "0.95rem",
                    color: "#1a1a1a",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
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
                    value={form.email}
                    onChange={(e) => setForm((c) => ({ ...c, email: normalizeEmailInput(e.target.value) }))}
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
                  {emailInvalid && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>Enter a valid email.</p>}
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", fontWeight: 600, color: "#2d2d2d", marginBottom: "0.4rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span>Mobile (Optional)</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    pattern="[6-9][0-9]{9}"
                    maxLength={11}
                    value={formatIndianPhone(form.phone)}
                    onChange={(e) => setForm((c) => ({ ...c, phone: normalizeIndianPhone(e.target.value) }))}
                    placeholder="10-digit mobile"
                    className="auth-input"
                    style={{
                      width: "100%",
                      padding: "0.8rem 1rem",
                      borderRadius: "14px",
                      border: phoneInvalid ? "1.5px solid #ef4444" : "1.5px solid var(--kanakshi-border-dark, #e0e0e0)",
                      background: "#ffffff",
                      fontSize: "0.95rem",
                      color: "#1a1a1a",
                      outline: "none"
                    }}
                  />
                  {phoneInvalid && <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: "0.3rem 0 0" }}>Use 10 digits.</p>}
                </div>
              </div>

              <div>
                <PasswordField
                  label="Password"
                  value={form.password}
                  onChange={(v) => setForm((c) => ({ ...c, password: v }))}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div>
                <PasswordField
                  label="Confirm Password"
                  value={form.password_confirmation}
                  onChange={(v) => setForm((c) => ({ ...c, password_confirmation: v }))}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div style={{
                padding: "0.7rem 0.9rem",
                borderRadius: "12px",
                background: "rgba(0, 0, 0, 0.02)",
                border: "1px solid var(--kanakshi-border, #f0f0f0)",
                fontSize: "0.82rem",
                color: "#767676",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>
                <span>Use at least 8 characters with uppercase, lowercase, and a number.</span>
              </div>

              {error && (
                <div style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  color: "#b91c1c",
                  fontSize: "0.88rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span>{error}</span>
                  </div>
                  {error.toLowerCase().includes("already registered") && (
                    <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "0.82rem" }}>
                      <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "underline" }}>
                        Sign In Directly →
                      </Link>
                      <Link href="/account/forgot-password" style={{ color: "#b91c1c", fontWeight: 700, textDecoration: "underline" }}>
                        Forgot Password?
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {helper && (
                <div style={{
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
                  <span>{helper}</span>
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
                  marginTop: "0.4rem"
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }} />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <span>
                      {walletConfig?.signup_bonus_enabled !== false && signupBonus > 0
                        ? `Create Account & Claim ₹${signupBonus}`
                        : "Create Account"}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </>
                )}
              </button>
            </form>

            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "1.8rem",
              paddingTop: "1.2rem",
              borderTop: "1px solid var(--kanakshi-border, #f0f0f0)",
              fontSize: "0.88rem",
              gap: "6px"
            }}>
              <span style={{ color: "#767676" }}>Already have an account?</span>
              <Link href={`/account/login?redirect=${encodeURIComponent(redirect)}`} style={{ color: "var(--kanakshi-pink, #e9718b)", fontWeight: 700, textDecoration: "none", transition: "color 0.2s ease" }}>
                Sign In Here →
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense fallback={
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Kanakshi.in</p>
          <h2 className="auth-title">Preparing secure registration…</h2>
        </div>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}
