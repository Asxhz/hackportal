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
        <h1 className="display text-[34px] leading-tight">Welcome back</h1>
        <p className="text-[15px] text-ink-3">Sign in to continue your application or review queue.</p>
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
      {sp.error === "confirm" ? <Alert tone="error">That confirmation link is invalid or expired. Sign in to request a new one.</Alert> : null}
      <LoginForm next={typeof sp.next === "string" ? sp.next : undefined} />
    </>
  );
}
