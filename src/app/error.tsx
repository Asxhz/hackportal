"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow mb-3">Something broke</p>
        <h1 className="display text-[36px]">We hit a snag</h1>
        <p className="mt-3 text-ink-3">Nothing was lost. Try again, and if it keeps happening let an organizer know.</p>
        <Button variant="secondary" className="mt-8" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
