"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import FenixIntro from "./FenixIntro";

const INTRO_KEY = "fenix-intro-seen";

export default function FenixFlow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [showIntro, setShowIntro] = useState(false);
  const [ready, setReady] = useState(false);

  const handleIntroComplete = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(INTRO_KEY, "true");
    }

    setShowIntro(false);

    window.setTimeout(() => {
      router.replace("/login");
    }, 50);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setShowIntro(false);
      setReady(true);
      return;
    }

    const introAlreadySeen =
      typeof window !== "undefined" &&
      sessionStorage.getItem(INTRO_KEY) === "true";

    if (introAlreadySeen) {
      setShowIntro(false);
      setReady(true);
      return;
    }

    setShowIntro(true);
    setReady(true);
  }, [pathname]);

  /*
   * Initial render protection.
   * This prevents Homepage from flashing before the intro decision is made.
   */
  if (!ready) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#030506]" />
    );
  }

  /*
   * First visit:
   * / → Intro only
   *
   * IMPORTANT:
   * Homepage is NOT rendered underneath the intro.
   * So there will be no Homepage flash.
   */
  if (pathname === "/" && showIntro) {
    return (
      <div className="fixed inset-0 z-[99999] bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  /*
   * After intro:
   * /login → Login page
   *
   * After successful login:
   * / → Homepage
   *
   * Since sessionStorage remembers the intro,
   * Homepage will NOT trigger the intro again.
   */
  return <>{children}</>;
}
