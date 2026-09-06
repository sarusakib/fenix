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

  const [mounted, setMounted] = useState(false);
  const [introActive, setIntroActive] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    /*
     * Intro শুধুমাত্র root "/" route-এ শুরু হবে।
     */
    if (pathname === "/") {
      setIntroActive(true);
    } else {
      setIntroActive(false);
    }
  }, [pathname, mounted]);

  const handleIntroComplete = useCallback(() => {
    /*
     * Intro শেষ হওয়ার পর Homepage render করার আগে
     * সরাসরি Login route-এ যাওয়া হবে।
     */
    setIntroActive(false);

    router.replace("/login");
  }, [router]);

  /*
   * React mount হওয়ার আগ পর্যন্ত সম্পূর্ণ কালো screen।
   *
   * এতে Homepage-এর initial flash বন্ধ হবে।
   */
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen bg-[#030506]" />
    );
  }

  /*
   * ROOT ROUTE
   *
   * Intro চলাকালীন children render করা হবে না।
   *
   * তাই Homepage DOM-এই থাকবে না।
   */
  if (pathname === "/" && introActive) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen overflow-hidden bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  /*
   * Login বা অন্য route হলে normal children render হবে।
   */
  return <>{children}</>;
}
