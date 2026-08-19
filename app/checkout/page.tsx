"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { useCart } from "../../components/cart-provider";
import { fetchCurrentCustomer, fetchCustomerAddresses, getStoredCustomerToken, storeCustomerToken } from "../../lib/customer-auth";
import { fetchPincodeLocation, formatIndianPhone, isValidEmailInput, isValidIndianPhone, normalizeEmailInput, normalizeIndianPhone, normalizeIndianPincode } from "../../lib/form-inputs";
import { getActiveCoupons, getSettings, getProducts, placeOrder, formatPrice, resolveAssetUrl, verifyPayment, cancelOrder } from "../../lib/api";
import { Coupon, CustomerAddress, CustomerUser, PaymentGatewayPublic, Product, SiteSettings } from "../../lib/types";

async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window !== "undefined" && (window as any).Razorpay) {
    return true;
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Tirupati", "Rajamahendravaram", "Kakinada", "Kadapa", "Anantapur",
    "Eluru", "Vizianagaram", "Other"
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Namsai", "Other"],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon",
    "Tinsukia", "Bongaigaon", "Tezpur", "Other"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia",
    "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Other"
  ],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Other"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Other"],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Morbi", "Nadiad", "Other"
  ],
  "Haryana": [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar",
    "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Other"
  ],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Bilaspur", "Kullu", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Other"],
  "Karnataka": [
    "Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi",
    "Davanagere", "Ballari", "Tumakuru", "Shivamogga", "Kalaburagi", "Udupi", "Other"
  ],
  "Kerala": [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam",
    "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Other"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Other"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad",
    "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai",
    "Solapur", "Kolhapur", "Amravati", "Other"
  ],
  "Manipur": ["Imphal", "Thoubal", "Kakching", "Other"],
  "Meghalaya": ["Shillong", "Tura", "Nongpoh", "Other"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Other"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Other"],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer",
    "Udaipur", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Other"
  ],
  "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Other"],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem",
    "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Other"
  ],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Other"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Other"],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut",
    "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad",
    "Noida", "Greater Noida", "Gorakhpur", "Jhansi", "Firozabad", "Other"
  ],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Other"],
  "West Bengal": [
    "Kolkata", "Howrah", "Siliguri", "Asansol", "Durgapur",
    "Bardhaman", "Malda", "Kharagpur", "Jalmaiguri", "Other"
  ],
  "Andaman and Nicobar Islands": ["Port Blair", "Other"],
  "Chandigarh": ["Chandigarh", "Other"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa", "Other"],
  "Delhi": ["New Delhi", "Delhi", "Noida (NCR)", "Gurugram (NCR)", "Ghaziabad (NCR)", "Faridabad (NCR)", "Other"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Other"],
  "Ladakh": ["Leh", "Kargil", "Other"],
  "Lakshadweep": ["Kavaratti", "Other"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Other"]
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, addItem, clearCart } = useCart();
  const checkoutCompletingRef = useRef(false);

  // User & settings states
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [shippingProducts, setShippingProducts] = useState<Record<number, Product>>({});
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);
  const [addingUpsellId, setAddingUpsellId] = useState<number | null>(null);

  // Online gateway simulation overlay state
  const [activeSimulation, setActiveSimulation] = useState<{
    orderNumber: string;
    amount: number;
    method: "razorpay" | "phonepe";
    accessToken?: string | null;
  } | null>(null);

  // Form states (Essential Quick Checkout Fields)
  const [shipName, setShipName] = useState("");
  const [shipEmail, setShipEmail] = useState("");
  const [shipPhone, setShipPhone] = useState("");
  const [shipAddressLine1, setShipAddressLine1] = useState("");
  const [shipLandmark, setShipLandmark] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [shipPincode, setShipPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay" | "phonepe">("razorpay");
  const [notes, setNotes] = useState("");
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const pincodeLookupRef = useRef<string>("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(true);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableGateways = settings
    ? (settings.payment_gateways || [])
    : [{ provider: "cod", display_name: "Cash on Delivery", is_test_mode: false } satisfies PaymentGatewayPublic];
  const hasAnyPaymentGateway = availableGateways.length > 0;
  const hasGateway = (provider: "cod" | "razorpay" | "phonepe") =>
    availableGateways.some((gateway) => gateway.provider === provider);

  const handleStateChange = (stateVal: string) => {
    setShipState(stateVal);
    setShipCity("");
  };

  const handleCityChange = (cityVal: string) => {
    setShipCity(cityVal);
  };

  const applyPincodeLocation = (state: string, city: string) => {
    setShipState(state);
    setShipCity(city);
  };

  const composeShippingAddress = () =>
    [shipAddressLine1.trim(), shipLandmark.trim()]
      .filter(Boolean)
      .join(", Landmark: ");

  const applySavedAddress = (address: CustomerAddress) => {
    setSelectedAddressId(address.id);
    setShipName(address.recipient_name || user?.name || "");
    setShipEmail(user?.email || shipEmail);
    setShipPhone(address.phone || user?.phone || "");
    setShipAddressLine1(address.address_line1 || "");
    setShipLandmark(address.landmark || "");
    setShipPincode(normalizeIndianPincode(address.pincode || ""));
    applyPincodeLocation(address.state || "", address.city || "");
  };

  const redirectToSuccess = (orderNumber: string) => {
    const target = `/checkout/success?order_number=${encodeURIComponent(orderNumber)}`;
    if (typeof window !== "undefined") {
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  const redirectToFailure = (params: {
    orderNumber?: string;
    paymentMethod?: string;
    reason?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.orderNumber) query.set("order_number", params.orderNumber);
    if (params.paymentMethod) query.set("payment_method", params.paymentMethod);
    if (params.reason) query.set("reason", params.reason);
    const target = `/checkout/failed${query.toString() ? `?${query.toString()}` : ""}`;
    if (typeof window !== "undefined") {
      window.location.assign(target);
      return;
    }
    router.push(target);
  };

  // Load configuration & user data & upsells
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsData, couponsData, productsData] = await Promise.all([
          getSettings(),
          getActiveCoupons(),
          getProducts("per_page=12")
        ]);
        setSettings(settingsData);
        setCoupons(couponsData || []);
        if (productsData?.items) {
          setUpsellProducts(productsData.items);
        }

        const token = getStoredCustomerToken();
        if (token) {
          try {
            const [customer, addresses] = await Promise.all([
              fetchCurrentCustomer(token),
              fetchCustomerAddresses(token)
            ]);
            setUser(customer);
            setSavedAddresses(addresses);
            // Pre-fill shipping info from customer profile
            setShipName(customer.name || "");
            setShipEmail(customer.email || "");
            setShipPhone(customer.phone || "");
            const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];
            if (defaultAddress) {
              applySavedAddress(defaultAddress);
            }
          } catch (e) {
            console.error("Auth fetch failed:", e);
          }
        }
      } catch (err) {
        console.error("Failed to load initial checkout data:", err);
      } finally {
        setLoadingConfig(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!loadingConfig && items.length === 0 && !checkoutCompletingRef.current) {
      router.push("/cart");
    }
  }, [items, loadingConfig, router]);

  useEffect(() => {
    if (!hasGateway(paymentMethod)) {
      const fallbackMethod = (["razorpay", "phonepe", "cod"] as const).find((provider) => hasGateway(provider));
      if (fallbackMethod) {
        setPaymentMethod(fallbackMethod);
      }
    }
  }, [paymentMethod, settings]);

  useEffect(() => {
    const requestedPayment = searchParams.get("payment");
    if (requestedPayment === "cod" || requestedPayment === "razorpay" || requestedPayment === "phonepe") {
      if (hasGateway(requestedPayment)) {
        setPaymentMethod(requestedPayment);
      }
    }
  }, [searchParams, settings]);

  useEffect(() => {
    async function loadShippingProducts() {
      if (!items.length) {
        setShippingProducts({});
        return;
      }
      const ids = Array.from(new Set(items.map((item) => item.id))).filter(Boolean);
      try {
        const response = await getProducts(`ids=${ids.join(",")}&per_page=${ids.length}`);
        const productMap = response.items.reduce<Record<number, Product>>((acc, product) => {
          acc[product.id] = product;
          return acc;
        }, {});
        setShippingProducts(productMap);
      } catch (error) {
        console.error("Failed to load product shipping rules:", error);
      }
    }

    loadShippingProducts();
  }, [items]);

  // Pincode auto-detection
  useEffect(() => {
    const normalizedPincode = normalizeIndianPincode(shipPincode);

    if (normalizedPincode.length !== 6 || normalizedPincode === pincodeLookupRef.current) {
      if (normalizedPincode.length < 6) {
        setPincodeStatus(null);
      }
      return;
    }

    let active = true;
    pincodeLookupRef.current = normalizedPincode;
    setPincodeStatus("Detecting city & state…");

    fetchPincodeLocation(normalizedPincode)
      .then((location) => {
        if (!active) return;
        applyPincodeLocation(location.state, location.city);
        setPincodeStatus("City & state auto-detected.");
      })
      .catch((err) => {
        if (!active) return;
        setPincodeStatus(err instanceof Error ? err.message : "Enter city/state manually.");
      });

    return () => {
      active = false;
    };
  }, [shipPincode]);

  if (loadingConfig || items.length === 0) {
    return (
      <main className="content-section auth-page" style={{ justifyContent: "center", alignItems: "center", display: "flex", minHeight: "75vh" }}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p className="eyebrow" style={{ animation: "pulse 1.5s infinite" }}>Kanakshi.in</p>
          <h2 className="auth-title">Preparing your quick checkout…</h2>
          <p className="auth-muted">Loading product availability, delivery parameters, and member benefits.</p>
        </div>
      </main>
    );
  }

  const currencySymbol = settings?.site_currency_symbol || "₹";
  const defaultShippingCost = Number(settings?.default_shipping_cost || 99);
  const freeShippingThreshold = Number(settings?.min_order_free_shipping || 499);
  const shipEmailInvalid = shipEmail.length > 0 && !isValidEmailInput(shipEmail);
  const shipPhoneInvalid = shipPhone.length > 0 && !isValidIndianPhone(shipPhone);

  // Compute subtotal & discount
  let discountAmount = 0;
  if (appliedCoupon) {
    const minSpend = Number(appliedCoupon.min_order_amount || 0);
    if (subtotal >= minSpend) {
      if (appliedCoupon.type === "percent") {
        discountAmount = subtotal * (Number(appliedCoupon.value) / 100);
      } else {
        discountAmount = Number(appliedCoupon.value);
      }
    }
  }

  const netSubtotal = subtotal - discountAmount;
  let customShippingCost = 0;
  let hasDefaultShippingItem = false;

  items.forEach((item) => {
    const shippingProduct = shippingProducts[item.id];
    const shippingType = shippingProduct?.shipping_type || "default";
    if (shippingType === "custom") {
      customShippingCost += Number(shippingProduct?.shipping_fee || 0) * item.quantity;
      return;
    }
    if (shippingType !== "free") {
      hasDefaultShippingItem = true;
    }
  });

  const defaultRuleShippingCost = hasDefaultShippingItem && netSubtotal < freeShippingThreshold ? defaultShippingCost : 0;
  const shippingCost = defaultRuleShippingCost + customShippingCost;

  // Prepaid Savings Calculations
  const isPrepaidMethod = paymentMethod !== "cod";
  const prepaidConfig = settings?.prepaid_discount;
  let prepaidDiscountAmount = 0;

  if (isPrepaidMethod && prepaidConfig?.is_enabled) {
    const minSpend = Number(prepaidConfig.min_order_amount || 0);
    if (netSubtotal >= minSpend) {
      if (prepaidConfig.type === "percent") {
        prepaidDiscountAmount = Math.min(netSubtotal * (Number(prepaidConfig.value) / 100), Number(prepaidConfig.max_discount || 1000));
      } else {
        prepaidDiscountAmount = Number(prepaidConfig.value);
      }
    }
  }

  const codConfig = settings?.cod_settings;
  const codFeeAmount = paymentMethod === "cod" ? Number(codConfig?.fee || 0) : 0;
  const payableBeforeWallet = Math.max(0, (netSubtotal - prepaidDiscountAmount) + shippingCost + codFeeAmount);
  const userWalletBalance = Number(user?.wallet_balance || 0);
  let walletDiscountAmount = 0;
  if (useWallet && userWalletBalance > 0 && payableBeforeWallet > 0) {
    walletDiscountAmount = Math.min(userWalletBalance, payableBeforeWallet);
  }
  const grandTotal = Math.max(0, payableBeforeWallet - walletDiscountAmount);

  function handleApplyCoupon(codeToApply?: string) {
    const targetCode = (codeToApply || couponCode).trim();
    setCouponError(null);
    setCouponSuccess(null);

    if (!targetCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    const matched = coupons.find(c => c.code.toLowerCase() === targetCode.toLowerCase());
    if (!matched) {
      setCouponError(`Coupon code "${targetCode}" is invalid or expired.`);
      return;
    }

    const minSpend = Number(matched.min_order_amount || 0);
    if (subtotal < minSpend) {
      setCouponError(`This coupon requires a minimum spend of ${formatPrice(minSpend, currencySymbol)}.`);
      return;
    }

    setAppliedCoupon(matched);
    setCouponCode(matched.code);
    setCouponSuccess(`Coupon "${matched.code}" applied! You saved ${matched.type === "percent" ? `${matched.value}%` : formatPrice(Number(matched.value), currencySymbol)}.`);
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponSuccess(null);
    setCouponError(null);
  }

  function handleAddUpsell(product: Product) {
    setAddingUpsellId(product.id);
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      sale_price: product.sale_price ? Number(product.sale_price) : undefined,
      effective_price: product.effective_price ? Number(product.effective_price) : Number(product.sale_price || product.price),
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [(product as any).primary_image || "/jewellery/drop-earrings.jpg"],
      category_name: product.category_name,
      category_slug: product.category_slug,
      is_sellable: product.is_sellable
    }, 1);
    setTimeout(() => {
      setAddingUpsellId(null);
    }, 300);
  }

  async function handleConfirmSimulation() {
    if (!activeSimulation) return;
    setIsSubmitting(true);
    const token = getStoredCustomerToken() || undefined;

    try {
      const verifyRes = await verifyPayment({
        order_number: activeSimulation.orderNumber,
        payment_method: activeSimulation.method,
        access_token: activeSimulation.accessToken || undefined,
        razorpay_payment_id: "pay_simulated_" + Math.random().toString(36).substring(7),
        transaction_id: "txn_simulated_" + Math.random().toString(36).substring(7),
      }, token);

      if (verifyRes.success) {
        checkoutCompletingRef.current = true;
        clearCart();
        redirectToSuccess(activeSimulation.orderNumber);
      } else {
        redirectToFailure({
          orderNumber: activeSimulation.orderNumber,
          paymentMethod: activeSimulation.method,
          reason: verifyRes.message || "Payment verification failed.",
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      setActiveSimulation(null);
    }
  }

  async function handleCancelSimulation() {
    if (!activeSimulation) return;
    setIsSubmitting(true);
    const token = getStoredCustomerToken() || undefined;

    try {
      const cancelRes = await cancelOrder(activeSimulation.orderNumber, token, activeSimulation.accessToken || undefined);
      redirectToFailure({
        orderNumber: activeSimulation.orderNumber,
        paymentMethod: activeSimulation.method,
        reason: cancelRes.success
          ? "Payment was cancelled. You can retry anytime."
          : cancelRes.message || "Payment session ended.",
      });
    } catch (err) {
      console.error("Order cancellation failed:", err);
      redirectToFailure({
        orderNumber: activeSimulation.orderNumber,
        paymentMethod: activeSimulation.method,
        reason: "Payment session ended. Please retry your order.",
      });
    } finally {
      setIsSubmitting(false);
      setActiveSimulation(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (shipEmailInvalid) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!shipName || !shipEmail || !shipPhone || !shipAddressLine1 || !shipCity || !shipState || !shipPincode) {
      setError("Please fill out all delivery fields (Name, Phone, Email, Address, Landmark, Pincode, City & State).");
      setIsSubmitting(false);
      return;
    }

    if (!isValidIndianPhone(shipPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number (starting with 6-9).");
      setIsSubmitting(false);
      return;
    }

    if (!/^[1-9][0-9]{5}$/.test(normalizeIndianPincode(shipPincode))) {
      setError("Please enter a valid 6-digit PIN code.");
      setIsSubmitting(false);
      return;
    }

    const token = getStoredCustomerToken() || undefined;
    const shippingAddress = composeShippingAddress();

    const orderData = {
      ship_name: shipName.trim(),
      ship_email: normalizeEmailInput(shipEmail),
      ship_phone: normalizeIndianPhone(shipPhone),
      ship_address: shippingAddress,
      save_address: saveAddressForFuture,
      address_line1: shipAddressLine1.trim(),
      address_landmark: shipLandmark.trim() || undefined,
      ship_city: shipCity.trim(),
      ship_state: shipState.trim(),
      ship_pincode: normalizeIndianPincode(shipPincode),
      payment_method: paymentMethod,
      coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
      use_wallet: useWallet && walletDiscountAmount > 0,
      wallet_amount: walletDiscountAmount,
      notes: notes.trim() || undefined,
      items: items.map(item => ({
        product_id: item.id,
        variant_id: null,
        quantity: item.quantity
      }))
    };

    const res = await placeOrder(orderData, token);

    if (res.success && res.data) {
      if (res.data.customer_auth?.token) {
        storeCustomerToken(res.data.customer_auth.token);
      }

      if (paymentMethod === "cod") {
        checkoutCompletingRef.current = true;
        clearCart();
        redirectToSuccess(res.data.order_number);
      } else {
        const config = res.data.gateway_config;
        const pendingAccessToken = config?.pending_access_token || undefined;

        if (paymentMethod === "razorpay" && config?.public_key && config?.provider_order_id && !config.is_test_mode) {
          const loaded = await loadRazorpayScript();
          if (loaded) {
            try {
              const options = {
                key: config.public_key,
                amount: Math.round(res.data.total_amount * 100),
                currency: "INR",
                name: "Kanakshi Fine Jewellery",
                description: `Order #${res.data.order_number}`,
                order_id: config.provider_order_id,
                handler: async function (response: any) {
                  setIsSubmitting(true);
                  const verifyRes = await verifyPayment({
                    order_number: res.data!.order_number,
                    payment_method: "razorpay",
                    access_token: pendingAccessToken,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  }, token);
                  if (verifyRes.success) {
                    checkoutCompletingRef.current = true;
                    clearCart();
                    redirectToSuccess(res.data!.order_number);
                  } else {
                    redirectToFailure({ orderNumber: res.data!.order_number, paymentMethod: "razorpay", reason: verifyRes.message });
                    setIsSubmitting(false);
                  }
                },
                modal: {
                  ondismiss: async function () {
                    setIsSubmitting(true);
                    await cancelOrder(res.data!.order_number, token, pendingAccessToken);
                    redirectToFailure({ orderNumber: res.data!.order_number, paymentMethod: "razorpay", reason: "Payment cancelled." });
                    setIsSubmitting(false);
                  }
                },
                prefill: { name: shipName, email: shipEmail, contact: shipPhone },
                theme: { color: "#e9718b" }
              };
              new (window as any).Razorpay(options).open();
              return;
            } catch (err) {
              await cancelOrder(res.data.order_number, token, pendingAccessToken);
              redirectToFailure({ orderNumber: res.data.order_number, paymentMethod: "razorpay", reason: "Gateway error." });
              setIsSubmitting(false);
              return;
            }
          }
        }

        if (paymentMethod === "phonepe" && config?.checkout_url && !config.is_test_mode) {
          window.location.href = config.checkout_url;
          return;
        }

        if (config?.is_test_mode) {
          setIsSubmitting(false);
          setActiveSimulation({ orderNumber: res.data.order_number, amount: res.data.total_amount, method: paymentMethod, accessToken: pendingAccessToken });
          return;
        }

        await cancelOrder(res.data.order_number, token, pendingAccessToken);
        setError("Payment method temporarily unavailable.");
        setIsSubmitting(false);
      }
    } else {
      setError(res.message || "Order placement failed.");
      setIsSubmitting(false);
    }
  }

  const cartItemIds = new Set(items.map((i) => i.id));
  const candidateUpsells = upsellProducts.filter((p) => !cartItemIds.has(p.id)).slice(0, 3);
  const featuredCoupons = coupons.slice(0, 4);

  return (
    <main className="content-section" style={{ minHeight: "85vh", background: "linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)", padding: "2.5rem 1rem" }}>
      <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
        
        {/* Header Badges */}
        <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <p className="eyebrow" style={{ color: "#e9718b", letterSpacing: "1.5px", marginBottom: "0.2rem", fontWeight: 700 }}>Express Checkout</p>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>Complete Your Order</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "0.85rem", color: "#666666" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              256-Bit SSL Encrypted
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              Certified 925 Hallmarked
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><rect width="6" height="6" x="8" y="14" rx="1"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
              Free Express Shipping
            </span>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem 1.4rem", borderRadius: "14px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#b91c1c", fontSize: "0.94rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem", alignItems: "start" }}>
          
          {/* Left Column: Delivery & Payment Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
            
            {/* Step 1: Delivery Details */}
            <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", border: "1px solid #f0f0f0", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.3rem" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e9718b", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>1</span>
                  Delivery Details
                </h2>
                {!user && (
                  <span style={{ fontSize: "0.82rem", color: "#666" }}>
                    Have an account? <Link href="/account/login?redirect=/checkout" style={{ color: "#e9718b", fontWeight: 600 }}>Log in</Link>
                  </span>
                )}
              </div>

              {/* Saved Addresses for Logged-in User */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: "1.4rem" }}>
                  <p style={{ fontSize: "0.86rem", color: "#666", marginBottom: "0.6rem", fontWeight: 600 }}>Select a Saved Address:</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.8rem" }}>
                    {savedAddresses.map((addr) => {
                      const isSel = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          style={{
                            textAlign: "left",
                            padding: "0.8rem 1rem",
                            borderRadius: "14px",
                            border: isSel ? "2px solid #e9718b" : "1px solid #e5e5e5",
                            background: isSel ? "#fff5f7" : "#fafafa",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <strong style={{ display: "block", fontSize: "0.88rem", color: "#1a1a1a" }}>{addr.label || "Saved Address"}</strong>
                          <span style={{ fontSize: "0.78rem", color: "#666", display: "block", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {addr.address_line1}, {addr.city}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Delivery Input Fields */}
              <div style={{ display: "grid", gap: "1.1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      value={shipName}
                      onChange={(e) => setShipName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="auth-input"
                      style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formatIndianPhone(shipPhone)}
                      onChange={(e) => setShipPhone(normalizeIndianPhone(e.target.value))}
                      placeholder="10-digit mobile"
                      className="auth-input"
                      style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: shipPhoneInvalid ? "1.5px solid #ef4444" : "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                    />
                  </div>
                </div>

                {/* Email input with Tax Invoice reminder */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#444" }}>Email Address (Important for Invoice &amp; Tracking) *</label>
                    <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7"/></svg>
                      Bill Sent on Email
                    </span>
                  </div>
                  <input
                    type="email"
                    required
                    value={shipEmail}
                    onChange={(e) => setShipEmail(normalizeEmailInput(e.target.value))}
                    placeholder="e.g. priya.sharma@gmail.com"
                    className="auth-input"
                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: shipEmailInvalid ? "1.5px solid #ef4444" : "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                  />
                  <p style={{ fontSize: "0.78rem", color: "#666666", margin: "4px 0 0 2px" }}>
                    Your official GST tax invoice and live courier dispatch notifications will be emailed here.
                  </p>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>House / Flat No., Building, Street Address *</label>
                  <input
                    type="text"
                    required
                    value={shipAddressLine1}
                    onChange={(e) => setShipAddressLine1(e.target.value)}
                    placeholder="e.g. Flat 402, Royal Palms, MG Road"
                    className="auth-input"
                    style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>Landmark (Optional, for quick delivery)</label>
                    <input
                      type="text"
                      value={shipLandmark}
                      onChange={(e) => setShipLandmark(e.target.value)}
                      placeholder="e.g. Near Metro / Shiv Mandir"
                      className="auth-input"
                      style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                    />
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#444" }}>PIN Code *</label>
                      {pincodeStatus && <span style={{ fontSize: "0.74rem", color: "#e9718b" }}>{pincodeStatus}</span>}
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={shipPincode}
                      onChange={(e) => setShipPincode(normalizeIndianPincode(e.target.value))}
                      placeholder="6-digit PIN"
                      className="auth-input"
                      style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>State *</label>
                    <select
                      required
                      value={shipState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="auth-input"
                      style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem", background: "#fff" }}
                    >
                      <option value="" disabled hidden>Select State</option>
                      {Object.keys(INDIAN_STATES_AND_CITIES).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, color: "#444", marginBottom: "0.3rem" }}>City *</label>
                    {shipState && INDIAN_STATES_AND_CITIES[shipState] ? (
                      <select
                        required
                        value={shipCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        className="auth-input"
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem", background: "#fff" }}
                      >
                        <option value="" disabled hidden>Select City</option>
                        {INDIAN_STATES_AND_CITIES[shipState].map((ct) => (
                          <option key={ct} value={ct}>{ct}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        required
                        value={shipCity}
                        onChange={(e) => handleCityChange(e.target.value)}
                        placeholder="Enter City"
                        className="auth-input"
                        style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "14px", border: "1.5px solid #e0e0e0", fontSize: "0.95rem" }}
                      />
                    )}
                  </div>
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", color: "#555", cursor: "pointer", marginTop: "0.2rem" }}>
                  <input
                    type="checkbox"
                    checked={saveAddressForFuture}
                    onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                    style={{ accentColor: "#e9718b", width: "16px", height: "16px" }}
                  />
                  Save this address securely for next time
                </label>
              </div>
            </div>

            {/* Step 2: Payment Method (UPI & COD prominently offered) */}
            <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", border: "1px solid #f0f0f0", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.2rem 0", color: "#1a1a1a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#e9718b", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700 }}>2</span>
                Payment Options
              </h2>

              {/* Seductive Prepaid Offer Banner */}
              <div style={{ background: "linear-gradient(135deg, #fff5f7 0%, #FAF8F5 100%)", border: "1.5px dashed #e9718b", borderRadius: "18px", padding: "1.2rem 1.4rem", marginBottom: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.5rem" }}>
                  <span style={{ background: "#e9718b", color: "#fff", padding: "3px 8px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.5px" }}>PREPAID PRIVILEGE</span>
                  <strong style={{ fontSize: "0.95rem", color: "#1a1a1a" }}>Pay Online via UPI &amp; Save More!</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.6rem", fontSize: "0.82rem", color: "#555" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Extra 5% OFF</strong> instantly deducted</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Priority 24-Hr Express Dispatch</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>Zero COD Handling Fee</strong></span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span><strong>100% Instant Refund Protection</strong></span>
                  </div>
                </div>
              </div>

              {/* Payment Methods List */}
              <div style={{ display: "grid", gap: "1rem" }}>
                
                {/* 1. UPI & Cards (Prepaid) */}
                {hasGateway("razorpay") && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "1.2rem",
                      borderRadius: "18px",
                      border: paymentMethod === "razorpay" ? "2px solid #e9718b" : "1.5px solid #e5e5e5",
                      background: paymentMethod === "razorpay" ? "#fff5f7" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      style={{ accentColor: "#e9718b", width: "18px", height: "18px", marginTop: "3px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                        <strong style={{ fontSize: "1rem", color: "#1a1a1a" }}>UPI / Cards / NetBanking (Online Prepaid)</strong>
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontSize: "0.74rem", fontWeight: 700 }}>
                          RECOMMENDED · EXTRA 5% SAVINGS
                        </span>
                      </div>
                      <p style={{ fontSize: "0.83rem", color: "#666", margin: "4px 0 0 0" }}>
                        Google Pay, PhonePe, Paytm, BHIM UPI, Debit/Credit Cards &amp; NetBanking.
                      </p>
                    </div>
                  </label>
                )}

                {/* 2. PhonePe Direct UPI */}
                {hasGateway("phonepe") && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "1.2rem",
                      borderRadius: "18px",
                      border: paymentMethod === "phonepe" ? "2px solid #e9718b" : "1.5px solid #e5e5e5",
                      background: paymentMethod === "phonepe" ? "#fff5f7" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="phonepe"
                      checked={paymentMethod === "phonepe"}
                      onChange={() => setPaymentMethod("phonepe")}
                      style={{ accentColor: "#e9718b", width: "18px", height: "18px", marginTop: "3px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                        <strong style={{ fontSize: "1rem", color: "#1a1a1a" }}>PhonePe Direct UPI &amp; Wallets</strong>
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontSize: "0.74rem", fontWeight: 700 }}>
                          EXTRA 5% SAVINGS
                        </span>
                      </div>
                      <p style={{ fontSize: "0.83rem", color: "#666", margin: "4px 0 0 0" }}>
                        1-Click direct UPI checkout via PhonePe app.
                      </p>
                    </div>
                  </label>
                )}

                {/* 3. Cash on Delivery (COD) */}
                {hasGateway("cod") && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "1.2rem",
                      borderRadius: "18px",
                      border: paymentMethod === "cod" ? "2px solid #e9718b" : "1.5px solid #e5e5e5",
                      background: paymentMethod === "cod" ? "#fff5f7" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      style={{ accentColor: "#e9718b", width: "18px", height: "18px", marginTop: "3px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                        <strong style={{ fontSize: "1rem", color: "#1a1a1a" }}>Cash on Delivery (COD)</strong>
                        <span style={{ background: "#f3f4f6", color: "#4b5563", padding: "3px 8px", borderRadius: "8px", fontSize: "0.74rem", fontWeight: 600 }}>
                          AVAILABLE NATIONWIDE
                        </span>
                      </div>
                      <p style={{ fontSize: "0.83rem", color: "#666", margin: "4px 0 0 0" }}>
                        Pay cash directly to the courier agent when your jewellery package arrives at your doorstep.
                      </p>
                    </div>
                  </label>
                )}

              </div>
            </div>

          </div>

          {/* Right Column: Order Summary, Upsells & Coupons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.8rem" }}>
            
            <div style={{ background: "#ffffff", borderRadius: "24px", padding: "2rem", border: "1px solid #f0f0f0", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)" }}>
              
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 1.2rem 0", color: "#1a1a1a" }}>
                Order Bag ({items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? "Item" : "Items"})
              </h3>

              {/* Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", maxHeight: "260px", overflowY: "auto", paddingRight: "4px", marginBottom: "1.4rem" }}>
                {items.map((item) => (
                  <div key={item.slug} style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "0.8rem", borderBottom: "1px solid #f5f5f5" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "10px", overflow: "hidden", background: "#fafafa", flexShrink: 0, border: "1px solid #eee" }}>
                      <img
                        src={resolveAssetUrl(item.image || "/jewellery/drop-earrings.jpg")}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a1a1a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {item.name}
                      </p>
                      <span style={{ fontSize: "0.78rem", color: "#888" }}>Qty: {item.quantity}</span>
                    </div>
                    <strong style={{ fontSize: "0.92rem", color: "#1a1a1a" }}>
                      {formatPrice(item.price * item.quantity, currencySymbol)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* One-Click Checkout Upsells */}
              {candidateUpsells.length > 0 && (
                <div style={{ background: "#FAF8F5", borderRadius: "16px", padding: "1.1rem", marginBottom: "1.4rem", border: "1px solid #f0ece1" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "0.6rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <strong style={{ fontSize: "0.84rem", color: "#1a1a1a" }}>Recommended Add-Ons:</strong>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {candidateUpsells.map((upsell) => (
                      <div key={upsell.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", background: "#ffffff", padding: "8px 10px", borderRadius: "12px", border: "1px solid #f0f0f0" }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a1a1a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {upsell.name}
                          </p>
                          <span style={{ fontSize: "0.78rem", color: "#e9718b", fontWeight: 700 }}>
                            {formatPrice(Number(upsell.effective_price || upsell.sale_price || upsell.price), currencySymbol)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddUpsell(upsell)}
                          disabled={addingUpsellId === upsell.id}
                          className="secondary-button"
                          style={{ padding: "4px 10px", fontSize: "0.78rem", borderRadius: "8px", flexShrink: 0 }}
                        >
                          {addingUpsellId === upsell.id ? "Adding..." : "+ Add"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Promo Code Box */}
              <div style={{ marginBottom: "1.4rem" }}>
                <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "#444", marginBottom: "0.4rem" }}>Apply Promo Code / Coupon:</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g. WELCOME10)"
                    className="auth-input"
                    style={{ flex: 1, padding: "0.75rem 0.9rem", borderRadius: "12px", border: "1.5px solid #e0e0e0", fontSize: "0.88rem", textTransform: "uppercase" }}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ padding: "0.75rem 1rem", borderRadius: "12px", background: "#fee2e2", color: "#b91c1c", border: "none", fontWeight: 600, fontSize: "0.84rem", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      className="primary-button"
                      style={{ padding: "0.75rem 1.2rem", borderRadius: "12px", fontSize: "0.85rem" }}
                    >
                      Apply
                    </button>
                  )}
                </div>

                {couponSuccess && (
                  <p style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7"/></svg>
                    {couponSuccess}
                  </p>
                )}
                {couponError && (
                  <p style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "6px", fontWeight: 600 }}>
                    {couponError}
                  </p>
                )}

                {/* Quick Tap Demo Coupons */}
                {featuredCoupons.length > 0 && !appliedCoupon && (
                  <div style={{ marginTop: "0.8rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: "4px" }}>Available Offers (Tap to apply):</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {featuredCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleApplyCoupon(c.code)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "8px",
                            border: "1px dashed #e9718b",
                            background: "#fff5f7",
                            color: "#e9718b",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {c.code} ({c.type === "percent" ? `${c.value}% OFF` : `₹${Math.round(Number(c.value))} OFF`})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "1.1rem", display: "grid", gap: "0.7rem", fontSize: "0.9rem", color: "#555" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Bag Subtotal</span>
                  <span style={{ color: "#1a1a1a", fontWeight: 600 }}>{formatPrice(subtotal, currencySymbol)}</span>
                </div>

                {discountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                    <span>Coupon Savings ({appliedCoupon?.code})</span>
                    <span>- {formatPrice(discountAmount, currencySymbol)}</span>
                  </div>
                )}

                {isPrepaidMethod && prepaidDiscountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                    <span>Prepaid Online Savings (5% OFF)</span>
                    <span>- {formatPrice(prepaidDiscountAmount, currencySymbol)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Shipping &amp; Insurance</span>
                  {shippingCost === 0 ? (
                    <span style={{ color: "#16a34a", fontWeight: 700 }}>FREE</span>
                  ) : (
                    <span>{formatPrice(shippingCost, currencySymbol)}</span>
                  )}
                </div>

                {paymentMethod === "cod" && codFeeAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>COD Handling Fee</span>
                    <span>{formatPrice(codFeeAmount, currencySymbol)}</span>
                  </div>
                )}

                {walletDiscountAmount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                    <span>Wallet Balance Applied</span>
                    <span>- {formatPrice(walletDiscountAmount, currencySymbol)}</span>
                  </div>
                )}

                <div style={{ borderTop: "1.5px solid #eee", paddingTop: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "1.05rem", color: "#1a1a1a", display: "block" }}>Total Amount</strong>
                    <span style={{ fontSize: "0.75rem", color: "#888" }}>Inclusive of all taxes</span>
                  </div>
                  <strong style={{ fontSize: "1.5rem", color: "#1a1a1a", fontWeight: 800 }}>
                    {formatPrice(grandTotal, currencySymbol)}
                  </strong>
                </div>
              </div>

              {/* Order Placement CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="primary-button"
                style={{
                  width: "100%",
                  padding: "1.1rem",
                  marginTop: "1.5rem",
                  borderRadius: "16px",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                {isSubmitting ? (
                  <span>Processing Your Order…</span>
                ) : paymentMethod === "cod" ? (
                  <span>Confirm Cash on Delivery ({formatPrice(grandTotal, currencySymbol)})</span>
                ) : (
                  <span>Pay Securely via UPI / Cards ({formatPrice(grandTotal, currencySymbol)})</span>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.78rem", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>100% Safe &amp; Verified Checkout · 15-Day Easy Returns</span>
              </div>

            </div>

          </div>

        </form>

      </div>

      {/* Test Simulation Modal */}
      {activeSimulation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "1rem" }}>
          <div style={{ background: "#ffffff", padding: "2.2rem", borderRadius: "24px", maxWidth: "440px", width: "100%", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", textAlign: "center" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "#fff5f7", color: "#e9718b", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.4rem", color: "#1a1a1a" }}>Simulate UPI / Card Payment</h3>
            <p style={{ fontSize: "0.88rem", color: "#666", marginBottom: "1.5rem" }}>
              Test Mode Active for Order <strong>#{activeSimulation.orderNumber}</strong>. Amount: <strong>{formatPrice(activeSimulation.amount, currencySymbol)}</strong>.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleConfirmSimulation}
                disabled={isSubmitting}
                className="primary-button"
                style={{ flex: 1, padding: "0.85rem", borderRadius: "12px", fontSize: "0.92rem" }}
              >
                Simulate Success
              </button>
              <button
                type="button"
                onClick={handleCancelSimulation}
                disabled={isSubmitting}
                style={{ padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #e0e0e0", background: "#fafafa", color: "#666", fontWeight: 600, fontSize: "0.92rem", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p style={{ color: "#e9718b", fontWeight: 600 }}>Loading checkout…</p>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
