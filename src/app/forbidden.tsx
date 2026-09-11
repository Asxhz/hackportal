import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <p className="eyebrow mb-3">403</p>
        <h1 className="display text-[36px]">Organizers only</h1>
        <p className="mt-3 text-ink-3">This account is not an organizer account.</p>
        <Link href="/dashboard" className={buttonClass("secondary", "md", "mt-8")}>
          Back to your dashboard
        </Link>
      </div>
    </main>
  );
}
