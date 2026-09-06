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

  /*
   * IMPORTANT:
   * Initial state pathname থেকেই নির্ধারণ করা হচ্ছে।
   *
   * তাই "/" হলে প্রথম render থেকেই Intro active থাকবে।
   * Homepage একবারও render হবে না।
   */
  const [introActive, setIntroActive] = useState(
    pathname === "/"
  );

  /*
   * Route পরিবর্তন হলে Intro state synchronize করা।
   */
  useEffect(() => {
    if (pathname === "/") {
      setIntroActive(true);
    } else {
      setIntroActive(false);
    }
  }, [pathname]);

  /*
   * Intro শেষ হলে সরাসরি Login page।
   *
   * Homepage render করার কোনো intermediate state নেই।
   */
  const handleIntroComplete = useCallback(() => {
    setIntroActive(false);
    router.replace("/login");
  }, [router]);

  /*
   * ROOT "/" ROUTE
   *
   * Intro active থাকলে শুধু Intro render হবে।
   *
   * children = Homepage
   * কিন্তু এখানে children render করা হচ্ছে না।
   */
  if (pathname === "/" && introActive) {
    return (
      <div className="fixed inset-0 z-[999999] min-h-screen overflow-hidden bg-[#030506]">
        <FenixIntro onComplete={handleIntroComplete} />
      </div>
    );
  }

  /*
   * Login / অন্যান্য route
   */
  return <>{children}</>;
    }
