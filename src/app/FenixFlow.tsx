"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FenixIntro from "./FenixIntro";

const INTRO_SEEN_KEY = "fenix_intro_seen";

export default function FenixFlow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // null = browser এখনো check করা হয়নি
  // true = Intro দেখাতে হবে
  // false = normal page দেখাতে হবে
  const [introState, setIntroState] = useState<boolean | null>(null);

  useEffect(() => {
    /*
     * Browser-side session check.
     *
     * নতুন tab/session-এ প্রথমবার "/" খুললে Intro দেখাবে।
     * Intro শেষ করে Login-এ যাওয়ার পর এই value true হয়ে থাকবে।
     * Login successful হয়ে "/" এ ফিরলে Intro আর দেখাবে না।
     */
    const introSeen =
      sessionStorage.getItem(INTRO_SEEN_KEY) === "true";

    if (pathname === "/" && !introSeen) {
      setIntroState(true);
    } else {
      setIntroState(false);
    }
  }, [pathname]);

  const handleIntroComplete = useCallback(() => {
    /*
     * Intro সম্পূর্ণ হয়েছে।
     *
     * আগে sessionStorage-এ mark করছি,
     * তারপর Login page-এ যাচ্ছি।
     */
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");

    router.replace("/login");
  }, [router]);

  /*
   * Browser-side decision হওয়ার আগ পর্যন্ত
   * কোনো Homepage render হবে না।
   *
   * তাই initial Homepage flash বন্ধ।
   */
  if (introState === null) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen bg-[#030506]" />
    );
  }

  /*
   * "/" + Intro required
   *
   * এখানে children render হচ্ছে না।
   *
   * অর্থাৎ Homepage DOM-এই আসবে না।
   */
  if (pathname === "/" && introState === true) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen overflow-hidden bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  /*
   * Login page অথবা Intro already completed হওয়ার পর Homepage।
   */
  return <>{children}</>;
  }
