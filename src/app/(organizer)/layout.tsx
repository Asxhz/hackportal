import { Suspense } from "react";
import { requireOrganizer } from "@/lib/auth/session";
import { Shell } from "@/components/portal/shell";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Chrome>{children}</Chrome>
    </Suspense>
  );
}

async function Chrome({ children }: { children: React.ReactNode }) {
  const user = await requireOrganizer();
  return (
    <Shell
      user={user}
      nav={[
        { href: "/organizer", label: "Applications" },
        { href: "/organizer/team", label: "Team" },
      ]}
    >
      {children}
    </Shell>
  );
}
