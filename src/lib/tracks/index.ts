import type { Section } from "./fields";

export const ACCOUNT_TYPES = ["hacker", "judge", "mentor", "volunteer"] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const APP_STATUSES = ["draft", "submitted", "under_review", "accepted", "waitlisted", "rejected"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export type RubricCriterion = { key: string; label: string; help: string };

export type TrackDef = {
  id: AccountType;
  label: string;
  plural: string;
  tagline: string;
  description: string;
  sections: Section[];
  /** Organizer scoring rubric, 1–5 per criterion. */
  rubric: RubricCriterion[];
};

const shirt = [
  { value: "XS", label: "XS" }, { value: "S", label: "S" }, { value: "M", label: "M" },
  { value: "L", label: "L" }, { value: "XL", label: "XL" }, { value: "XXL", label: "XXL" },
];

const agreements: Section = {
  title: "Agreements",
  fields: [
    { key: "agree_coc", type: "checkbox", required: true, label: "Code of Conduct", label_long: "I have read and agree to the MLH Code of Conduct." },
  ],
};

export const TRACKS: Record<AccountType, TrackDef> = {
  hacker: {
    id: "hacker",
    label: "Hacker",
    plural: "Hackers",
    tagline: "Hacker application",
    description: "Students who want to build a project over 36 hours. Teams of up to four; you can find teammates at the event.",
    sections: [
      {
        title: "About you",
        fields: [
          { key: "school", type: "text", label: "School", required: true, placeholder: "UC Berkeley", maxLength: 120 },
          { key: "major", type: "text", label: "Major / field of study", required: true, maxLength: 120 },
          { key: "level_of_study", type: "select", label: "Level of study", required: true, options: [
            { value: "high_school", label: "High school" }, { value: "undergraduate", label: "Undergraduate" },
            { value: "graduate", label: "Graduate" }, { value: "other", label: "Other" },
          ] },
          { key: "grad_year", type: "select", label: "Expected graduation", required: true, options: ["2026","2027","2028","2029","2030+"].map((y) => ({ value: y, label: y })) },
          { key: "hackathons_attended", type: "radio", label: "Hackathons attended", required: true, options: [
            { value: "0", label: "This is my first" }, { value: "1-3", label: "1–3" }, { value: "4+", label: "4 or more" },
          ] },
        ],
      },
      {
        title: "Links",
        description: "Optional, but they help us understand what you build.",
        fields: [
          { key: "github", type: "url", label: "GitHub", placeholder: "https://github.com/you" },
          { key: "linkedin", type: "url", label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
          { key: "portfolio", type: "url", label: "Portfolio or personal site", placeholder: "https://" },
        ],
      },
      {
        title: "Short answers",
        fields: [
          { key: "why", type: "textarea", label: "Why do you want to attend Cal Hacks?", required: true, minLength: 80, maxLength: 1200, help: "Two to four sentences." },
          { key: "proud_project", type: "textarea", label: "Tell us about something you built or learned that you're proud of.", required: true, minLength: 80, maxLength: 1200, help: "Code, hardware, research, a club, anything." },
        ],
      },
      {
        title: "Logistics",
        fields: [
          { key: "team_status", type: "radio", label: "Team", required: true, options: [
            { value: "have_team", label: "I have a team" }, { value: "looking", label: "Looking for a team" }, { value: "solo", label: "Going solo" },
          ] },
          { key: "dietary", type: "text", label: "Dietary restrictions", placeholder: "None", maxLength: 200 },
          { key: "shirt_size", type: "select", label: "T-shirt size", required: true, options: shirt },
        ],
      },
      {
        title: "Agreements",
        fields: [
          ...agreements.fields,
          { key: "agree_mlh_data", type: "checkbox", required: true, label: "MLH data sharing", label_long: "I authorize Cal Hacks to share my application with Major League Hacking for event administration and ranking." },
        ],
      },
    ],
    rubric: [
      { key: "motivation", label: "Motivation", help: "Clear reason for attending." },
      { key: "technical", label: "Technical depth", help: "Evidence of building or shipping something." },
      { key: "communication", label: "Communication", help: "Specific, concrete answers." },
    ],
  },

  judge: {
    id: "judge",
    label: "Judge",
    plural: "Judges",
    tagline: "Judge application",
    description: "Engineers, founders and researchers who score projects during the Sunday expo and finals.",
    sections: [
      {
        title: "Professional background",
        fields: [
          { key: "company", type: "text", label: "Company / organization", required: true, maxLength: 120 },
          { key: "title", type: "text", label: "Title", required: true, maxLength: 120 },
          { key: "years_experience", type: "select", label: "Years of experience", required: true, options: [
            { value: "0-2", label: "0–2" }, { value: "3-5", label: "3–5" }, { value: "6-10", label: "6–10" }, { value: "10+", label: "10+" },
          ] },
          { key: "linkedin", type: "url", label: "LinkedIn", required: true, placeholder: "https://linkedin.com/in/you" },
          { key: "expertise", type: "multiselect", label: "Areas of expertise", required: true, options: [
            { value: "ai_ml", label: "AI / ML" }, { value: "web", label: "Web" }, { value: "mobile", label: "Mobile" },
            { value: "systems", label: "Systems / infra" }, { value: "hardware", label: "Hardware" }, { value: "design", label: "Design / UX" },
            { value: "fintech", label: "Fintech" }, { value: "health", label: "Health" }, { value: "security", label: "Security" },
          ] },
        ],
      },
      {
        title: "Judging",
        fields: [
          { key: "judged_before", type: "radio", label: "Have you judged a hackathon before?", required: true, options: [
            { value: "yes", label: "Yes" }, { value: "no", label: "No" },
          ] },
          { key: "availability", type: "multiselect", label: "Availability", required: true, options: [
            { value: "sunday_am", label: "Sunday 9am–12pm (expo)" }, { value: "sunday_pm", label: "Sunday 12pm–3pm (finals)" },
          ] },
          { key: "motivation", type: "textarea", label: "Why do you want to judge Cal Hacks?", required: true, minLength: 40, maxLength: 800 },
        ],
      },
      agreements,
    ],
    rubric: [
      { key: "expertise", label: "Relevant expertise", help: "Domain match with likely project categories." },
      { key: "experience", label: "Judging experience", help: "Prior judging or mentoring at events." },
      { key: "availability", label: "Availability", help: "Can cover the full expo and finals." },
    ],
  },

  mentor: {
    id: "mentor",
    label: "Mentor",
    plural: "Mentors",
    tagline: "Mentor application",
    description: "Engineers who help teams debug and make technical decisions during the event.",
    sections: [
      {
        title: "Background",
        fields: [
          { key: "company", type: "text", label: "Company / organization", required: true, maxLength: 120 },
          { key: "title", type: "text", label: "Title", required: true, maxLength: 120 },
          { key: "linkedin", type: "url", label: "LinkedIn or GitHub", placeholder: "https://" },
          { key: "skills", type: "multiselect", label: "What can you help with?", required: true, min: 2, options: [
            { value: "react", label: "React / frontend" }, { value: "backend", label: "Backend / APIs" }, { value: "ml", label: "ML / LLMs" },
            { value: "mobile", label: "Mobile" }, { value: "devops", label: "Cloud / DevOps" }, { value: "hardware", label: "Hardware / embedded" },
            { value: "design", label: "Design" }, { value: "pitching", label: "Pitching / demos" }, { value: "debugging", label: "General debugging" },
          ] },
        ],
      },
      {
        title: "Mentoring",
        fields: [
          { key: "mentored_before", type: "radio", label: "Have you mentored at a hackathon before?", required: true, options: [
            { value: "yes", label: "Yes" }, { value: "no", label: "No" },
          ] },
          { key: "availability", type: "multiselect", label: "When can you be on the floor?", required: true, options: [
            { value: "fri_pm", label: "Friday evening" }, { value: "sat_am", label: "Saturday morning" }, { value: "sat_pm", label: "Saturday afternoon" },
            { value: "sat_night", label: "Saturday night" }, { value: "sun_am", label: "Sunday morning" },
          ] },
          { key: "bio", type: "textarea", label: "Short bio for the mentor board", required: true, minLength: 40, maxLength: 600, help: "Hackers will see this when looking for help." },
        ],
      },
      agreements,
    ],
    rubric: [
      { key: "skills", label: "Skill coverage", help: "Breadth and depth of helpful skills." },
      { key: "availability", label: "Availability", help: "Hours on the floor, especially Saturday night." },
      { key: "communication", label: "Communication", help: "Bio is clear and useful to hackers." },
    ],
  },

  volunteer: {
    id: "volunteer",
    label: "Volunteer",
    plural: "Volunteers",
    tagline: "Volunteer application",
    description: "Check-in, meals, logistics and event operations. Shift-based, before and during the event.",
    sections: [
      {
        title: "About you",
        fields: [
          { key: "school", type: "text", label: "School", required: true, maxLength: 120 },
          { key: "phone", type: "text", label: "Phone number", required: true, maxLength: 30, help: "Used only for day-of coordination." },
          { key: "shirt_size", type: "select", label: "T-shirt size", required: true, options: shirt },
        ],
      },
      {
        title: "Shifts",
        fields: [
          { key: "shifts", type: "multiselect", label: "Which shifts can you take?", required: true, min: 2, options: [
            { value: "fri_pm", label: "Friday 3pm–9pm (check-in)" }, { value: "sat_am", label: "Saturday 7am–1pm" },
            { value: "sat_pm", label: "Saturday 1pm–7pm" }, { value: "sat_night", label: "Saturday 7pm–1am" },
            { value: "sun_am", label: "Sunday 7am–1pm" }, { value: "sun_pm", label: "Sunday 1pm–6pm (teardown)" },
          ] },
          { key: "has_car", type: "radio", label: "Can you drive for supply runs?", required: true, options: [
            { value: "yes", label: "Yes" }, { value: "no", label: "No" },
          ] },
          { key: "why", type: "textarea", label: "Why do you want to volunteer?", required: true, minLength: 40, maxLength: 600 },
        ],
      },
      agreements,
    ],
    rubric: [
      { key: "reliability", label: "Reliability", help: "Shift coverage and commitment." },
      { key: "attitude", label: "Attitude", help: "Reason for volunteering is genuine." },
    ],
  },
};

export const STATUS_LABEL: Record<AppStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  waitlisted: "Waitlisted",
  rejected: "Not accepted",
};

export function isAccountType(v: unknown): v is AccountType {
  return typeof v === "string" && (ACCOUNT_TYPES as readonly string[]).includes(v);
}
export function isAppStatus(v: unknown): v is AppStatus {
  return typeof v === "string" && (APP_STATUSES as readonly string[]).includes(v);
}
