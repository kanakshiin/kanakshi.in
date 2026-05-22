"use client";

import { FormEvent, useState } from "react";

export function FooterNewsletterForm({ email }: { email: string }) {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!valid) {
      setMessage("Please enter a valid email address.");
      return;
    }

    const subject = encodeURIComponent("Newsletter subscription request");
    const body = encodeURIComponent(
      `Please add this email to the Little Divinity newsletter list:\n\n${trimmed}`,
    );

    setMessage("Opening your email app to confirm subscription.");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <form className="footer-newsletter-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your e-mail"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Email address"
          required
        />
        <button type="submit">Join</button>
      </form>
      {message ? (
        <p style={{ marginTop: "0.7rem", fontSize: "0.9rem", color: "rgba(var(--rgb-text), 0.68)" }}>
          {message}
        </p>
      ) : null}
    </>
  );
}
