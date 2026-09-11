import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "Sign in" };

type SP = Promise<{ next?: string; error?: string }>;

export default function LoginPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="rise space-y-8">
      <div className="space-y-2">
        <h1 className="display text-[34px] leading-tight">Sign in</h1>
        <p className="text-[15px] text-ink-3">Sign in to your Cal Hacks account.</p>
      </div>
      <Suspense fallback={<div className="h-64" />}>
        <Dynamic searchParams={searchParams} />
      </Suspense>
      <p className="text-sm text-ink-3">
        New here?{" "}
        <Link href="/signup" className="link">
          Create an account
        </Link>
      </p>
    </div>
  );
}

async function Dynamic({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  return (
    <>
      {sp.error === "confirm" ? <Alert tone="error">That link is invalid or has expired. Sign in with your email and password.</Alert> : null}
      <LoginForm next={typeof sp.next === "string" ? sp.next : undefined} />
    </>
  );
}
