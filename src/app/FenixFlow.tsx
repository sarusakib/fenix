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
  const [isLeaving, setIsLeaving] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIsLeaving(true);

    window.setTimeout(() => {
      setIntroDone(true);
      router.replace("/login");
    }, 450);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setIntroDone(true);
      setIsLeaving(false);
    }
  }, [pathname]);

  if (pathname === "/") {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#030506]">
        {!introDone && (
          <div
            className={`fixed inset-0 z-[99999] transition-all duration-450 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isLeaving
                ? "scale-[1.04] opacity-0"
                : "scale-100 opacity-100"
            }`}
          >
            <FenixIntro onComplete={handleIntroComplete} />
          </div>
        )}

        <div
          className={`min-h-screen transition-all duration-500 ease-out ${
            isLeaving
              ? "scale-100 opacity-100"
              : "scale-[0.985] opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
