"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FenixIntro from "./FenixIntro";

export default function FenixFlow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [introDone, setIntroDone] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroDone(true);
  }, []);

  useEffect(() => {
    if (pathname === "/" && introDone) {
      router.replace("/login");
    }
  }, [pathname, introDone, router]);

  // Homepage (/)
  if (pathname === "/") {
    if (!introDone) {
      return <FenixIntro onComplete={handleIntroComplete} />;
    }

    return <div className="min-h-screen bg-surface" />;
  }

  // Login এবং অন্যান্য page
  return <>{children}</>;
}
