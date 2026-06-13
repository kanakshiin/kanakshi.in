"use client";
// Theme: Little Divinity — accent #f1a720 golden, text #191919, bg #f7f2ea

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  searchRegistryProducts,
  submitGuaranteeRegistration,
  checkGuaranteeStatus,
  submitWarrantyClaim,
  submitBuybackRequest,
} from "../../lib/registry-api";
import { getSettings } from "../../lib/api";

/* ─────────────────────────────────────────────
   PAGE SHELL — full-height, no scroll
───────────────────────────────────────────── */
function WarrantyPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = normalizeTab(searchParams.get("tab"));
  const codeParam = searchParams.get("code") || "";
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [buybackEnabled, setBuybackEnabled] = useState(true);

  const changeTab = (t: TabKey) => {
    if (t === "buyback" && !buybackEnabled) {
      return;
    }
    setTab(t);
    const params = new URLSearchParams({ tab: t });
    if (codeParam) {
      params.set("code", codeParam);
    }
    router.replace(`/warranty-portal?${params.toString()}`);
  };

  useEffect(() => {
    let active = true;

    getSettings()
      .then((settings) => {
        if (!active) {
          return;
        }

        const enabled = settings.registry_allow_buyback !== false;
        setBuybackEnabled(enabled);

        if (!enabled && initialTab === "buyback") {
          setTab("register");
          router.replace("/warranty-portal?tab=register");
        }
      })
      .catch(() => {
        if (active) {
          setBuybackEnabled(true);
        }
      });

    return () => {
      active = false;
    };
  }, [initialTab, router]);

  /* Left-panel copy per tab */
  const leftContent: Record<TabKey, { eyebrow: string; heading: string; body: string }> = {
    register: {
      eyebrow: "OFFICIAL VERIFICATION REGISTRY",
      heading: "Preserving Sacred Metalware",
      body: "Every genuine Little Divinity brass artifact is handcrafted by generational masters. Active registration logs your purchase inside the Atelier database to activate our 2-Year Restoration Service and verify buyback authentication.",
    },
    status: {
      eyebrow: "GUARANTEE LOOKUP DIRECTORY",
      heading: "Verify Your Registry Certificate",
      body: "Locate your active structural guarantee certificate by registration code, order number, or registered contact details and review complete coverage timelines.",
    },
    claim: {
      eyebrow: "WARRANTY SERVICE CENTRE",
      heading: "File a Repair or Polish Claim",
      body: "Submit a structural repair, metal polishing, or casting restoration request under your 2-Year official Little Divinity guarantee. Claims are audited within 24 business hours.",
    },
    buyback: {
      eyebrow: "RETURN-TO-VAULT EXCHANGE",
      heading: "Liquidate or Upgrade Your Brass",
      body: "Registered owners can exchange or return solid brass articles to our vaults at prevailing metal scrap market weights — the only buyback-authenticated brassware program in India.",
    },
  };

  const { eyebrow, heading, body } = leftContent[tab];

  return (
    <>
      <style>{CSS}</style>
      <div className="wp-shell">
        {/* ── LEFT ── */}
        <aside className="wp-left">
          <div className="wp-left-inner">
            <p className="wp-eyebrow">
              <span className="wp-eyebrow-icon">🛡</span> {eyebrow}
            </p>
            <h1 className="wp-heading">{heading}</h1>
            <p className="wp-body">{body}</p>

            <div className="wp-benefits">
              <div className="wp-benefit">
                <strong>2-Year Service</strong>
                <span>Free expert repolishing, structural repair, and tarnish remediation.</span>
              </div>
              <div className="wp-benefit">
                <strong>Brass Buyback</strong>
                <span>Liquidate or upgrade your metal at prevailing scrap brass market weights anytime.</span>
              </div>
            </div>

            <div className="wp-ctas">
              <a href="/shop" className="wp-btn-outline">EXPLORE THE VAULT</a>
              <a href="/live-auctions" className="wp-btn-solid">LIVE AUCTIONS</a>
            </div>
          </div>
        </aside>

        {/* ── RIGHT ── */}
        <main className="wp-right">
          {/* Tab bar */}
          <div className="wp-tabs" role="tablist">
            {(["register", "status", "claim", ...(buybackEnabled ? ["buyback"] : [])] as TabKey[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => changeTab(t)}
                className={`wp-tab${tab === t ? " wp-tab--active" : ""}`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>

          {/* Form area — scrolls independently if content tall */}
          <div className="wp-form-area">
            {tab === "register" && <RegisterForm />}
            {tab === "status"   && <StatusForm  codeParam={codeParam} changeTab={changeTab} />}
            {tab === "claim"    && <ClaimForm   codeParam={codeParam} />}
            {tab === "buyback"  && <BuybackForm codeParam={codeParam} />}
          </div>
        </main>
      </div>
    </>
  );
}

export default function WarrantyPortalPage() {
  return (
    <Suspense fallback={<RegistryPageFallback />}>
      <WarrantyPortalContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type TabKey = "register" | "status" | "claim" | "buyback";

function normalizeTab(value: string | null): TabKey {
  return value === "status" || value === "claim" || value === "buyback" ? value : "register";
}

const TAB_LABELS: Record<TabKey, string> = {
  register: "Activate Guarantee",
  status:   "Check Status",
  claim:    "Service Claim",
  buyback:  "Buyback Request",
};

/* ─────────────────────────────────────────────
   SHARED INPUT COMPONENTS
───────────────────────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="wp-field">
      <label className="wp-label">{label}{required && " *"}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="wp-input" />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="wp-input wp-textarea" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return <select {...rest} className="wp-input wp-select">{children}</select>;
}

function ErrorMsg({ msg }: { msg: string | undefined }) {
  return msg ? <span className="wp-error">{msg}</span> : null;
}

function AlertBox({ msg }: { msg: string }) {
  return (
    <div className="wp-alert">
      <span>⚠</span> {msg}
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading} className="wp-submit">
      {loading ? <><span className="wp-spinner" /> {loadingLabel}</> : label}
    </button>
  );
}

function RegistryPageFallback() {
  return (
    <div className="wp-shell">
      <aside className="wp-left">
        <div className="wp-left-inner">
          <p className="wp-eyebrow">
            <span className="wp-eyebrow-icon">🛡</span> OFFICIAL VERIFICATION REGISTRY
          </p>
          <h1 className="wp-heading">Preparing Registry Portal</h1>
          <p className="wp-body">Loading your registration, service, and buyback workspace.</p>
        </div>
      </aside>
      <main className="wp-right">
        <div className="wp-form-area">
          <div className="wp-success">
            <div className="wp-spinner" />
            <p style={{ marginTop: "1rem" }}>Loading portal…</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function SuccessCard({ title, subtitle, lines, onReset, resetLabel }: {
  title: string; subtitle: string;
  lines: Array<[string, string]>;
  onReset: () => void; resetLabel: string;
}) {
  return (
    <div className="wp-success">
      <div className="wp-success-icon">✓</div>
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="wp-code-block">
        {lines.map(([k, v]) => (
          <div key={k} className="wp-code-row">
            <span>{k}</span><strong>{v}</strong>
          </div>
        ))}
      </div>
      <button onClick={onReset} className="wp-submit">{resetLabel}</button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM 1 — REGISTER
───────────────────────────────────────────── */
function RegisterForm() {
  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [source, setSource] = useState("website");
  const [orderId, setOrderId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [serial, setSerial] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeCity, setStoreCity] = useState("");
  const [notes, setNotes] = useState("");
  const [whaOpt, setWhaOpt] = useState(true);
  const [terms, setTerms] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [productImg, setProductImg] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string[]>>({});

  useEffect(() => { searchRegistryProducts("").then(setProducts).catch(() => {}); }, []);

  const searchProducts = async (v: string) => {
    setProductSearch(v);
    if (!v.trim()) setSelectedProduct(null);
    const list = await searchRegistryProducts(v);
    setProducts(list);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) { setError("Please accept the certification terms."); return; }
    setLoading(true); setError(null); setFe({});
    const fd = new FormData();
    fd.append("customer_name", name);
    fd.append("email", email);
    fd.append("phone", phone);
    if (whatsapp) fd.append("whatsapp_number", whatsapp);
    fd.append("purchase_source", source);
    fd.append("order_or_bill_number", orderId);
    fd.append("purchase_date", purchaseDate);
    if (selectedProduct) fd.append("product_id", String(selectedProduct.id));
    fd.append("product_name_snapshot", productSearch || selectedProduct?.name || "Brass Artifact");
    if (serial) fd.append("serial_card_id", serial);
    if (storeName) fd.append("source_store_name", storeName);
    if (storeCity) fd.append("source_city", storeCity);
    if (invoiceFile) fd.append("invoice_file", invoiceFile);
    if (productImg) fd.append("product_image", productImg);
    if (notes) fd.append("notes", notes);
    fd.append("whatsapp_opt_in", whaOpt ? "1" : "0");
    fd.append("terms_accepted", "1");
    const res = await submitGuaranteeRegistration(fd);
    setLoading(false);
    if (res.success) { setSuccess(res.data); }
    else { if (res.errors) setFe(res.errors); setError(res.message); }
  };

  if (success) return (
    <SuccessCard
      title="Guarantee Registry Activated!"
      subtitle="Your ownership certificate has been logged in the Atelier database."
      lines={[
        ["REGISTRATION ID", success.registration_code],
        ["VERIFICATION", success.verification_status.replace("_", " ")],
        ["VALID UNTIL", success.warranty_end_date],
      ]}
      onReset={() => setSuccess(null)}
      resetLabel="Register Another Product"
    />
  );

  return (
    <form onSubmit={submit} className="wp-form" noValidate>
      <div className="wp-form-header">
        <h2>Activate Guarantee</h2>
        <p>Takes 45 seconds. Keep your invoice receipt handy.</p>
      </div>

      {error && <AlertBox msg={error} />}

      {/* Row 1 — full name */}
      <Field label="FULL NAME" required>
        <Input placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} required />
        <ErrorMsg msg={fe.customer_name?.[0]} />
      </Field>

      {/* Row 2 — email + whatsapp */}
      <div className="wp-row">
        <Field label="EMAIL ADDRESS" required>
          <Input type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <ErrorMsg msg={fe.email?.[0]} />
        </Field>
        <Field label="WHATSAPP NUMBER">
          <Input type="tel" placeholder="+91 XXXXX XXXXX" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
        </Field>
      </div>

      {/* Row 2b — phone */}
      <Field label="PHONE NUMBER" required>
        <Input type="tel" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
        <ErrorMsg msg={fe.phone?.[0]} />
      </Field>

      {/* Row 3 — Source */}
      <Field label="PURCHASE CHANNEL" required>
        <Select value={source} onChange={e => { setSource(e.target.value); setStoreName(""); setStoreCity(""); }}>
          <option value="website">Little Divinity Website</option>
          <option value="amazon">Amazon India</option>
          <option value="offline_store">Official Physical Store</option>
          <option value="other_marketplace">Other Marketplace / Seller</option>
        </Select>
      </Field>

      {/* Row 4 — order id + date */}
      <div className="wp-row">
        <Field label={source === "website" ? "ORDER ID *" : "AMAZON ORDER ID / RECEIPT ID *"} required>
          <Input
            placeholder={source === "website" ? "e.g. LD-XXXXX" : "e.g. 402-1234567..."}
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            className="wp-input wp-mono"
            required
          />
          <ErrorMsg msg={fe.order_or_bill_number?.[0]} />
        </Field>
        <Field label="PURCHASE DATE" required>
          <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required />
        </Field>
      </div>

      {/* Conditional — offline */}
      {source === "offline_store" && (
        <div className="wp-row">
          <Field label="STORE NAME *" required><Input placeholder="Store name" value={storeName} onChange={e => setStoreName(e.target.value)} required /></Field>
          <Field label="STORE CITY *" required><Input placeholder="e.g. Noida" value={storeCity} onChange={e => setStoreCity(e.target.value)} required /></Field>
        </div>
      )}
      {source === "other_marketplace" && (
        <Field label="SELLER / PLATFORM NAME *" required>
          <Input placeholder="e.g. Flipkart" value={storeName} onChange={e => setStoreName(e.target.value)} required />
        </Field>
      )}

      {/* Product search */}
      <Field label="PRODUCT ACQUIRED" required>
        <div style={{ position: "relative" }}>
          <Input
            placeholder="Search or type product name..."
            value={productSearch}
            onChange={e => { searchProducts(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            required
          />
          {showDrop && products.length > 0 && (
            <ul className="wp-dropdown">
              {products.map(p => (
                <li key={p.id}>
                  <button type="button" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); setShowDrop(false); }}>
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>

      {/* Serial */}
      <Field label="ENGRAVED SERIAL CARD ID (OPTIONAL)">
        <Input placeholder="e.g. SN-BALAJI-XXXX" value={serial} onChange={e => setSerial(e.target.value)} className="wp-input wp-mono" />
      </Field>

      {/* Uploads */}
      <div className="wp-row">
        <Field label={`UPLOAD INVOICE ${source === "website" ? "(OPTIONAL)" : "*"}`}>
          <label className="wp-file-label">
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required={source !== "website"} onChange={e => setInvoiceFile(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
            <span>{invoiceFile ? invoiceFile.name : "Choose file…"}</span>
          </label>
        </Field>
        <Field label="PRODUCT PHOTO (OPTIONAL)">
          <label className="wp-file-label">
            <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => setProductImg(e.target.files?.[0] ?? null)} style={{ display: "none" }} />
            <span>{productImg ? productImg.name : "Choose file…"}</span>
          </label>
        </Field>
      </div>

      {/* Opt-in */}
      <label className="wp-check">
        <input type="checkbox" checked={whaOpt} onChange={e => setWhaOpt(e.target.checked)} />
        <span>Opt-in to WhatsApp alerts for private one-of-one drops and auction alerts.</span>
      </label>

      <label className="wp-check">
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} required />
        <span>I certify this is a genuine Little Divinity purchase and accept registry terms. *</span>
      </label>

      <SubmitBtn loading={loading} label="REGISTER GUARANTEE CARD" loadingLabel="Activating…" />
    </form>
  );
}

/* ─────────────────────────────────────────────
   FORM 2 — STATUS CHECK
───────────────────────────────────────────── */
function StatusForm({ codeParam, changeTab }: { codeParam: string; changeTab: (t: TabKey) => void }) {
  const [method, setMethod] = useState<"code" | "order" | "contact">("code");
  const [code, setCode] = useState(codeParam);
  const [order, setOrder] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doSearch = async (forcedCode?: string) => {
    setLoading(true); setError(null); setResults(null);
    const params: any = {};
    if (forcedCode || method === "code") params.code = (forcedCode || code).trim();
    else if (method === "order") params.order_number = order.trim();
    else { params.email = email.trim(); params.phone = phone.trim(); }
    const res = await checkGuaranteeStatus(params);
    setLoading(false);
    if (res.success && res.registrations?.length) setResults(res.registrations);
    else setError(res.message || "No active guarantee found matching those parameters.");
  };

  useEffect(() => { if (codeParam) doSearch(codeParam); }, []);

  return (
    <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="wp-form" noValidate>
      <div className="wp-form-header">
        <h2>Check Guarantee Status</h2>
        <p>Verify your active certificate by code, order number, or contact.</p>
      </div>

      <div className="wp-method-pills">
        {(["code", "order", "contact"] as const).map(m => (
          <button type="button" key={m} onClick={() => { setMethod(m); setError(null); setResults(null); }} className={`wp-pill${method === m ? " wp-pill--active" : ""}`}>
            {m === "code" ? "Registration Code" : m === "order" ? "Order / Bill No." : "Email & Phone"}
          </button>
        ))}
      </div>

      {error && <AlertBox msg={error} />}

      {method === "code" && (
        <Field label="REGISTRATION CODE" required>
          <Input placeholder="REG-XXXXXXXX" value={code} onChange={e => setCode(e.target.value)} className="wp-input wp-mono wp-center" required />
        </Field>
      )}
      {method === "order" && (
        <Field label="ORDER / BILL NUMBER" required>
          <Input placeholder="LD-XXXXX or Amazon Order ID" value={order} onChange={e => setOrder(e.target.value)} className="wp-input wp-mono" required />
        </Field>
      )}
      {method === "contact" && (
        <div className="wp-row">
          <Field label="EMAIL" required><Input type="email" placeholder="you@domain.com" value={email} onChange={e => setEmail(e.target.value)} required /></Field>
          <Field label="PHONE" required><Input type="tel" placeholder="+91 XXXXX" value={phone} onChange={e => setPhone(e.target.value)} required /></Field>
        </div>
      )}

      <SubmitBtn loading={loading} label="VERIFY CERTIFICATE" loadingLabel="Searching…" />

      {results && results.map(reg => (
        <div key={reg.registration_code} className="wp-result-card">
          <div className="wp-result-header">
            <div>
              <small>OWNERSHIP CERTIFICATE</small>
              <strong className="wp-mono">{reg.registration_code}</strong>
            </div>
            <span className={`wp-status-badge wp-status-${reg.verification_status === "verified" ? "ok" : reg.verification_status === "pending_verification" ? "warn" : "err"}`}>
              {reg.verification_status === "verified" ? "✓ Active" : reg.verification_status === "pending_verification" ? "⏳ Pending" : "✗ Rejected"}
            </span>
          </div>
          <div className="wp-result-grid">
            <div><span>PRODUCT</span><strong>{reg.product_name}</strong></div>
            <div><span>SOURCE</span><strong className="text-capitalize">{reg.purchase_source.replace("_", " ")}</strong></div>
            <div><span>PURCHASED</span><strong>{reg.purchase_date}</strong></div>
            <div><span>VALID UNTIL</span><strong>{reg.warranty_end || "Pending verification"}</strong></div>
          </div>
          <div className="wp-row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={() => changeTab("claim")} className="wp-btn-outline-sm" disabled={!reg.is_active || reg.verification_status !== "verified"}>
              File Repair Claim
            </button>
            <button type="button" onClick={() => changeTab("buyback")} className="wp-btn-outline-sm" disabled={!reg.buyback_eligible}>
              Buyback Request
            </button>
          </div>
        </div>
      ))}
    </form>
  );
}

/* ─────────────────────────────────────────────
   FORM 3 — SERVICE CLAIM
───────────────────────────────────────────── */
function ClaimForm({ codeParam }: { codeParam: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [regCode, setRegCode] = useState(codeParam);
  const [regDetails, setRegDetails] = useState<any>(null);
  const [issueType, setIssueType] = useState("casting_flaw");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string[]>>({});
  const [claimCode, setClaimCode] = useState("");

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCode.trim()) { setError("Enter your registration code."); return; }
    setLoading(true); setError(null);
    const res = await checkGuaranteeStatus({ code: regCode.trim() });
    setLoading(false);
    if (res.success && res.registrations?.length) {
      const r = res.registrations[0];
      if (r.verification_status !== "verified") { setError("Registration not yet verified. Claims require a verified, active warranty."); return; }
      if (!r.is_active) { setError("This guarantee period has expired. Service claims are no longer accepted."); return; }
      setRegDetails(r); setStep(2);
    } else setError(res.message || "No verified registration found for that code.");
  };

  const submitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setFe({});
    const fd = new FormData();
    fd.append("registration_code", regCode);
    fd.append("issue_type", issueType);
    fd.append("description", description);
    if (images) for (let i = 0; i < images.length; i++) fd.append("images[]", images[i]);
    const res = await submitWarrantyClaim(fd);
    setLoading(false);
    if (res.success) { setClaimCode(res.claim_code || ""); setStep(3); }
    else { if (res.errors) setFe(res.errors); setError(res.message); }
  };

  if (step === 3) return (
    <SuccessCard
      title="Service Claim Filed!"
      subtitle="Our team will inspect details and contact you within 24 business hours."
      lines={[["CLAIM REFERENCE", claimCode], ["STATUS", "SUBMITTED — UNDER AUDIT"]]}
      onReset={() => { setStep(1); setRegDetails(null); setClaimCode(""); }}
      resetLabel="File Another Claim"
    />
  );

  return (
    <div className="wp-form">
      <div className="wp-form-header">
        <h2>Guarantee Service Claim</h2>
        <p>Step {step} of 2 — {step === 1 ? "Verify your registration" : "Describe the issue"}</p>
      </div>

      {/* Step indicator */}
      <div className="wp-steps">
        <div className={`wp-step${step >= 1 ? " wp-step--done" : ""}`}><span>1</span> Verify Registry</div>
        <div className="wp-step-line" />
        <div className={`wp-step${step >= 2 ? " wp-step--done" : ""}`}><span>2</span> Submit Details</div>
      </div>

      {error && <AlertBox msg={error} />}

      {step === 1 ? (
        <form onSubmit={lookup} className="wp-form-inner">
          <Field label="GUARANTEE REGISTRATION CODE" required>
            <Input placeholder="REG-XXXXXXXX" value={regCode} onChange={e => setRegCode(e.target.value)} className="wp-input wp-mono wp-center" required />
          </Field>
          <SubmitBtn loading={loading} label="VALIDATE & PROCEED" loadingLabel="Validating…" />
        </form>
      ) : (
        <>
          <div className="wp-reg-summary">
            <span>📦 {regDetails.product_name}</span>
            <span className="wp-mono" style={{ color: "#f1a720" }}>{regDetails.registration_code}</span>
            <span style={{ color: "#198754" }}>Valid until {regDetails.warranty_end}</span>
          </div>
          <form onSubmit={submitClaim} className="wp-form-inner">
            <Field label="TYPE OF SERVICE" required>
              <Select value={issueType} onChange={e => setIssueType(e.target.value)}>
                <option value="casting_flaw">Structural / Casting Flaw</option>
                <option value="breakage">Metal Crack or Breakage</option>
                <option value="discoloration">Severe Oxidation / Polish Service</option>
                <option value="incomplete_accessories">Missing Components</option>
                <option value="other">Other Service Inquiry</option>
              </Select>
            </Field>
            <Field label="DESCRIBE THE ISSUE IN DETAIL" required>
              <Textarea placeholder="Describe the problem precisely — cracks, transit damage, polishing needs…" value={description} onChange={e => setDescription(e.target.value)} rows={4} required />
              <ErrorMsg msg={fe.description?.[0]} />
            </Field>
            <Field label="UPLOAD VISUAL PROOF (REQUIRED)" required>
              <label className="wp-file-label">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={e => setImages(e.target.files)} style={{ display: "none" }} required />
                <span>{images && images.length > 0 ? `${images.length} file(s) selected` : "Select damage photos…"}</span>
              </label>
              <small className="wp-hint">Up to 5 images · JPG/PNG/WEBP · Max 5MB each</small>
            </Field>
            <div className="wp-row">
              <button type="button" onClick={() => setStep(1)} className="wp-btn-outline-sm wp-btn-flex">← Back</button>
              <SubmitBtn loading={loading} label="FILE SERVICE TICKET" loadingLabel="Submitting…" />
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FORM 4 — BUYBACK
───────────────────────────────────────────── */
function BuybackForm({ codeParam }: { codeParam: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [regCode, setRegCode] = useState(codeParam);
  const [regDetails, setRegDetails] = useState<any>(null);
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("whatsapp");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fe, setFe] = useState<Record<string, string[]>>({});
  const [requestCode, setRequestCode] = useState("");

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCode.trim()) { setError("Enter your registration code."); return; }
    setLoading(true); setError(null);
    const res = await checkGuaranteeStatus({ code: regCode.trim() });
    setLoading(false);
    if (res.success && res.registrations?.length) {
      const r = res.registrations[0];
      if (r.verification_status !== "verified") { setError("Buyback is only available for verified, authentic registrations."); return; }
      if (!r.buyback_eligible) { setError("This product is not eligible for the buyback program. Contact support for clarification."); return; }
      setRegDetails(r); setStep(2);
    } else setError(res.message || "No verified registration found for that code.");
  };

  const submitBuyback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!images?.length) { setError("Upload at least one condition photo."); return; }
    setLoading(true); setError(null); setFe({});
    const fd = new FormData();
    fd.append("registration_code", regCode);
    fd.append("pickup_city", city);
    fd.append("preferred_contact_method", contact);
    fd.append("condition_notes", condition);
    for (let i = 0; i < images.length; i++) fd.append("images[]", images[i]);
    const res = await submitBuybackRequest(fd);
    setLoading(false);
    if (res.success) { setRequestCode(res.request_code || ""); setStep(3); }
    else { if (res.errors) setFe(res.errors); setError(res.message); }
  };

  if (step === 3) return (
    <SuccessCard
      title="Appraisal Request Submitted!"
      subtitle="Our brass appraiser will calculate metal weights and contact you within 48 hours."
      lines={[["APPRAISAL TICKET", requestCode], ["STATUS", "SUBMITTED — CALCULATING VALUATION"]]}
      onReset={() => { setStep(1); setRegDetails(null); setRequestCode(""); }}
      resetLabel="Submit Another Request"
    />
  );

  return (
    <div className="wp-form">
      <div className="wp-form-header">
        <h2>Buyback Appraisal Request</h2>
        <p>Step {step} of 2 — {step === 1 ? "Authenticate your ownership" : "Submit appraisal details"}</p>
      </div>

      <div className="wp-steps">
        <div className={`wp-step${step >= 1 ? " wp-step--done" : ""}`}><span>1</span> Authenticate</div>
        <div className="wp-step-line" />
        <div className={`wp-step${step >= 2 ? " wp-step--done" : ""}`}><span>2</span> Appraisal Details</div>
      </div>

      {error && <AlertBox msg={error} />}

      {step === 1 ? (
        <form onSubmit={lookup} className="wp-form-inner">
          <Field label="GUARANTEE REGISTRATION CODE" required>
            <Input placeholder="REG-XXXXXXXX" value={regCode} onChange={e => setRegCode(e.target.value)} className="wp-input wp-mono wp-center" required />
          </Field>
          <SubmitBtn loading={loading} label="AUTHENTICATE & APPRAISE" loadingLabel="Authenticating…" />
        </form>
      ) : (
        <>
          <div className="wp-reg-summary">
            <span>🏺 {regDetails.product_name}</span>
            <span className="wp-mono" style={{ color: "#f1a720" }}>{regDetails.registration_code}</span>
            <span style={{ color: "#198754" }}>Buyback eligible ✓</span>
          </div>
          <form onSubmit={submitBuyback} className="wp-form-inner">
            <div className="wp-row">
              <Field label="PICKUP CITY" required>
                <Input placeholder="e.g. Mumbai, Noida" value={city} onChange={e => setCity(e.target.value)} required />
                <ErrorMsg msg={fe.pickup_city?.[0]} />
              </Field>
              <Field label="PREFERRED CONTACT" required>
                <Select value={contact} onChange={e => setContact(e.target.value)}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="phone">Phone Call</option>
                  <option value="email">Email</option>
                </Select>
              </Field>
            </div>
            <Field label="DESCRIBE CURRENT CONDITION" required>
              <Textarea placeholder="Mention dents, oxidation, structural modifications, or pristine condition…" value={condition} onChange={e => setCondition(e.target.value)} rows={3} required />
              <ErrorMsg msg={fe.condition_notes?.[0]} />
            </Field>
            <Field label="UPLOAD CONDITION PHOTOS" required>
              <label className="wp-file-label">
                <input type="file" multiple accept=".jpg,.jpeg,.png,.webp" onChange={e => setImages(e.target.files)} style={{ display: "none" }} required />
                <span>{images && images.length > 0 ? `${images.length} file(s) selected` : "Select condition photos…"}</span>
              </label>
              <small className="wp-hint">All angles · Up to 5 images · Max 5MB each</small>
            </Field>
            <div className="wp-row">
              <button type="button" onClick={() => setStep(1)} className="wp-btn-outline-sm wp-btn-flex">← Back</button>
              <SubmitBtn loading={loading} label="SUBMIT FOR METAL APPRAISAL" loadingLabel="Submitting…" />
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES — scoped to .wp-* classes
   Everything in one viewport, no page scroll
───────────────────────────────────────────── */
const CSS = `
  /* Hide footer and WhatsApp widget on this route — restored when leaving */
  body:has(.wp-shell) {
    overflow: hidden;
  }
  body:has(.wp-shell) .site-footer,
  body:has(.wp-shell) .whatsapp-float-widget {
    display: none !important;
  }

  .wp-shell {
    display: grid;
    grid-template-columns: 44% 56%;
    height: calc(100dvh - 80px);   /* 80px = site header */
    overflow: hidden;
    background: #f7f2ea;
    font-family: var(--font-body, "Josefin Sans", Arial, sans-serif);
  }

  /* ── LEFT ──────────────────────────── */
  .wp-left {
    display: flex;
    align-items: center;
    padding: 3rem 3.5rem 3rem 3rem;
    background: #f7f2ea;
    overflow: hidden;
  }

  .wp-left-inner {
    max-width: 440px;
  }

  .wp-eyebrow {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #f1a720;
    margin: 0 0 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .wp-eyebrow-icon {
    font-size: 1rem;
  }

  .wp-heading {
    font-size: clamp(2rem, 3.5vw, 3.2rem);
    font-weight: 400;
    line-height: 1.08;
    color: #191919;
    margin: 0 0 1.2rem;
    font-family: Georgia, "Times New Roman", serif;
    letter-spacing: -0.01em;
  }

  .wp-body {
    font-size: 0.93rem;
    line-height: 1.75;
    color: #5a4a38;
    margin: 0 0 1.8rem;
  }

  .wp-body strong {
    color: #191919;
    font-weight: 700;
  }

  .wp-benefits {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
    margin-bottom: 2rem;
  }

  .wp-benefit {
    border-left: 3px solid rgba(241,167,32,0.4);
    padding: 0.7rem 0.9rem;
    background: rgba(255,255,255,0.35);
    border-radius: 0 8px 8px 0;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .wp-benefit strong {
    font-size: 0.85rem;
    font-weight: 700;
    color: #191919;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .wp-benefit span {
    font-size: 0.78rem;
    color: #7a6553;
    line-height: 1.5;
  }

  .wp-ctas {
    display: flex;
    gap: 0.85rem;
    flex-wrap: wrap;
  }

  .wp-btn-outline {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border: 1.5px solid #191919;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #191919;
    background: transparent;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .wp-btn-outline:hover {
    background: #191919;
    color: #fff;
  }

  .wp-btn-solid {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border: 1.5px solid #191919;
    border-radius: 4px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #fff;
    background: #191919;
    text-decoration: none;
    transition: background 0.2s;
  }
  .wp-btn-solid:hover {
    background: #f1a720;
    border-color: #f1a720;
    color: #191919;
  }

  /* ── RIGHT ─────────────────────────── */
  .wp-right {
    display: flex;
    flex-direction: column;
    background: #fff;
    border-left: 1px solid rgba(197,168,128,0.2);
    overflow: hidden;
  }

  /* Tab bar */
  .wp-tabs {
    display: flex;
    border-bottom: 1px solid #ede8df;
    padding: 0 1.5rem;
    flex-shrink: 0;
    gap: 0;
    background: #fdfaf6;
  }

  .wp-tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    padding: 1rem 1.2rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #9a8a7a;
    cursor: pointer;
    white-space: nowrap;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: -1px;
  }

  .wp-tab:hover {
    color: #191919;
  }

  .wp-tab--active {
    color: #191919;
    border-bottom-color: #f1a720;
  }

  /* Form scroll area */
  .wp-form-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2rem 2.5rem;
    scrollbar-width: thin;
    scrollbar-color: #ddd transparent;
  }
  .wp-form-area::-webkit-scrollbar { width: 4px; }
  .wp-form-area::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }

  /* ── FORM ELEMENTS ────────────────── */
  .wp-form, .wp-form-inner {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .wp-form-header {
    margin-bottom: 0.25rem;
  }

  .wp-form-header h2 {
    font-size: 1.5rem;
    font-weight: 400;
    font-family: Georgia, "Times New Roman", serif;
    color: #191919;
    margin: 0 0 0.25rem;
    letter-spacing: -0.01em;
  }

  .wp-form-header p {
    font-size: 0.82rem;
    color: #9a8a7a;
    margin: 0;
  }

  .wp-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;
  }

  .wp-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .wp-label {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5a4a38;
  }

  .wp-input {
    border: 1px solid #d9cfc4;
    border-radius: 4px;
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
    color: #191919;
    background: #fff;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    font-family: inherit;
  }

  .wp-input::placeholder { color: #b8a898; }

  .wp-input:focus {
    outline: none;
    border-color: #f1a720;
    box-shadow: 0 0 0 3px rgba(241,167,32,0.12);
  }

  .wp-textarea {
    resize: vertical;
    min-height: 80px;
  }

  .wp-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.9rem center;
    padding-right: 2.5rem;
  }

  .wp-mono {
    font-family: "Courier New", monospace;
    letter-spacing: 0.04em;
  }

  .wp-center { text-align: center; font-size: 1.05rem; }

  .wp-file-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px dashed rgba(241,167,32,0.4);
    border-radius: 4px;
    padding: 0.65rem 0.9rem;
    cursor: pointer;
    font-size: 0.82rem;
    color: #7a6553;
    background: #fdfaf6;
    transition: border-color 0.2s, background 0.2s;
    width: 100%;
  }
  .wp-file-label:hover {
    border-color: #f1a720;
    background: #fff;
  }

  .wp-hint {
    font-size: 0.72rem;
    color: #b8a898;
    margin-top: 0.15rem;
    display: block;
  }

  .wp-error {
    font-size: 0.73rem;
    color: #c0392b;
  }

  .wp-alert {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 0.65rem 0.85rem;
    font-size: 0.82rem;
    color: #b91c1c;
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .wp-check {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    cursor: pointer;
    font-size: 0.8rem;
    color: #5a4a38;
    line-height: 1.5;
  }

  .wp-check input[type="checkbox"] {
    margin-top: 0.1rem;
    accent-color: #f1a720;
    flex-shrink: 0;
    width: 15px;
    height: 15px;
  }

  .wp-submit {
    background: #191919;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 0.88rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background 0.2s;
    width: 100%;
    font-family: inherit;
  }

  .wp-submit:hover { background: #f1a720; color: #191919; }
  .wp-submit:disabled { background: #9a8a7a; cursor: not-allowed; }

  .wp-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: wp-spin 0.7s linear infinite;
    display: inline-block;
    flex-shrink: 0;
  }
  @keyframes wp-spin { to { transform: rotate(360deg); } }

  /* Search method pills */
  .wp-method-pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .wp-pill {
    background: none;
    border: 1px solid #d9cfc4;
    border-radius: 999px;
    padding: 0.45rem 1rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #7a6553;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .wp-pill:hover { border-color: #f1a720; color: #f1a720; }
  .wp-pill--active { background: #191919; color: #fff; border-color: #191919; }

  /* Results card */
  .wp-result-card {
    border: 1px solid #ede8df;
    border-radius: 8px;
    overflow: hidden;
    margin-top: 0.5rem;
  }

  .wp-result-header {
    background: #fdfaf6;
    border-bottom: 1px solid #ede8df;
    padding: 1rem 1.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .wp-result-header small {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9a8a7a;
    display: block;
    margin-bottom: 0.25rem;
  }

  .wp-result-header strong {
    font-size: 1rem;
    color: #191919;
  }

  .wp-status-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    font-size: 0.73rem;
    font-weight: 700;
  }

  .wp-status-ok   { background: #dcfce7; color: #16a34a; }
  .wp-status-warn { background: #fef9c3; color: #854d0e; }
  .wp-status-err  { background: #fee2e2; color: #b91c1c; }

  .wp-result-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1rem;
    padding: 1rem 1.2rem;
  }

  .wp-result-grid > div {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .wp-result-grid span {
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9a8a7a;
  }

  .wp-result-grid strong {
    font-size: 0.88rem;
    color: #191919;
  }

  /* Outline small btn */
  .wp-btn-outline-sm {
    background: transparent;
    border: 1px solid #d9cfc4;
    border-radius: 4px;
    padding: 0.6rem 1rem;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #5a4a38;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    flex: 1;
  }

  .wp-btn-outline-sm:hover:not(:disabled) { border-color: #f1a720; color: #f1a720; }
  .wp-btn-outline-sm:disabled { opacity: 0.4; cursor: not-allowed; }
  .wp-btn-flex { flex: 0 0 auto; }

  /* Step indicator */
  .wp-steps {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0.25rem 0 0.5rem;
  }

  .wp-step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.73rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #b8a898;
  }

  .wp-step span {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ede8df;
    color: #9a8a7a;
    font-size: 0.7rem;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .wp-step--done { color: #191919; }
  .wp-step--done span { background: #191919; color: #fff; }

  .wp-step-line {
    flex: 1;
    height: 1px;
    background: #ede8df;
  }

  /* Reg summary chip */
  .wp-reg-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #fdfaf6;
    border: 1px solid #ede8df;
    border-radius: 6px;
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
    color: #5a4a38;
    flex-wrap: wrap;
  }

  /* Dropdown */
  .wp-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: #fff;
    border: 1px solid #d9cfc4;
    border-radius: 4px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    z-index: 50;
    list-style: none;
    margin: 2px 0 0;
    padding: 0.25rem 0;
    max-height: 180px;
    overflow-y: auto;
  }

  .wp-dropdown li button {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 0.55rem 0.9rem;
    font-size: 0.85rem;
    color: #191919;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
  }

  .wp-dropdown li button:hover { background: #fdfaf6; }

  /* Success screen */
  .wp-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    padding: 1rem 0;
  }

  .wp-success-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #dcfce7;
    color: #16a34a;
    font-size: 1.6rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
  }

  .wp-success h2 {
    font-size: 1.35rem;
    font-family: Georgia, serif;
    color: #191919;
    margin: 0;
    font-weight: 400;
  }

  .wp-success p {
    font-size: 0.83rem;
    color: #7a6553;
    margin: 0;
    max-width: 340px;
  }

  .wp-code-block {
    background: #fdfaf6;
    border: 1px solid #ede8df;
    border-radius: 6px;
    padding: 0.9rem 1.2rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    text-align: left;
  }

  .wp-code-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.78rem;
    gap: 0.5rem;
  }

  .wp-code-row span {
    color: #9a8a7a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.68rem;
    font-weight: 800;
  }

  .wp-code-row strong {
    color: #191919;
    font-family: "Courier New", monospace;
    font-weight: 700;
  }

  /* Responsive: stack on smaller screens */
  @media (max-width: 768px) {
    body:has(.wp-shell) { overflow: auto; }
    .wp-shell {
      grid-template-columns: 1fr;
      height: auto;
      overflow: visible;
    }
    .wp-left { padding: 2rem 1.5rem 1.5rem; }
    .wp-left-inner { max-width: 100%; }
    .wp-heading { font-size: 2rem; }
    .wp-right { border-left: none; border-top: 1px solid #ede8df; min-height: 100vh; }
    .wp-form-area { padding: 1.5rem; max-height: none; overflow: visible; }
    .wp-row { grid-template-columns: 1fr; }
    .wp-tabs { overflow-x: auto; gap: 0; }
    .wp-tab { padding: 0.85rem 0.85rem; font-size: 0.7rem; }
  }
`;
