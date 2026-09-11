"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveApplication, type SaveState } from "@/lib/applications/actions";
import type { TrackDef } from "@/lib/tracks";
import type { FieldDef } from "@/lib/tracks/fields";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/cn";

/**
 * Renders a track's sections from data. Autosaves a draft ~1.2s after the last
 * keystroke via the same Server Action used for submit (mode=draft). The version
 * returned by each save is fed into the next request for optimistic locking.
 */
export function ApplicationForm({ track, initial, version, updatedAt }: { track: TrackDef; initial: Record<string, unknown>; version: number; updatedAt: string }) {
  const [state, submitAction, submitting] = useActionState<SaveState, FormData>(saveApplication, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const [localVer, setVer] = useState(version);
  // A failed submit still returns the latest version from the server; never go backwards.
  const ver = Math.max(localVer, state.version ?? 0);
  const [autosave, setAutosave] = useState<{ status: "idle" | "saving" | "saved" | "error"; at?: string; error?: string }>({ status: "idle", at: updatedAt });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dirty = useRef(false);

  const runAutosave = useCallback(async () => {
    const form = formRef.current;
    if (!form || !dirty.current) return;
    dirty.current = false;
    setAutosave((s) => ({ ...s, status: "saving" }));
    const fd = new FormData(form);
    fd.set("__mode", "draft");
    const res = await saveApplication({ status: "idle" }, fd);
    if (res.status === "saved") {
      setVer(res.version ?? ver);
      setAutosave({ status: "saved", at: res.savedAt });
    } else {
      setAutosave({ status: "error", error: res.error ?? "Could not save" });
    }
  }, [ver]);

  const onChange = useCallback(() => {
    dirty.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(runAutosave, 1200);
  }, [runAutosave]);

  // Flush pending edits if the user navigates away.
  useEffect(() => {
    const flush = () => {
      if (dirty.current && formRef.current) {
        const fd = new FormData(formRef.current);
        fd.set("__mode", "draft");
        void saveApplication({ status: "idle" }, fd);
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const errors = state.fieldErrors ?? {};
  const firstErrorKey = Object.keys(errors)[0];

  return (
    <form
      ref={formRef}
      action={submitAction}
      onChange={onChange}
      onSubmit={() => {
        if (timer.current) clearTimeout(timer.current);
        dirty.current = false;
      }}
      className="grid gap-8 lg:grid-cols-[1fr_260px]"
      noValidate
    >
      <input type="hidden" name="__track" value={track.id} />
      <input type="hidden" name="__version" value={ver} />
      <input type="hidden" name="__mode" value="submit" />

      <div className="space-y-6">
        {state.status === "conflict" ? <Alert tone="error">{state.error}</Alert> : null}
        {state.status === "error" && state.error ? (
          <Alert tone="error">
            {state.error}
            {firstErrorKey ? (
              <>
                {" "}
                <a href={`#${firstErrorKey}`} className="underline">
                  Go to the first one
                </a>
                .
              </>
            ) : null}
          </Alert>
        ) : null}

        {track.sections.map((section, i) => (
          <section key={section.title} className={cn("card p-6 sm:p-8", i === 0 ? "rise" : i === 1 ? "rise-2" : "rise-3")}>
            <header className="mb-6">
              <p className="eyebrow mb-1">
                Section {i + 1} of {track.sections.length}
              </p>
              <h2 className="display text-[24px]">{section.title}</h2>
              {section.description ? <p className="mt-1 text-sm text-ink-3">{section.description}</p> : null}
            </header>
            <div className="grid gap-5 sm:grid-cols-2">
              {section.fields.map((f) => (
                <FieldControl key={f.key} field={f} value={initial[f.key]} error={errors[f.key]} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <p className="eyebrow mb-3">Progress</p>
          <SaveIndicator autosave={autosave} />
          <div className="hairline my-4" />
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-ink-4">Submitting locks your answers. Required fields are marked with an asterisk.</p>
        </div>
      </aside>
    </form>
  );
}

function SaveIndicator({ autosave }: { autosave: { status: string; at?: string; error?: string } }) {
  const time = autosave.at ? new Date(autosave.at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;
  return (
    <p className="flex items-center gap-2 text-sm text-ink-3" aria-live="polite">
      <span
        className={cn(
          "size-2 rounded-full",
          autosave.status === "saving" && "animate-pulse bg-gold",
          autosave.status === "saved" && "bg-green",
          autosave.status === "error" && "bg-red",
          autosave.status === "idle" && "bg-ink-4",
        )}
        aria-hidden
      />
      {autosave.status === "saving" ? "Saving…" : autosave.status === "error" ? autosave.error : time ? `Draft saved at ${time}` : "Draft"}
    </p>
  );
}

function FieldControl({ field: f, value, error }: { field: FieldDef; value: unknown; error?: string }) {
  const wide = f.type === "textarea" || f.type === "multiselect" || f.type === "checkbox" || f.type === "radio";
  const cls = wide ? "sm:col-span-2" : undefined;
  const describedBy = error ? `${f.key}-error` : "help" in f && f.help ? `${f.key}-help` : undefined;

  switch (f.type) {
    case "text":
      return (
        <Field id={f.key} label={f.label} required={f.required} help={f.help} error={error} className={cls}>
          <Input id={f.key} name={f.key} defaultValue={typeof value === "string" ? value : ""} placeholder={f.placeholder} maxLength={f.maxLength ?? 200} aria-invalid={!!error} aria-describedby={describedBy} />
        </Field>
      );
    case "url":
      return (
        <Field id={f.key} label={f.label} required={f.required} help={f.help} error={error} className={cls}>
          <Input id={f.key} name={f.key} type="url" inputMode="url" defaultValue={typeof value === "string" ? value : ""} placeholder={f.placeholder} maxLength={300} aria-invalid={!!error} aria-describedby={describedBy} />
        </Field>
      );
    case "textarea":
      return (
        <Field id={f.key} label={f.label} required={f.required} help={f.help ?? `${f.minLength ? `${f.minLength} to ` : "Up to "}${f.maxLength} characters`} error={error} className={cls}>
          <Textarea id={f.key} name={f.key} defaultValue={typeof value === "string" ? value : ""} placeholder={f.placeholder} maxLength={f.maxLength} aria-invalid={!!error} aria-describedby={describedBy} />
        </Field>
      );
    case "select":
      return (
        <Field id={f.key} label={f.label} required={f.required} help={f.help} error={error} className={cls}>
          <Select id={f.key} name={f.key} defaultValue={typeof value === "string" ? value : ""} aria-invalid={!!error} aria-describedby={describedBy}>
            <option value="">Select…</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "radio":
      return (
        <fieldset className={cn("space-y-2", cls)} aria-describedby={describedBy}>
          <legend className="text-sm font-medium">
            {f.label}
            {f.required ? <span className="ml-1 text-gold-2" aria-hidden>*</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <label key={o.value} className="cursor-pointer rounded-md border border-line-2 bg-white px-3.5 py-2 text-sm transition hover:border-ink-4 has-[:checked]:border-berkeley has-[:checked]:bg-[#f2f6fb] has-[:checked]:ring-[3px] has-[:checked]:ring-berkeley/10">
                <input type="radio" name={f.key} value={o.value} defaultChecked={value === o.value} className="sr-only" />
                {o.label}
              </label>
            ))}
          </div>
          {error ? <p id={`${f.key}-error`} role="alert" className="text-[13px] text-red">{error}</p> : f.help ? <p id={`${f.key}-help`} className="text-[13px] text-ink-3">{f.help}</p> : null}
        </fieldset>
      );
    case "multiselect":
      return (
        <fieldset className={cn("space-y-2", cls)} aria-describedby={describedBy}>
          <legend className="text-sm font-medium">
            {f.label}
            {f.required ? <span className="ml-1 text-gold-2" aria-hidden>*</span> : null}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {f.options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-line-2 bg-white px-3.5 py-2 text-sm transition hover:border-ink-4 has-[:checked]:border-berkeley has-[:checked]:bg-[#f2f6fb]">
                <input type="checkbox" name={f.key} value={o.value} defaultChecked={Array.isArray(value) && value.includes(o.value)} className="size-4 accent-berkeley" />
                {o.label}
              </label>
            ))}
          </div>
          {error ? <p id={`${f.key}-error`} role="alert" className="text-[13px] text-red">{error}</p> : f.help ? <p id={`${f.key}-help`} className="text-[13px] text-ink-3">{f.help}</p> : null}
        </fieldset>
      );
    case "checkbox":
      return (
        <div className={cls}>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-line-2 bg-white p-4 text-sm transition hover:border-ink-4 has-[:checked]:border-berkeley">
            <input type="checkbox" name={f.key} defaultChecked={value === true} className="mt-0.5 size-4 shrink-0 accent-berkeley" aria-invalid={!!error} aria-describedby={error ? `${f.key}-error` : undefined} />
            <span>
              <span className="font-medium">
                {f.label}
                {f.required ? <span className="ml-1 text-gold-2" aria-hidden>*</span> : null}
              </span>
              <span className="mt-0.5 block text-ink-3">{f.label_long}</span>
            </span>
          </label>
          {error ? <p id={`${f.key}-error`} role="alert" className="mt-1.5 text-[13px] text-red">{error}</p> : null}
        </div>
      );
  }
}
