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

  const [introState, setIntroState] = useState<boolean | null>(null);

  useEffect(() => {
    const introSeen =
      sessionStorage.getItem(INTRO_SEEN_KEY) === "true";

    if (pathname === "/" && !introSeen) {
      setIntroState(true);
    } else {
      setIntroState(false);
    }
  }, [pathname]);

  const handleIntroComplete = useCallback(() => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "true");
    router.replace("/login");
  }, [router]);

  if (introState === null) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen bg-[#030506]" />
    );
  }

  if (pathname === "/" && introState === true) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen overflow-hidden bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  return <>{children}</>;
}
