"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { statusOf } from "../../lib/status.js";

const ALL = "__all__";
const UNFILED = "__unfiled__";

function when(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function call(url, options = {}) {
  const res = await fetch(url, {
    headers: { "content-type": "application/json" },
    cache: "no-store",
    ...options,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Please sign in.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

export default function Dashboard({ initialWorkspaces, initialForms, loadError }) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [forms, setForms] = useState(initialForms);
  const [selected, setSelected] = useState(ALL);
  const [error, setError] = useState(loadError || "");
  const [busy, setBusy] = useState(false);

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const map = { [ALL]: forms.length, [UNFILED]: 0 };
    for (const w of workspaces) map[w.id] = 0;
    for (const f of forms) {
      const key = f.workspaceId || UNFILED;
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [forms, workspaces]);

  const visible = useMemo(() => {
    if (selected === ALL) return forms;
    if (selected === UNFILED) return forms.filter((f) => !f.workspaceId);
    return forms.filter((f) => f.workspaceId === selected);
  }, [forms, selected]);

  async function addSection() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    setError("");
    try {
      const { workspace } = await call("/api/workspaces", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setWorkspaces((w) => [...w, workspace]);
      setNewName("");
      setAdding(false);
      setSelected(workspace.id);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function saveRename(id) {
    const name = renameValue.trim();
    if (!name) return;
    setBusy(true);
    try {
      const { workspace } = await call(`/api/workspaces/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      setWorkspaces((list) => list.map((w) => (w.id === id ? workspace : w)));
      setRenamingId(null);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function removeSection(id, name) {
    const inside = counts[id] || 0;
    const warning = inside
      ? `Delete the section "${name}"? Its ${inside} form${inside === 1 ? "" : "s"} will move to Unfiled — nothing is lost.`
      : `Delete the section "${name}"?`;
    if (!window.confirm(warning)) return;

    setBusy(true);
    try {
      await call(`/api/workspaces/${id}`, { method: "DELETE" });
      setWorkspaces((list) => list.filter((w) => w.id !== id));
      setForms((list) =>
        list.map((f) => (f.workspaceId === id ? { ...f, workspaceId: null } : f))
      );
      if (selected === id) setSelected(ALL);
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function moveForm(formId, workspaceId) {
    setBusy(true);
    try {
      await call(`/api/forms/${formId}`, {
        method: "PATCH",
        body: JSON.stringify({ workspaceId: workspaceId || null }),
      });
      setForms((list) =>
        list.map((f) => (f.id === formId ? { ...f, workspaceId: workspaceId || null } : f))
      );
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleOpen(form) {
    setBusy(true);
    try {
      await call(`/api/forms/${form.id}`, {
        method: "PATCH",
        body: JSON.stringify({ open: !form.open }),
      });
      setForms((list) =>
        list.map((f) => (f.id === form.id ? { ...f, open: !form.open } : f))
      );
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function removeForm(form) {
    if (
      !window.confirm(
        `Delete "${form.title}"? Its ${form.responseCount || 0} response${
          form.responseCount === 1 ? "" : "s"
        } will be deleted too. This cannot be undone.`
      )
    )
      return;
    setBusy(true);
    try {
      await call(`/api/forms/${form.id}`, { method: "DELETE" });
      setForms((list) => list.filter((f) => f.id !== form.id));
    } catch (err) {
      setError(String(err.message || err));
    } finally {
      setBusy(false);
    }
  }

  const sectionTitle =
    selected === ALL
      ? "All forms"
      : selected === UNFILED
      ? "Unfiled"
      : workspaces.find((w) => w.id === selected)?.name || "Forms";

  // Numbers for the strip at the top. Counted over every form, not the
  // section, so they don't jump around when you click a section.
  const totals = useMemo(() => {
    let open = 0, answers = 0, soon = 0;
    for (const f of forms) {
      const s = statusOf(f);
      if (s.tone !== "bad") open += 1;
      if (s.tone === "warn") soon += 1;
      answers += f.responseCount || 0;
    }
    return { open, answers, soon };
  }, [forms]);

  const byStatus = useMemo(() => {
    const out = { all: visible, open: [], closed: [] };
    for (const f of visible) (statusOf(f).tone === "bad" ? out.closed : out.open).push(f);
    return out;
  }, [visible]);

  const q = query.trim().toLowerCase();
  const shown = byStatus[tab].filter((f) => !q || f.title.toLowerCase().includes(q));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>My forms</h1>
          <p className="lede">Everything you&apos;ve built. Make sections to keep different work apart.</p>
        </div>
        <Link className="btn hl" href="/">+ New form</Link>
      </div>

      {error && <div className="note bad">{error}</div>}

      <div className="stat-row even">
        <div className="stat-tile">
          <span className="stat-label">Forms</span>
          <span className="stat-num">{forms.length}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Taking answers</span>
          <span className="stat-num">{totals.open}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Answers in total</span>
          <span className="stat-num">{totals.answers.toLocaleString()}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-label">Closing in 24 h</span>
          <span className="stat-num">{totals.soon}</span>
        </div>
      </div>

      <div className="split">
        <aside className="sidebar">
          <button
            className={`side-item${selected === ALL ? " on" : ""}`}
            onClick={() => setSelected(ALL)}
          >
            <span>All forms</span>
            <span className="count">{counts[ALL] || 0}</span>
          </button>

          <button
            className={`side-item${selected === UNFILED ? " on" : ""}`}
            onClick={() => setSelected(UNFILED)}
          >
            <span>Unfiled</span>
            <span className="count">{counts[UNFILED] || 0}</span>
          </button>

          <div className="side-heading">Your sections</div>

          {workspaces.map((w) =>
            renamingId === w.id ? (
              <div className="side-rename" key={w.id}>
                <input
                  type="text"
                  value={renameValue}
                  autoFocus
                  maxLength={60}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); saveRename(w.id); }
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                />
                <button className="btn small primary" onClick={() => saveRename(w.id)} disabled={busy}>
                  Save
                </button>
              </div>
            ) : (
              <div className="side-row" key={w.id}>
                <button
                  className={`side-item${selected === w.id ? " on" : ""}`}
                  onClick={() => setSelected(w.id)}
                >
                  <span>{w.name}</span>
                  <span className="count">{counts[w.id] || 0}</span>
                </button>
                <div className="side-tools">
                  <button
                    className="btn ghost small"
                    title="Rename"
                    aria-label={`Rename ${w.name}`}
                    onClick={() => { setRenamingId(w.id); setRenameValue(w.name); }}
                  >
                    ✎
                  </button>
                  <button
                    className="btn ghost small"
                    title="Delete"
                    aria-label={`Delete ${w.name}`}
                    onClick={() => removeSection(w.id, w.name)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          )}

          {adding ? (
            <div className="side-rename">
              <input
                type="text"
                value={newName}
                autoFocus
                maxLength={60}
                placeholder="Section name"
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addSection(); }
                  if (e.key === "Escape") { setAdding(false); setNewName(""); }
                }}
              />
              <button className="btn small primary" onClick={addSection} disabled={busy || !newName.trim()}>
                Add
              </button>
            </div>
          ) : (
            <button className="btn small add-section" onClick={() => setAdding(true)}>
              + New section
            </button>
          )}
        </aside>

        <section style={{ minWidth: 0 }}>
          <div className="list-head">
            <h2>{sectionTitle}</h2>
          </div>

          <div className="toolbar">
            <div className="view-tabs" role="tablist" aria-label="Show forms">
              {[["all", "All"], ["open", "Open"], ["closed", "Closed"]].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  className={`btn${tab === key ? " on" : ""}`}
                  onClick={() => setTab(key)}
                >
                  {label} <span className="count-chip">{byStatus[key].length}</span>
                </button>
              ))}
            </div>
            {visible.length > 4 && (
              <input
                className="search"
                type="search"
                placeholder="Find a form"
                aria-label="Find a form by name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            )}
          </div>

          {visible.length === 0 ? (
            <div className="card empty">
              <p style={{ margin: "0 0 14px" }}>Nothing here yet.</p>
              <Link className="btn primary" href="/">Build a form</Link>
            </div>
          ) : shown.length === 0 ? (
            <div className="card empty">
              <p style={{ margin: 0 }}>
                {q ? `No form called “${query.trim()}” here.` : tab === "open" ? "Every form here is closed." : "No closed forms here."}
              </p>
            </div>
          ) : (
            <ul className="form-rows">
              {shown.map((f) => {
                const s = statusOf(f);
                const n = f.responseCount ?? 0;
                return (
                  <li className="form-row" key={f.id}>
                    <div className="form-row-main">
                      <div className="form-row-title">
                        <Link href={`/dashboard/${f.id}`}>{f.title}</Link>
                        <span className={`status ${s.tone}`}>{s.label}</span>
                      </div>
                      <div className="form-row-meta">
                        <span>
                          {f.fields.length} question{f.fields.length === 1 ? "" : "s"} · made {when(f.createdAt)}
                          {s.tone === "good" && f.closesAt ? ` · closes ${when(f.closesAt)}` : ""}
                        </span>
                        <select
                          className="mini-select"
                          value={f.workspaceId || ""}
                          onChange={(e) => moveForm(f.id, e.target.value)}
                          disabled={busy}
                          aria-label={`Section for ${f.title}`}
                        >
                          <option value="">Unfiled</option>
                          {workspaces.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                        <button className="link-btn" onClick={() => toggleOpen(f)} disabled={busy}>
                          {f.open ? "Close form" : "Reopen"}
                        </button>
                        <button className="link-btn danger" onClick={() => removeForm(f)} disabled={busy}>
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="form-row-count">
                      <strong>{n.toLocaleString()}</strong>
                      <span>answer{n === 1 ? "" : "s"}</span>
                    </div>

                    <div className="form-row-actions">
                      <Link className="btn small primary" href={`/dashboard/${f.id}`}>
                        View answers
                      </Link>
                      <a className="btn small ghost" href={`/f/${f.id}`} target="_blank" rel="noreferrer">
                        Open ↗
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
