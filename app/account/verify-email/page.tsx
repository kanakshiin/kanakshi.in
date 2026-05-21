import { VerifyEmailForm } from "../../../components/account/verify-email-form";

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="content-section auth-page">
      <div className="container">
        <VerifyEmailForm initialEmail={params.email || ""} />
      </div>
    </main>
  );
}
