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

  const [introFinished, setIntroFinished] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setTransitioning(true);

    window.setTimeout(() => {
      setIntroFinished(true);
      router.replace("/login");
    }, 450);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setIntroFinished(true);
      setTransitioning(false);
    }
  }, [pathname]);

  /*
   * ROOT ENTRY
   *
   * "/" কখনো Homepage render করবে না।
   * প্রথমে শুধু Intro থাকবে।
   */
  if (pathname === "/") {
    return (
      <main className="fixed inset-0 overflow-hidden bg-[#030506]">
        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            transitioning
              ? "scale-[1.04] opacity-0"
              : "scale-100 opacity-100"
          }`}
        >
          <FenixIntro onComplete={handleIntroComplete} />
        </div>

        {!introFinished && (
          <div className="absolute inset-0 bg-[#030506]" />
        )}
      </main>
    );
  }

  /*
   * LOGIN + OTHER ROUTES
   */
  return <>{children}</>;
}
