import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { Shell } from "@/components/portal/shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Chrome>{children}</Chrome>
    </Suspense>
  );
}

async function Chrome({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <Shell
      user={user}
      nav={[
        { href: "/dashboard", label: "Overview" },
        { href: "/apply", label: "Application" },
        { href: "/account", label: "Account" },
      ]}
    >
      {children}
    </Shell>
  );
}
