"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAuction, fetchAuctionBids, placeBid, type Auction, type AuctionBid } from "../../../lib/auction-api";

function formatTimer(endAt: string) {
  const diff = new Date(endAt).getTime() - Date.now();
  if (diff <= 0) return { d: "00", h: "00", m: "00", s: "00", expired: true };
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d: String(d).padStart(2,"0"), h: String(h).padStart(2,"0"), m: String(m).padStart(2,"0"), s: String(s).padStart(2,"0"), expired: false };
}

function formatStart(startAt: string): string {
  const diff = new Date(startAt).getTime() - Date.now();
  if (diff <= 0) return "Starting soon";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `Starts in ${d}d ${h}h`;
  if (h > 0) return `Starts in ${h}h ${m}m`;
  return `Starts in ${m}m`;
}

export default function AuctionDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bidsData, setBidsData] = useState<{ bids: AuctionBid[]; total_bids: number; total_participants: number }>({
    bids: [], total_bids: 0, total_participants: 0
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [bidMsg, setBidMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [timer, setTimer] = useState({ d: "00", h: "00", m: "00", s: "00", expired: false });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("customer_token"));
    }
  }, []);

  const loadAuction = useCallback(async () => {
    const [a, b] = await Promise.all([fetchAuction(id), fetchAuctionBids(id)]);
    if (a) setAuction(a);
    setBidsData(b);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadAuction();
    const refresh = setInterval(loadAuction, 10000);
    return () => clearInterval(refresh);
  }, [loadAuction]);

  useEffect(() => {
    if (!auction || auction.status !== "live") return;
    const t = setInterval(() => setTimer(formatTimer(auction.end_at)), 1000);
    setTimer(formatTimer(auction.end_at));
    return () => clearInterval(t);
  }, [auction]);

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setBidMsg({ type: "err", text: "Please log in to place a bid." }); return; }
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) { setBidMsg({ type: "err", text: "Enter a valid bid amount." }); return; }
    setBidding(true); setBidMsg(null);
    const res = await placeBid(id, amount, token);
    setBidding(false);
    if (res.success) {
      setBidMsg({ type: "ok", text: res.message || "Bid placed successfully!" });
      setBidAmount("");
      loadAuction();
    } else {
      setBidMsg({ type: "err", text: res.message || "Bid failed. Please try again." });
    }
  };

  if (loading) return (
    <>
      <style>{`body{overflow:hidden}`}</style>
      <div className="ad-loading">
        <div className="ad-spinner" />
        <span>Loading auction…</span>
      </div>
    </>
  );

  if (!auction) return (
    <div className="ad-not-found">
      <h2>Auction Not Found</h2>
      <Link href="/live-auctions">← Back to Auctions</Link>
    </div>
  );

  const imgSrc = auction.image_url || (Array.isArray(auction.product?.images) ? auction.product!.images[0] : null);
  const isLive = auction.status === "live";
  const isEnded = auction.status === "ended";
  const isUpcoming = auction.status === "draft";
  const minBid = auction.minimum_next_bid;

  return (
    <>
      <style>{CSS}</style>
      <div className="ad-shell">
        {/* LEFT */}
        <aside className="ad-left">
          <div className="ad-left-inner">
            <Link href="/live-auctions" className="ad-back">← All Auctions</Link>

            <div className="ad-img-wrap">
              {imgSrc
                ? <img src={imgSrc} alt={auction.title} className="ad-img" />
                : <div className="ad-img-placeholder"><span>🏺</span></div>
              }
              <div className={`ad-status-pill ad-status-${auction.status}`}>
                {isLive && <span className="ad-pulse-dot" />}
                {isLive ? "LIVE" : isEnded ? "AUCTION ENDED" : "UPCOMING"}
              </div>
            </div>

            <h1 className="ad-title">{auction.title}</h1>
            {auction.product && <p className="ad-product-name">{auction.product.name}</p>}
            {auction.description && <p className="ad-desc">{auction.description}</p>}

            <div className="ad-info-grid">
              <div className="ad-info-item"><span>STARTING PRICE</span><strong>₹{auction.start_price.toLocaleString("en-IN")}</strong></div>
              <div className="ad-info-item"><span>MIN. INCREMENT</span><strong>₹{auction.min_bid_increment.toLocaleString("en-IN")}</strong></div>
              <div className="ad-info-item"><span>TOTAL BIDS</span><strong>{bidsData.total_bids}</strong></div>
              <div className="ad-info-item"><span>PARTICIPANTS</span><strong>{bidsData.total_participants}</strong></div>
            </div>
          </div>
        </aside>

        {/* RIGHT */}
        <main className="ad-right">
          <div className="ad-right-inner">
            {/* Current bid + timer */}
            <div className="ad-bid-display">
              <div>
                <p className="ad-bid-label">CURRENT HIGHEST BID</p>
                <p className="ad-bid-value">₹{auction.current_bid.toLocaleString("en-IN")}</p>
              </div>
              {isLive && (
                <div className="ad-timer">
                  <p className="ad-timer-label">TIME REMAINING</p>
                  <div className="ad-timer-blocks">
                    {(["d", "h", "m", "s"] as const).map(unit => (
                      <div key={unit} className="ad-timer-block">
                        <strong>{timer[unit]}</strong>
                        <span>{unit === "d" ? "DAYS" : unit === "h" ? "HRS" : unit === "m" ? "MIN" : "SEC"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isUpcoming && (
                <div>
                  <p className="ad-timer-label">STATUS</p>
                  <p className="ad-upcoming-text">{formatStart(auction.start_at)}</p>
                </div>
              )}
              {isEnded && (
                <div>
                  <p className="ad-timer-label">RESULT</p>
                  <p className="ad-ended-text">Auction Closed</p>
                </div>
              )}
            </div>

            {/* Winner */}
            {isEnded && auction.winner && (
              <div className="ad-winner-block">
                <div className="ad-winner-icon">🏆</div>
                <div>
                  <p className="ad-winner-label">WINNING BID</p>
                  <p className="ad-winner-amount">₹{auction.winner.bid.toLocaleString("en-IN")}</p>
                </div>
              </div>
            )}

            {/* Bid form */}
            {isLive && (
              <div className="ad-bid-form-wrap">
                {token ? (
                  <form onSubmit={submitBid} className="ad-bid-form">
                    <div className="ad-bid-input-row">
                      <div className="ad-bid-prefix">₹</div>
                      <input
                        type="number"
                        className="ad-bid-input"
                        placeholder={`Min ₹${minBid.toLocaleString("en-IN")}`}
                        value={bidAmount}
                        onChange={e => setBidAmount(e.target.value)}
                        min={minBid}
                        step={auction.min_bid_increment}
                        required
                      />
                    </div>
                    <p className="ad-bid-hint">Minimum bid: ₹{minBid.toLocaleString("en-IN")} (increment: ₹{auction.min_bid_increment.toLocaleString("en-IN")})</p>
                    {bidMsg && (
                      <div className={`ad-msg ${bidMsg.type === "ok" ? "ad-msg-ok" : "ad-msg-err"}`}>
                        {bidMsg.type === "ok" ? "✓" : "⚠"} {bidMsg.text}
                      </div>
                    )}
                    <button type="submit" disabled={bidding} className="ad-bid-btn">
                      {bidding ? <><span className="ad-spinner-sm" /> Placing Bid…</> : "🔨 PLACE BID"}
                    </button>
                    <button
                      type="button"
                      className="ad-quick-btn"
                      onClick={() => setBidAmount(String(Math.ceil(minBid / 100) * 100))}
                    >
                      Quick Bid ₹{Math.ceil(minBid / 100) * 100}
                    </button>
                  </form>
                ) : (
                  <div className="ad-login-gate">
                    <div className="ad-login-icon">🔒</div>
                    <p>You must be logged in to place bids on this auction.</p>
                    <Link href={`/account/login?redirect=/live-auctions/${id}`} className="ad-login-btn">Login to Bid</Link>
                    <Link href="/account/register" className="ad-register-link">Don't have an account? Register →</Link>
                  </div>
                )}
              </div>
            )}

            {isUpcoming && !token && (
              <div className="ad-login-gate">
                <p>Login to get notified when this auction goes live.</p>
                <Link href={`/account/login?redirect=/live-auctions/${id}`} className="ad-login-btn">Login</Link>
              </div>
            )}

            {/* Bid history */}
            <div className="ad-bids-section">
              <h3 className="ad-bids-title">
                <span>Recent Bids</span>
                <span className="ad-bids-count">{bidsData.total_bids} total</span>
              </h3>
              {bidsData.bids.length === 0 ? (
                <p className="ad-bids-empty">No bids yet — be the first to bid!</p>
              ) : (
                <div className="ad-bids-list">
                  {bidsData.bids.map((bid, i) => (
                    <div key={i} className={`ad-bid-row${bid.is_winning ? " ad-bid-row--winning" : ""}`}>
                      <div className="ad-bid-rank">#{i + 1}</div>
                      <div className="ad-bid-name">{bid.masked_name}</div>
                      <div className="ad-bid-placed">{bid.placed_at}</div>
                      <div className="ad-bid-amount">
                        ₹{bid.amount.toLocaleString("en-IN")}
                        {bid.is_winning && <span className="ad-winning-badge">🏆</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const CSS = `
  body:has(.ad-shell) { overflow: hidden; }
  body:has(.ad-shell) .site-footer, body:has(.ad-shell) .whatsapp-float-widget { display: none !important; }

  .ad-shell {
    display: grid;
    grid-template-columns: 45% 55%;
    height: calc(100dvh - 80px);
    overflow: hidden;
    font-family: "Josefin Sans", Arial, sans-serif;
    background: #f7f2ea;
  }
  .ad-left {
    overflow-y: auto;
    padding: 2rem 2.5rem 2rem 2rem;
    background: #f7f2ea;
    border-right: 1px solid rgba(241,167,32,0.2);
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
  }
  .ad-left-inner { max-width: 460px; }
  .ad-back {
    display: inline-flex; align-items: center;
    font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
    color: #9a8a7a; text-decoration: none; margin-bottom: 1.25rem; transition: color 0.2s;
  }
  .ad-back:hover { color: #191919; }
  .ad-img-wrap {
    position: relative; border-radius: 12px; overflow: hidden;
    aspect-ratio: 4/3; margin-bottom: 1.25rem; background: #e9dfd1;
  }
  .ad-img { width: 100%; height: 100%; object-fit: cover; }
  .ad-img-placeholder {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #f3ece2, #e9dfd1); font-size: 5rem;
  }
  .ad-status-pill {
    position: absolute; top: 12px; left: 12px;
    display: inline-flex; align-items: center; gap: 0.4rem;
    padding: 0.4rem 0.85rem; border-radius: 999px;
    font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em;
  }
  .ad-status-live { background: rgba(220,38,38,0.9); color: #fff; }
  .ad-status-draft { background: rgba(37,99,235,0.9); color: #fff; }
  .ad-status-ended { background: rgba(0,0,0,0.6); color: #fff; }
  .ad-pulse-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #fff;
    display: inline-block; animation: ad-pulse 1.4s ease-in-out infinite; flex-shrink: 0;
  }
  @keyframes ad-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.75)} }
  .ad-title { font-size: 1.5rem; font-family: Georgia,serif; font-weight: 400; color: #191919; margin: 0 0 0.35rem; line-height: 1.2; }
  .ad-product-name { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #9a8a7a; font-weight: 700; margin: 0 0 1rem; }
  .ad-desc { font-size: 0.85rem; line-height: 1.7; color: #5a4a38; margin: 0 0 1.25rem; }
  .ad-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .ad-info-item {
    background: #fff; border: 1px solid rgba(241,167,32,0.2); border-radius: 8px;
    padding: 0.65rem 0.85rem; display: flex; flex-direction: column; gap: 0.2rem;
  }
  .ad-info-item span { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9a8a7a; }
  .ad-info-item strong { font-size: 1rem; color: #191919; font-weight: 800; }
  .ad-right { overflow-y: auto; background: #fff; scrollbar-width: thin; scrollbar-color: #ddd transparent; }
  .ad-right-inner { padding: 2rem 2.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .ad-bid-display {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
    background: #f7f2ea; border: 1px solid rgba(241,167,32,0.3); border-radius: 12px; padding: 1.25rem 1.5rem;
  }
  .ad-bid-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9a8a7a; margin: 0 0 0.35rem; }
  .ad-bid-value { font-size: 2rem; font-weight: 800; color: #191919; margin: 0; letter-spacing: -0.02em; font-family: Georgia,serif; }
  .ad-timer { text-align: right; }
  .ad-timer-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #9a8a7a; margin: 0 0 0.5rem; }
  .ad-timer-blocks { display: flex; gap: 0.5rem; }
  .ad-timer-block { display: flex; flex-direction: column; align-items: center; background: #191919; border-radius: 6px; padding: 0.5rem 0.6rem; min-width: 44px; }
  .ad-timer-block strong { font-size: 1.2rem; font-weight: 800; color: #f1a720; font-family: "Courier New",monospace; line-height: 1; }
  .ad-timer-block span { font-size: 0.5rem; font-weight: 800; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); margin-top: 0.2rem; }
  .ad-upcoming-text, .ad-ended-text { font-size: 1rem; font-weight: 800; color: #191919; margin: 0; }
  .ad-winner-block { display: flex; align-items: center; gap: 1rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 1rem 1.25rem; }
  .ad-winner-icon { font-size: 2rem; }
  .ad-winner-label { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: #16a34a; margin: 0 0 0.2rem; }
  .ad-winner-amount { font-size: 1.5rem; font-weight: 800; color: #15803d; margin: 0; font-family: Georgia,serif; }
  .ad-bid-form-wrap { background: #fdfaf6; border: 1px solid rgba(241,167,32,0.25); border-radius: 12px; padding: 1.25rem 1.5rem; }
  .ad-bid-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .ad-bid-input-row { display: flex; align-items: center; border: 1.5px solid #d9cfc4; border-radius: 6px; overflow: hidden; background: #fff; transition: border-color 0.2s; }
  .ad-bid-input-row:focus-within { border-color: #f1a720; }
  .ad-bid-prefix { padding: 0 0.85rem; font-size: 1.2rem; font-weight: 700; color: #9a8a7a; background: #f9f6f1; border-right: 1px solid #e9dfd1; align-self: stretch; display: flex; align-items: center; }
  .ad-bid-input { border: none; outline: none; padding: 0.85rem 1rem; font-size: 1.1rem; font-weight: 700; width: 100%; font-family: inherit; background: transparent; color: #191919; }
  .ad-bid-hint { font-size: 0.73rem; color: #9a8a7a; margin: 0; }
  .ad-msg { border-radius: 6px; padding: 0.6rem 0.85rem; font-size: 0.82rem; font-weight: 600; }
  .ad-msg-ok { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
  .ad-msg-err { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
  .ad-bid-btn { background: #191919; color: #fff; border: none; border-radius: 6px; padding: 1rem; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s, color 0.2s; font-family: inherit; width: 100%; }
  .ad-bid-btn:hover { background: #f1a720; color: #191919; }
  .ad-bid-btn:disabled { background: #9a8a7a; cursor: not-allowed; }
  .ad-quick-btn { background: transparent; border: 1px solid #d9cfc4; border-radius: 6px; padding: 0.65rem; font-size: 0.78rem; font-weight: 700; color: #5a4a38; cursor: pointer; transition: all 0.2s; font-family: inherit; width: 100%; }
  .ad-quick-btn:hover { border-color: #f1a720; color: #191919; }
  .ad-login-gate { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; text-align: center; background: #fdfaf6; border: 1px dashed rgba(241,167,32,0.4); border-radius: 12px; padding: 2rem 1.5rem; }
  .ad-login-icon { font-size: 2.5rem; }
  .ad-login-gate p { font-size: 0.88rem; color: #5a4a38; margin: 0; line-height: 1.6; max-width: 280px; }
  .ad-login-btn { background: #191919; color: #fff; border: none; border-radius: 6px; padding: 0.8rem 1.5rem; font-size: 0.78rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; text-decoration: none; display: inline-block; transition: background 0.2s, color 0.2s; }
  .ad-login-btn:hover { background: #f1a720; color: #191919; }
  .ad-register-link { font-size: 0.78rem; color: #9a8a7a; text-decoration: none; }
  .ad-register-link:hover { color: #191919; }
  .ad-bids-section { flex: 1; }
  .ad-bids-title { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; font-weight: 800; color: #191919; margin: 0 0 0.85rem; letter-spacing: 0.02em; }
  .ad-bids-count { font-size: 0.72rem; color: #9a8a7a; font-weight: 600; }
  .ad-bids-empty { font-size: 0.83rem; color: #9a8a7a; text-align: center; padding: 2rem 0; }
  .ad-bids-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .ad-bid-row { display: grid; grid-template-columns: 32px 1fr 1fr auto; align-items: center; gap: 0.75rem; padding: 0.6rem 0.85rem; border-radius: 6px; background: #fdfaf6; font-size: 0.82rem; }
  .ad-bid-row--winning { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .ad-bid-rank { font-size: 0.7rem; font-weight: 800; color: #9a8a7a; text-align: center; }
  .ad-bid-name { font-weight: 700; color: #191919; font-family: "Courier New",monospace; }
  .ad-bid-placed { color: #9a8a7a; font-size: 0.75rem; }
  .ad-bid-amount { font-weight: 800; color: #191919; text-align: right; display: flex; align-items: center; gap: 0.35rem; justify-content: flex-end; }
  .ad-winning-badge { font-size: 0.9rem; }
  .ad-spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: ad-spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }
  @keyframes ad-spin { to { transform: rotate(360deg); } }
  .ad-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100dvh - 80px); gap: 1rem; font-size: 0.9rem; color: #9a8a7a; background: #f7f2ea; font-family: "Josefin Sans",Arial,sans-serif; }
  .ad-spinner { width: 40px; height: 40px; border: 3px solid #e9dfd1; border-top-color: #f1a720; border-radius: 50%; animation: ad-spin 0.8s linear infinite; }
  .ad-not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100dvh - 80px); gap: 1rem; font-family: Georgia,serif; color: #191919; background: #f7f2ea; }
  .ad-not-found h2 { font-size: 1.8rem; font-weight: 400; margin: 0; }
  .ad-not-found a { color: #f1a720; font-size: 0.88rem; font-family: "Josefin Sans",sans-serif; text-decoration: none; font-weight: 700; }
  @media (max-width: 768px) {
    body:has(.ad-shell) { overflow: auto; }
    .ad-shell { grid-template-columns: 1fr; height: auto; overflow: visible; }
    .ad-left { padding: 1.5rem; border-right: none; border-bottom: 1px solid rgba(241,167,32,0.2); }
    .ad-right-inner { padding: 1.5rem; }
    .ad-bid-display { flex-direction: column; }
    .ad-timer { text-align: left; }
    .ad-bid-row { grid-template-columns: 24px 1fr auto; }
    .ad-bid-placed { display: none; }
  }
`;
