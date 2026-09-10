import type { Section } from "@/lib/tracks/fields";

/** Read-only rendering of an application's answers, driven by the same field definitions as the form. */
export function AnswersView({ sections, answers }: { sections: Section[]; answers: Record<string, unknown> }) {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.title}>
          <h3 className="eyebrow mb-3">{s.title}</h3>
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {s.fields.map((f) => {
              const v = answers[f.key];
              const wide = f.type === "textarea";
              return (
                <div key={f.key} className={wide ? "sm:col-span-2" : undefined}>
                  <dt className="text-xs font-medium text-ink-3">{f.label}</dt>
                  <dd className="mt-0.5 text-[15px] leading-relaxed text-ink">{render(f, v)}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

function render(f: Section["fields"][number], v: unknown) {
  const empty = <span className="text-ink-4">—</span>;
  switch (f.type) {
    case "checkbox":
      return v === true ? "Agreed" : <span className="text-red">Not agreed</span>;
    case "multiselect": {
      if (!Array.isArray(v) || v.length === 0) return empty;
      const labels = v.map((x) => f.options.find((o) => o.value === x)?.label ?? String(x));
      return (
        <span className="flex flex-wrap gap-1.5">
          {labels.map((l) => (
            <span key={l} className="rounded-full border border-line bg-paper px-2 py-0.5 text-xs">
              {l}
            </span>
          ))}
        </span>
      );
    }
    case "select":
    case "radio":
      if (typeof v !== "string" || v === "") return empty;
      return f.options.find((o) => o.value === v)?.label ?? v;
    case "url":
      if (typeof v !== "string" || v === "") return empty;
      return (
        <a href={v} target="_blank" rel="noopener noreferrer nofollow" className="link break-all">
          {v.replace(/^https?:\/\//, "")}
        </a>
      );
    case "textarea":
      return typeof v === "string" && v ? <span className="whitespace-pre-wrap">{v}</span> : empty;
    default:
      return typeof v === "string" && v ? v : empty;
  }
}
