const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "https://ecombeckend.saaszo.in/api/v1";

export interface Auction {
  id: number;
  title: string;
  status: "live" | "draft" | "ended" | "cancelled";
  image_url: string | null;
  start_price: number;
  current_bid: number;
  minimum_next_bid: number;
  min_bid_increment: number;
  start_at: string;
  end_at: string;
  seconds_left: number;
  total_bids: number;
  total_participants: number;
  product: { id: number; name: string; slug: string; images?: any; description?: string } | null;
  description?: string;
  winner?: { bid: number } | null;
}

export interface AuctionBid {
  masked_name: string;
  amount: number;
  is_winning: boolean;
  placed_at: string;
}

export async function fetchAuctions(filter = "all"): Promise<Auction[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions?filter=${filter}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.auctions : [];
  } catch { return []; }
}

export async function fetchAuction(id: number): Promise<Auction | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${id}`, { cache: "no-store" });
    const data = await res.json();
    return data.success ? data.auction : null;
  } catch { return null; }
}

export async function fetchAuctionBids(id: number): Promise<{ bids: AuctionBid[]; total_bids: number; total_participants: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${id}/bids`, { cache: "no-store" });
    const data = await res.json();
    return data.success
      ? { bids: data.bids, total_bids: data.total_bids, total_participants: data.total_participants }
      : { bids: [], total_bids: 0, total_participants: 0 };
  } catch { return { bids: [], total_bids: 0, total_participants: 0 }; }
}

export async function placeBid(auctionId: number, amount: number, token: string): Promise<{
  success: boolean;
  message: string;
  current_bid?: number;
  minimum_next_bid?: number;
  total_bids?: number;
  total_participants?: number;
  seconds_left?: number;
  minimum_bid?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/auctions/${auctionId}/bid`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ amount }),
      cache: "no-store",
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e?.message || "Bid failed. Check your connection." };
  }
}
