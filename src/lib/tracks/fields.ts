import { z } from "zod";

/**
 * Declarative form definitions. Each account type ("track") owns a list of
 * fields; the same definition drives the rendered form, the zod validator used
 * by Server Actions, and the read-only view organizers see while reviewing.
 * Adding a question is a one-line change here and nowhere else.
 */
export type FieldOption = { value: string; label: string };

export type FieldDef =
  | { key: string; label: string; type: "text"; required?: boolean; placeholder?: string; help?: string; maxLength?: number }
  | { key: string; label: string; type: "url"; required?: boolean; placeholder?: string; help?: string }
  | { key: string; label: string; type: "textarea"; required?: boolean; placeholder?: string; help?: string; maxLength: number; minLength?: number }
  | { key: string; label: string; type: "select"; required?: boolean; options: FieldOption[]; help?: string }
  | { key: string; label: string; type: "radio"; required?: boolean; options: FieldOption[]; help?: string }
  | { key: string; label: string; type: "multiselect"; required?: boolean; options: FieldOption[]; help?: string; min?: number }
  | { key: string; label: string; type: "checkbox"; required?: boolean; label_long: string };

export type Section = { title: string; description?: string; fields: FieldDef[] };

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Must start with http:// or https://");

function fieldSchema(f: FieldDef, mode: "draft" | "submit") {
  const req = mode === "submit" && f.required;
  switch (f.type) {
    case "text": {
      const base = z.string().trim().max(f.maxLength ?? 200);
      return req ? base.min(1, "Required") : base;
    }
    case "url":
      return req ? optionalUrl.refine((v) => v !== "", "Required") : optionalUrl;
    case "textarea": {
      const base = z.string().trim().max(f.maxLength, `Keep it under ${f.maxLength} characters`);
      return req ? base.min(f.minLength ?? 1, f.minLength ? `At least ${f.minLength} characters` : "Required") : base;
    }
    case "select":
    case "radio": {
      const values = f.options.map((o) => o.value) as [string, ...string[]];
      const base = z.enum(values).or(z.literal(""));
      return req ? base.refine((v) => v !== "", "Required") : base;
    }
    case "multiselect": {
      const values = f.options.map((o) => o.value) as [string, ...string[]];
      const base = z.array(z.enum(values)).max(values.length);
      return req ? base.min(f.min ?? 1, `Pick at least ${f.min ?? 1}`) : base;
    }
    case "checkbox": {
      const base = z.boolean();
      return req ? base.refine((v) => v === true, "You must agree to continue") : base;
    }
  }
}

/** Build the validator for a track. Draft mode accepts partial input; submit enforces required fields. */
export function buildSchema(sections: Section[], mode: "draft" | "submit") {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const s of sections) for (const f of s.fields) shape[f.key] = fieldSchema(f, mode);
  // `.strict()` rejects unknown keys so clients cannot stuff arbitrary data into `answers`.
  return z.object(shape).strict();
}

/** Coerce a FormData payload into the plain-object shape the schema expects. */
export function formDataToAnswers(sections: Section[], fd: FormData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of sections) {
    for (const f of s.fields) {
      if (f.type === "multiselect") out[f.key] = fd.getAll(f.key).filter((v) => typeof v === "string");
      else if (f.type === "checkbox") out[f.key] = fd.get(f.key) === "on" || fd.get(f.key) === "true";
      else out[f.key] = typeof fd.get(f.key) === "string" ? (fd.get(f.key) as string) : "";
    }
  }
  return out;
}

export function emptyAnswers(sections: Section[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const s of sections) for (const f of s.fields) out[f.key] = f.type === "multiselect" ? [] : f.type === "checkbox" ? false : "";
  return out;
}
