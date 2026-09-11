import type { Metadata } from "next";
import { Suspense } from "react";
import { requireOrganizer } from "@/lib/auth/session";
import { listOrganizers } from "@/lib/organizer/queries";
import { PageHeader } from "@/components/portal/shell";
import { PromoteForm } from "./promote-form";

export const metadata: Metadata = { title: "Team" };

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-paper-2" />}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  await requireOrganizer();
  const organizers = await listOrganizers();
  return (
    <>
      <PageHeader eyebrow="Team" title="Organizers" description="Organizers can review applications, record decisions, and add other organizers." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card rise-2 overflow-hidden">
          <ul className="divide-y divide-line">
            {organizers.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{o.full_name || "No name"}</p>
                  <p className="text-xs text-ink-4">{o.email}</p>
                </div>
                <span className="text-xs text-ink-4">since {new Date(o.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
              </li>
            ))}
          </ul>
        </section>
        <PromoteForm />
      </div>
    </>
  );
}
