export function normalizeEmailInput(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

export function isValidEmailInput(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmailInput(value));
}

export function normalizeIndianPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatIndianPhone(value: string): string {
  const digits = normalizeIndianPhone(value);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function isValidIndianPhone(value: string): boolean {
  return /^[6-9][0-9]{9}$/.test(normalizeIndianPhone(value));
}

export function normalizeIndianPincode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export type PincodeLookupResult = {
  city: string;
  state: string;
};

export async function fetchPincodeLocation(pincode: string): Promise<PincodeLookupResult> {
  const normalized = normalizeIndianPincode(pincode);

  if (normalized.length !== 6) {
    throw new Error("Enter a valid 6-digit pincode first.");
  }

  const response = await fetch(`https://api.postalpincode.in/pincode/${normalized}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to verify this pincode right now.");
  }

  const payload = (await response.json()) as Array<{
    Status?: string;
    Message?: string;
    PostOffice?: Array<{
      District?: string;
      State?: string;
      Name?: string;
      Block?: string;
    }>;
  }>;

  const entry = payload?.[0];
  const office = entry?.PostOffice?.[0];

  if (entry?.Status !== "Success" || !office?.State) {
    throw new Error("We could not find city/state for this pincode.");
  }

  return {
    city: office.District || office.Block || office.Name || "",
    state: office.State,
  };
}
