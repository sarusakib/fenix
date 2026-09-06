"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import FenixIntro from "./FenixIntro";

export default function FenixFlow({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [introDone, setIntroDone] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (pathname !== "/") {
      setCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }

      setCheckingAuth(false);
    };

    void checkAuth();
  }, [pathname, router]);

  if (pathname === "/" && !introDone) {
    return (
      <>
        <FenixIntro />
        <div className="min-h-screen opacity-0" />
      </>
    );
  }

  if (pathname === "/" && checkingAuth) {
    return <div className="min-h-screen bg-surface" />;
  }

  return <>{children}</>;
}
