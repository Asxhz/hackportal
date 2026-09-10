"use client";

import { useActionState } from "react";
import { switchAccountType, updateName } from "@/lib/applications/actions";
import { ACCOUNT_TYPES, TRACKS, type AccountType } from "@/lib/tracks";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";

type S = { error?: string; ok?: boolean };

export function AccountForms({ fullName, accountType, locked, hasDraft }: { fullName: string; accountType: AccountType; locked: boolean; hasDraft: boolean }) {
  const [nameState, nameAction, namePending] = useActionState<S, FormData>(updateName, {});
  const [roleState, roleAction, rolePending] = useActionState<S, FormData>(switchAccountType, {});

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={nameAction} className="card rise p-6 space-y-4">
        <h2 className="display text-[22px]">Profile</h2>
        {nameState.error ? <Alert tone="error">{nameState.error}</Alert> : nameState.ok ? <Alert tone="success">Saved.</Alert> : null}
        <Field id="full_name" label="Full name">
          <Input id="full_name" name="full_name" defaultValue={fullName} maxLength={120} autoComplete="name" />
        </Field>
        <Button type="submit" variant="secondary" disabled={namePending}>
          {namePending ? "Saving…" : "Save"}
        </Button>
      </form>

      <form action={roleAction} className="card rise-2 p-6 space-y-4">
        <div>
          <h2 className="display text-[22px]">Participation</h2>
          <p className="mt-1 text-sm text-ink-3">
            {locked ? "Locked: your application has been submitted." : hasDraft ? "Switching discards your current draft." : "Choose how you want to take part."}
          </p>
        </div>
        {roleState.error ? <Alert tone="error">{roleState.error}</Alert> : null}
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map((t) => (
            <label
              key={t}
              className={cn(
                "flex flex-col gap-0.5 rounded-md border border-line-2 bg-white px-3.5 py-3 text-sm transition",
                locked ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-ink-4",
                "has-[:checked]:border-berkeley has-[:checked]:bg-[#f2f6fb]",
              )}
            >
              <input type="radio" name="account_type" value={t} defaultChecked={accountType === t} disabled={locked} className="sr-only" />
              <span className="font-semibold">{TRACKS[t].label}</span>
              <span className="text-xs text-ink-3">{TRACKS[t].tagline}</span>
            </label>
          ))}
        </div>
        <Button type="submit" variant="secondary" disabled={locked || rolePending}>
          {rolePending ? "Updating…" : "Update role"}
        </Button>
      </form>
    </div>
  );
}
