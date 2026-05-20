import { redirect } from "next/navigation";

const backendSite =
  process.env.NEXT_PUBLIC_BACKEND_SITE_URL ||
  process.env.BACKEND_SITE_URL ||
  "https://ecombeckend.saaszo.in";

export default function AdminRedirectPage() {
  redirect(`${backendSite}/admin`);
}
