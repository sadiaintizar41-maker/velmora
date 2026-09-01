"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();
  // The homepage renders VelmoraHome.jsx, which has its own
  // transparent-to-solid Navbar built into the cinematic hero -
  // showing this header too would duplicate navigation there.
  // Admin pages have their own sidebar chrome; the storefront
  // header never belongs there.
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  return <SiteHeader />;
}
