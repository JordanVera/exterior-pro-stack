"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuotesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customer/jobs");
  }, [router]);

  return null;
}
