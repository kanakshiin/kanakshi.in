"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { clearCustomerToken, fetchCurrentCustomer, getStoredCustomerToken, logoutCustomer } from "../../lib/customer-auth";
import { CustomerUser } from "../../lib/types";

export default function AccountPage() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredCustomerToken();

    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentCustomer(token)
      .then((customer) => {
        setUser(customer);
        setError(null);
      })
      .catch((err: Error) => {
        clearCustomerToken();
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    const token = getStoredCustomerToken();

    if (token) {
      try {
        await logoutCustomer(token);
      } catch {
        // Ignore logout transport errors and clear the local session anyway.
      }
    }

    clearCustomerToken();
    window.location.href = "/account/login";
  }

  return (
    <main className="content-section auth-page">
      <div className="container">
        <section className="auth-card auth-wide-card">
          <small className="eyebrow">Customer Account</small>
          <h1 className="auth-title">Account</h1>
          {loading ? <p className="auth-muted">Loading your account…</p> : null}
          {!loading && !user ? (
            <div className="auth-stack">
              <p className="auth-muted">{error || "You are not logged in yet."}</p>
              <div className="auth-link-row">
                <Link href="/account/login" className="primary-button">Login</Link>
                <Link href="/account/register" className="secondary-button">Create Account</Link>
              </div>
            </div>
          ) : null}
          {!loading && user ? (
            <div className="auth-stack">
              <div className="account-summary-grid">
                <div className="account-summary-card">
                  <span>Name</span>
                  <strong>{user.name}</strong>
                </div>
                <div className="account-summary-card">
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
                <div className="account-summary-card">
                  <span>Phone</span>
                  <strong>{user.phone || "Not added yet"}</strong>
                </div>
                <div className="account-summary-card">
                  <span>Email Status</span>
                  <strong>{user.email_verified_at ? "Verified" : "Pending verification"}</strong>
                </div>
              </div>
              <button type="button" className="secondary-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
