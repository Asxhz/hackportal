"use client";

import { useActionState } from "react";
import { signUp, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { ACCOUNT_TYPES, TRACKS, type AccountType } from "@/lib/tracks";
import { cn } from "@/lib/cn";

export function SignupForm({ preset }: { preset?: AccountType }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});

  if (state.ok) {
    return <Alert tone="success">{state.message}</Alert>;
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">I want to join as a</legend>
        <div className="grid grid-cols-2 gap-2">
          {ACCOUNT_TYPES.map((t) => (
            <label
              key={t}
              className={cn(
                "group relative flex cursor-pointer flex-col gap-0.5 rounded-md border border-line-2 bg-white px-3.5 py-3 transition hover:border-ink-4",
                "has-[:checked]:border-berkeley has-[:checked]:bg-[#f2f6fb] has-[:checked]:ring-[3px] has-[:checked]:ring-berkeley/10",
              )}
            >
              <input type="radio" name="account_type" value={t} defaultChecked={preset === t} className="peer sr-only" required />
              <span className="text-sm font-semibold">{TRACKS[t].label}</span>
              <span className="text-xs text-ink-3">{TRACKS[t].tagline}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.account_type ? <p className="text-[13px] text-red">{state.fieldErrors.account_type}</p> : null}
      </fieldset>

      <Field id="full_name" label="Full name" error={state.fieldErrors?.full_name}>
        <Input id="full_name" name="full_name" autoComplete="name" required aria-invalid={!!state.fieldErrors?.full_name} />
      </Field>
      <Field id="email" label="Email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={!!state.fieldErrors?.email} />
      </Field>
      <Field id="password" label="Password" help="At least 10 characters." error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required aria-invalid={!!state.fieldErrors?.password} />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
