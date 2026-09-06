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
  const [transitioning, setTransitioning] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setTransitioning(true);

    const timer = window.setTimeout(() => {
      setIntroDone(true);
      router.replace("/login");
    }, 180);

    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setIntroDone(true);
      setTransitioning(false);
    }
  }, [pathname]);

  // Initial website entry
  if (pathname === "/") {
    if (!introDone) {
      return (
        <div
          className={`fixed inset-0 z-[99999] transition-all duration-500 ease-out ${
            transitioning
              ? "scale-[1.02] opacity-0"
              : "scale-100 opacity-100"
          }`}
        >
          <FenixIntro onComplete={handleIntroComplete} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#030506]" />
    );
  }

  // Login and all other pages
  return <>{children}</>;
}
