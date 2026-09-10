import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { getMyApplication, getMyProfile } from "@/lib/applications/queries";
import { PageHeader } from "@/components/portal/shell";
import { AccountForms } from "./account-forms";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-paper-2" />}>
      <Account />
    </Suspense>
  );
}

async function Account() {
  await requireUser("/account");
  const [profile, app] = await Promise.all([getMyProfile(), getMyApplication()]);
  if (!profile) throw new Error("Profile missing");
  const locked = !!app && app.status !== "draft";
  return (
    <>
      <PageHeader eyebrow="Account" title={profile.full_name || profile.email} description={profile.email} />
      <AccountForms fullName={profile.full_name} accountType={profile.account_type} locked={locked} hasDraft={!!app && app.status === "draft"} />
    </>
  );
}
