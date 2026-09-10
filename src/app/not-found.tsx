import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow mb-3">404</p>
        <h1 className="display text-[36px]">Nothing here</h1>
        <p className="mt-3 text-ink-3">That page doesn&apos;t exist or was moved.</p>
        <Link href="/" className={buttonClass("secondary", "md", "mt-8")}>
          Go home
        </Link>
      </div>
    </main>
  );
}
