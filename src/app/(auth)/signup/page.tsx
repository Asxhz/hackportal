import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "./signup-form";
import { isAccountType } from "@/lib/tracks";

export const metadata: Metadata = { title: "Create account" };

type SP = Promise<{ as?: string }>;

export default function SignupPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="rise space-y-8">
      <div className="space-y-2">
        <h1 className="display text-[34px] leading-tight">Create your account</h1>
        <p className="text-[15px] text-ink-3">Pick how you want to take part. You can change this until you submit.</p>
      </div>
      <Suspense fallback={<div className="h-96" />}>
        <Dynamic searchParams={searchParams} />
      </Suspense>
      <p className="text-sm text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="link">
          Sign in
        </Link>
      </p>
    </div>
  );
}

async function Dynamic({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return <SignupForm preset={isAccountType(sp.as) ? sp.as : undefined} />;
}
