"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type FloatingWhatsappWidgetProps = {
  phone: string;
};

export function FloatingWhatsappWidget({ phone }: FloatingWhatsappWidgetProps) {
  const pathname = usePathname();
  const isRegistryRoute =
    pathname === "/warranty-portal" ||
    pathname === "/warranty-status" ||
    pathname === "/service-claim" ||
    pathname === "/buyback-request";

  const normalizedPhone = useMemo(() => phone.replace(/\D/g, ""), [phone]);

  if (isRegistryRoute) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${normalizedPhone}?text=Hi%20Little%20Divinity,%20I'd%20like%20to%20inquire%20about%20your%20handcrafted%20brass%20products.`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float-widget"
      aria-label="Chat on WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.66.986 3.292 1.503 4.933 1.504 5.385.002 9.774-4.388 9.777-9.78.002-2.61-1.015-5.066-2.868-6.92C16.637 2.103 14.186.855 11.58.855c-5.383 0-9.77 4.387-9.772 9.776-.001 1.705.447 3.37 1.299 4.843l-.99 3.613 3.7-.972zm12.357-6.907c-.302-.151-1.785-.882-2.057-.981-.273-.099-.471-.148-.669.151-.197.297-.767.98-.94 1.179-.173.197-.347.222-.649.071-.302-.151-1.272-.469-2.424-1.496-.896-.799-1.501-1.787-1.677-2.088-.176-.302-.019-.465.132-.614.136-.134.302-.352.453-.528.151-.176.202-.302.302-.503.101-.201.05-.378-.025-.528-.076-.151-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.785-.73 2.033-1.433.248-.704.248-1.306.173-1.433-.075-.126-.272-.201-.573-.352z" />
      </svg>
    </a>
  );
}
