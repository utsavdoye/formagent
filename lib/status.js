// Shared by the dashboard list and the responses page, so both say the same
// thing about a form in the same words.

// "3 min ago", "yesterday", "5 Sep" — how people actually say when something happened.
export function ago(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "";
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

// One status, one colour, one short phrase. The same rules the database
// enforces, said the way a teacher would say them.
export function statusOf(form) {
  if (!form.open) return { tone: "bad", label: "Closed", detail: "Not taking answers" };
  if (!form.closesAt) return { tone: "good", label: "Open", detail: "No deadline" };
  const left = new Date(form.closesAt).getTime() - Date.now();
  if (!Number.isFinite(left)) return { tone: "good", label: "Open", detail: "" };
  if (left <= 0) return { tone: "bad", label: "Deadline passed", detail: "Not taking answers" };
  const when = new Date(form.closesAt).toLocaleString(undefined, {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });
  const hrs = left / 3600000;
  if (hrs < 24) {
    return { tone: "warn", label: `Closes in ${hrs < 1 ? `${Math.max(1, Math.round(hrs * 60))} min` : `${Math.round(hrs)} h`}`, detail: when };
  }
  return { tone: "good", label: "Open", detail: `Closes ${when}` };
}
