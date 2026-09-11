"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow mb-3">Error</p>
        <h1 className="display text-[36px]">Something went wrong</h1>
        <p className="mt-3 text-ink-3">Your saved data is unaffected. Try again, or email team@hackberkeley.org if it keeps happening.</p>
        <Button variant="secondary" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
