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
  const [showIntro, setShowIntro] = useState(false);

  const handleIntroComplete = useCallback(() => {
    /*
     * IMPORTANT:
     * Intro শেষ হওয়ার সাথে সাথে Homepage render করা হবে না।
     * সরাসরি Login page-এ যাবে।
     */
    setShowIntro(false);

    router.replace("/login");
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    /*
     * শুধুমাত্র Homepage route-এর জন্য Intro চালু হবে।
     */
    if (!mounted) return;

    if (pathname === "/") {
      setShowIntro(true);
    } else {
      setShowIntro(false);
    }
  }, [pathname, mounted]);

  /*
   * Browser প্রথম load করার সময় কোনো page flash হতে দেওয়া হবে না।
   */
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#030506]" />
    );
  }

  /*
   * "/" route-এ Intro চলাকালীন Homepage-এর children
   * একদম render করা হচ্ছে না।
   *
   * তাই:
   * Intro → Login
   *
   * Homepage flash করার কোনো সুযোগ নেই।
   */
  if (pathname === "/" && showIntro) {
    return (
      <div className="fixed inset-0 z-[999999] overflow-hidden bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  /*
   * Login এবং অন্যান্য route স্বাভাবিকভাবে render হবে।
   */
  return <>{children}</>;
}
