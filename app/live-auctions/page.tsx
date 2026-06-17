"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchAuctions, type Auction } from "../../lib/auction-api";
import { getStoredCustomerToken } from "../../lib/customer-auth";

type Filter = "all" | "live" | "upcoming" | "ended";

function formatCountdown(endAt: string, status: string): string {
  if (status === "ended") return "AUCTION ENDED";
  if (status !== "live") return "UPCOMING";
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return "ENDING...";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h left`;
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function AuctionCard({ auction }: { auction: Auction }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (auction.status !== "live") return;
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [auction.status]);

  const countdown = formatCountdown(auction.end_at, auction.status);
  const imgSrc = auction.image_url || (Array.isArray(auction.product?.images) ? auction.product!.images[0] : null);

  return (
    <Link href={`/live-auctions/${auction.id}`} className="la-card">
      <div className="la-card-img">
        {imgSrc ? (
          <img src={imgSrc} alt={auction.title} />
        ) : (
          <div className="la-card-placeholder"><span>🏺</span></div>
        )}
        <div className={`la-status-badge la-status-${auction.status}`}>
          {auction.status === "live" && <span className="la-live-dot" />}
          {auction.status === "live" ? "LIVE" : auction.status === "draft" ? "UPCOMING" : "ENDED"}
        </div>
      </div>
      <div className="la-card-body">
        <p className="la-card-title">{auction.title}</p>
        {auction.product && <p className="la-card-sub">{auction.product.name}</p>}
        <div className="la-card-bid">
          <div>
            <span className="la-bid-label">CURRENT BID</span>
            <strong className="la-bid-amount">₹{auction.current_bid.toLocaleString("en-IN")}</strong>
          </div>
          <div className="la-countdown">
            {auction.status === "live" && <span className="la-countdown-label">TIME LEFT</span>}
            <span className={`la-countdown-val${auction.status === "live" ? " la-countdown-live" : ""}`}>
              {countdown}
            </span>
          </div>
        </div>
        <div className="la-card-meta">
          <span><strong>{auction.total_bids}</strong> bids</span>
          <span><strong>{auction.total_participants}</strong> bidders</span>
        </div>
        <div className={`la-card-btn${auction.status === "ended" ? " la-card-btn--muted" : ""}`}>
          {auction.status === "ended" ? "View Results" : auction.status === "live" ? "Place a Bid →" : "View Auction →"}
        </div>
      </div>
    </Link>
  );
}

export default function LiveAuctionsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchAuctions(filter);
    setAuctions(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!getStoredCustomerToken());
    }
    setLoading(true);
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const liveCount = auctions.filter(a => a.status === "live").length;

  return (
    <>
      <style>{CSS}</style>
      <div className="la-page">
        <div className="la-hero">
          <div className="la-hero-inner">
            <p className="la-hero-eyebrow">🔨 AUTHENTICATED ONE-OF-ONE BRASS AUCTIONS</p>
            <h1 className="la-hero-heading">Live Auctions</h1>
            <p className="la-hero-sub">Rare handcrafted brass artifacts auctioned to the highest bidder. Each piece verified and authenticated by Kanakshi.in ateliers.</p>
            {liveCount > 0 && (
              <div className="la-live-ticker">
                <span className="la-live-dot" />
                {liveCount} auction{liveCount > 1 ? "s" : ""} live right now
              </div>
            )}
          </div>
        </div>

        {!hasToken && (
          <div className="la-auth-banner">
            <span>🔒 <strong>Login required</strong> to place bids and participate in auctions.</span>
            <Link href="/account/login?redirect=/live-auctions" className="la-auth-btn">Login / Register</Link>
          </div>
        )}

        <div className="la-container">
          <div className="la-filters">
            {(["all", "live", "upcoming", "ended"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`la-filter-btn${filter === f ? " la-filter-btn--active" : ""}`}
              >
                {f === "all" ? "All Auctions" : f === "live" ? "🔴 Live Now" : f === "upcoming" ? "🕐 Upcoming" : "✓ Ended"}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="la-loading">
              <div className="la-spinner" />
              <span>Loading auctions…</span>
            </div>
          ) : auctions.length === 0 ? (
            <div className="la-empty">
              <div className="la-empty-icon">🔨</div>
              <h3>No auctions {filter !== "all" ? `in "${filter}"` : "yet"}</h3>
              <p>Check back soon. New one-of-one pieces drop regularly.</p>
            </div>
          ) : (
            <div className="la-grid">
              {auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const CSS = `
  .la-page {
    min-height: 100vh;
    background: #f7f2ea;
    font-family: "Josefin Sans", Arial, sans-serif;
  }
  .la-hero {
    background: linear-gradient(135deg, #191919 0%, #2d2d2d 50%, #191919 100%);
    color: #fff;
    padding: 4rem 1.5rem 3.5rem;
    position: relative;
    overflow: hidden;
  }
  .la-hero::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 70% 50%, rgba(241,167,32,0.18), transparent 60%);
    pointer-events: none;
  }
  .la-hero-inner {
    max-width: 860px;
    margin: 0 auto;
    position: relative;
  }
  .la-hero-eyebrow {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f1a720;
    margin: 0 0 1rem;
  }
  .la-hero-heading {
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-family: Georgia, serif;
    font-weight: 400;
    margin: 0 0 1rem;
    color: #fff;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }
  .la-hero-sub {
    font-size: 1rem;
    color: rgba(255,255,255,0.72);
    max-width: 560px;
    line-height: 1.7;
    margin: 0 0 1.5rem;
  }
  .la-live-ticker {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(241,167,32,0.15);
    border: 1px solid rgba(241,167,32,0.3);
    border-radius: 999px;
    padding: 0.5rem 1rem;
    font-size: 0.82rem;
    font-weight: 700;
    color: #f1a720;
    letter-spacing: 0.04em;
  }
  .la-auth-banner {
    background: #fff8e6;
    border-bottom: 1px solid rgba(241,167,32,0.3);
    padding: 0.85rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    font-size: 0.88rem;
    color: #191919;
    flex-wrap: wrap;
  }
  .la-auth-btn {
    background: #191919;
    color: #fff;
    border-radius: 4px;
    padding: 0.5rem 1.2rem;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.2s;
    display: inline-block;
  }
  .la-auth-btn:hover { background: #f1a720; color: #191919; }
  .la-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }
  .la-filters {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  .la-filter-btn {
    background: #fff;
    border: 1px solid #ddd7cd;
    border-radius: 999px;
    padding: 0.55rem 1.3rem;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #5a4a38;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  .la-filter-btn:hover { border-color: #f1a720; color: #191919; }
  .la-filter-btn--active { background: #191919; color: #fff; border-color: #191919; }
  .la-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  .la-card {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    transition: transform 0.2s, box-shadow 0.2s;
    border: 1px solid rgba(0,0,0,0.06);
  }
  .la-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.1);
  }
  .la-card-img {
    position: relative;
    aspect-ratio: 4/3;
    overflow: hidden;
    background: #f3ece2;
  }
  .la-card-img img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s;
  }
  .la-card:hover .la-card-img img { transform: scale(1.04); }
  .la-card-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f3ece2, #e9dfd1);
    font-size: 4rem;
  }
  .la-status-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .la-status-live { background: rgba(220,38,38,0.9); color: #fff; }
  .la-status-draft { background: rgba(37,99,235,0.9); color: #fff; }
  .la-status-ended { background: rgba(0,0,0,0.5); color: #fff; }
  .la-status-cancelled { background: rgba(100,100,100,0.7); color: #fff; }
  .la-live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #fff;
    display: inline-block;
    animation: la-pulse 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes la-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
  .la-card-body {
    padding: 1.1rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }
  .la-card-title { font-size: 0.95rem; font-weight: 700; color: #191919; line-height: 1.35; margin: 0; }
  .la-card-sub { font-size: 0.75rem; color: #9a8a7a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .la-card-bid { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 0.25rem; }
  .la-bid-label { display: block; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9a8a7a; margin-bottom: 0.15rem; }
  .la-bid-amount { font-size: 1.25rem; font-weight: 800; color: #191919; letter-spacing: -0.01em; }
  .la-countdown { text-align: right; }
  .la-countdown-label { display: block; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9a8a7a; margin-bottom: 0.15rem; }
  .la-countdown-val { font-size: 0.88rem; font-weight: 800; color: #5a4a38; font-family: "Courier New", monospace; }
  .la-countdown-live { color: #dc2626; }
  .la-card-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #9a8a7a; }
  .la-card-btn {
    margin-top: auto;
    background: #191919;
    color: #fff;
    border-radius: 4px;
    padding: 0.7rem 1rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
    transition: background 0.2s, color 0.2s;
  }
  .la-card:hover .la-card-btn { background: #f1a720; color: #191919; }
  .la-card-btn--muted { background: #f3ece2; color: #9a8a7a; }
  .la-card:hover .la-card-btn--muted { background: #e9dfd1; color: #5a4a38; }
  .la-loading { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 5rem 0; color: #9a8a7a; font-size: 0.9rem; }
  .la-spinner { width: 36px; height: 36px; border: 3px solid #e9dfd1; border-top-color: #f1a720; border-radius: 50%; animation: la-spin 0.8s linear infinite; }
  @keyframes la-spin { to { transform: rotate(360deg); } }
  .la-empty { text-align: center; padding: 5rem 0; color: #9a8a7a; }
  .la-empty-icon { font-size: 3rem; margin-bottom: 1rem; }
  .la-empty h3 { color: #191919; font-size: 1.3rem; margin: 0 0 0.5rem; font-family: Georgia, serif; font-weight: 400; }
  .la-empty p { font-size: 0.88rem; line-height: 1.6; max-width: 360px; margin: 0 auto; }
  @media (max-width: 1024px) { .la-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 640px) {
    .la-grid { grid-template-columns: 1fr; }
    .la-hero { padding: 2.5rem 1.25rem 2rem; }
    .la-hero-heading { font-size: 2.2rem; }
  }
`;
