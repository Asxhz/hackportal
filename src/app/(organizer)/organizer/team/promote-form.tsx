"use client";

import { useActionState } from "react";
import { promoteOrganizer, type ActionState } from "@/lib/organizer/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function PromoteForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(promoteOrganizer, {});
  return (
    <form action={action} className="card rise-3 h-fit p-5 space-y-4">
      <div>
        <h2 className="display text-[22px]">Add an organizer</h2>
        <p className="mt-1 text-sm text-ink-3">If they don&apos;t have an account yet, they&apos;ll become an organizer when they sign up.</p>
      </div>
      {state.error ? <Alert tone="error">{state.error}</Alert> : state.ok ? <Alert tone="success">{state.message}</Alert> : null}
      <Field id="email" label="Email">
        <Input id="email" name="email" type="email" required placeholder="name@berkeley.edu" />
      </Field>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Adding…" : "Grant access"}
      </Button>
    </form>
  );
}
