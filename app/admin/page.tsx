import type { Metadata } from "next";
import { redirect } from "next/navigation";

const backendSite =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://ecombeckend.saaszo.in";

export const metadata: Metadata = {
  title: "Admin Redirect",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminRedirectPage() {
  redirect(`${backendSite}/admin`);
}
