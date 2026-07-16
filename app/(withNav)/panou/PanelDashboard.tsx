"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Autocomplete, { Suggestion } from "@/app/shared/Autocomplete";
import { matches } from "@/lib/search";
import { anonEmailRx } from "@/lib/anon";

/* ---------- tipuri ---------- */
interface Definition {
  _id: string;
  word: string;
  definition: string;
  exampleOfUsing: string;
  username: string;
  userEmail: string;
  likes: number;
  date: string;
  hidden?: boolean;
  hiddenReason?: string;
  hiddenAt?: string;
}
interface Report {
  _id: string;
  wordId: string;
  reason: string;
  optional?: string;
  userEmail: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  resolvedAt?: string;
  definition: Definition | null;
}
interface UserRow {
  _id: string;
  email: string;
  username: string;
  role?: "user" | "moderator" | "admin";
  banned?: boolean;
  date?: string;
  achievements?: { id: string }[];
}
interface AuditLog {
  _id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  targetEmail?: string;
  createdAt: string;
}

type Tab = "reports" | "hidden" | "users" | "audit";
type ReportFilter = "pending" | "resolved" | "dismissed" | "all";
type Toast = { text: string; kind: "ok" | "err" } | null;

const statusLabels: Record<Report["status"], string> = {
  pending: "În așteptare",
  resolved: "Rezolvat",
  dismissed: "Respins",
};

// Conturile anonime au email generat (anon_xxx@no-reply.localhost) — nu-l arătăm,
// scriem „Anonim".
const displayEmail = (email?: string) => (email && anonEmailRx.test(email) ? "Anonim" : email || "—");
const actionLabels: Record<string, string> = {
  ban: "Ban",
  unban: "Unban",
  assign_moderator: "Rol moderator acordat",
  remove_moderator: "Rol moderator retras",
  achievement_grant: "Medalie acordată",
  achievement_revoke: "Medalie retrasă",
  definition_edited: "Definiție editată",
  definition_hidden: "Definiție ascunsă",
  definition_restored: "Definiție restaurată",
  report_status_changed: "Status raport schimbat",
};

/* ---------- stiluri brutaliste reutilizabile ---------- */
const card = "relative border-2 border-mygray bg-mywhite rounded-sm mydropshadow";
const btn =
  "relative inline-flex items-center gap-1.5 border-2 border-mygray bg-mywhite px-3 py-1.5 text-sm font-bold rounded-sm mydropshadow transition-all hover:text-myhovergray disabled:opacity-40 disabled:pointer-events-none";
const btnOrange =
  "relative inline-flex items-center gap-1.5 border-2 border-mygray bg-myorange text-mywhite px-3 py-1.5 text-sm font-bold rounded-sm mydropshadow transition-all hover:bg-myhoverorange disabled:opacity-40 disabled:pointer-events-none";
const btnDanger =
  "relative inline-flex items-center gap-1.5 border-2 border-mygray bg-red-600 text-white px-3 py-1.5 text-sm font-bold rounded-sm mydropshadow transition-all hover:bg-red-500 disabled:opacity-40 disabled:pointer-events-none";
const input =
  "border-2 border-mygray bg-mywhite rounded-sm px-3 py-1.5 text-sm outline-none w-full";
// Butoanele de acțiune umplu rândul în mod egal: 2 pe rând pe mobil, toate pe un
// rând pe desktop. Indiferent de câte sunt, nu rămâne spațiu gol.
const fillBtn = "grow basis-[calc(50%-0.25rem)] justify-center md:basis-0";
// Bară de accent pe marginea cardului, după stare.
const reportAccent: Record<Report["status"], string> = {
  pending: "#E86842",
  resolved: "#16a34a",
  dismissed: "#a1a1aa",
};

/* ---------- iconițe (Feather, stroke currentColor) ---------- */
const paths: Record<string, string> = {
  flag: "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7",
  eyeOff:
    "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  restore: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  edit:
    "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",
  ban: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.93 4.93l14.14 14.14",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  alert: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89L7 23l5-3 5 3-1.21-9.12",
};
function Icon({ name, size = 16 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

/* ---------- componenta principală ---------- */
export default function PanelDashboard({ role }: { role: "moderator" | "admin" }) {
  const isAdmin = role === "admin";

  const [tab, setTab] = useState<Tab>("reports");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [hidden, setHidden] = useState<Definition[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);

  const [reportFilter, setReportFilter] = useState<ReportFilter>("pending");
  const [reportSearch, setReportSearch] = useState("");
  const [hiddenSearch, setHiddenSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "user" | "moderator" | "admin" | "banned">("all");
  const [auditFilter, setAuditFilter] = useState("all");

  const [editing, setEditing] = useState<Report | null>(null);
  const [confirm, setConfirm] = useState<{ text: string; run: () => void } | null>(null);

  const notify = useCallback((text: string, kind: "ok" | "err" = "ok") => {
    setToast({ text, kind });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const grab = (url: string) =>
      fetch(url, { cache: "no-store" }).then((r) => (r.ok ? r.json() : []));
    const [rep, hid, usr, aud] = await Promise.all([
      grab("/api/report"),
      grab("/api/moderation/definitions"),
      isAdmin ? grab("/api/admin/users") : Promise.resolve([]),
      isAdmin ? grab("/api/admin/audit") : Promise.resolve([]),
    ]);
    setReports(rep);
    setHidden(hid);
    setUsers(usr);
    setAudit(aud);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ---------- statistici ---------- */
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const pending = reports.filter((r) => r.status === "pending").length;
    const resolvedToday = reports.filter(
      (r) => r.status !== "pending" && r.resolvedAt && new Date(r.resolvedAt).toDateString() === today
    ).length;
    if (tab === "users" || tab === "audit") {
      return [
        { label: "Utilizatori", value: users.length, accent: true },
        { label: "Moderatori", value: users.filter((u) => u.role === "moderator").length },
        { label: "Admini", value: users.filter((u) => u.role === "admin").length },
        { label: "Banați", value: users.filter((u) => u.banned).length },
      ];
    }
    return [
      { label: "În așteptare", value: pending, accent: true },
      { label: "Rezolvate azi", value: resolvedToday },
      { label: "Ascunse", value: hidden.length },
      { label: "Total rapoarte", value: reports.length },
    ];
  }, [tab, reports, hidden, users]);

  /* ---------- acțiuni rapoarte ---------- */
  async function setReportStatus(reportId: string, status: Report["status"]) {
    const res = await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setReports((cur) =>
        cur.map((r) => (r._id === reportId ? { ...r, status, resolvedAt: updated?.resolvedAt } : r))
      );
      notify("Statusul raportului a fost actualizat.");
    } else notify("Acțiunea nu a reușit.", "err");
  }

  async function hideDefinition(report: Report) {
    if (!report.definition) return;
    const res = await fetch("/api/moderation/definitions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: report.definition._id, reportId: report._id, reason: report.reason }),
    });
    if (res.ok) {
      await loadAll();
      notify("Definiția a fost ascunsă și salvată în audit.");
    } else notify("Nu am putut ascunde definiția.", "err");
  }

  async function restore(def: Definition) {
    const res = await fetch("/api/moderation/definitions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: def._id, action: "restore" }),
    });
    if (res.ok) {
      setHidden((cur) => cur.filter((d) => d._id !== def._id));
      setReports((cur) =>
        cur.map((r) =>
          r.definition?._id === def._id ? { ...r, definition: { ...r.definition, hidden: false } as Definition } : r
        )
      );
      notify("Definiția a fost readusă (dezascunsă).");
    } else notify("Nu am putut restaura definiția.", "err");
  }

  async function updateUser(userId: string, action: string) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((cur) => cur.map((u) => (u._id === updated._id ? updated : u)));
      fetch("/api/admin/audit", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .then(setAudit);
      notify("Utilizatorul a fost actualizat.");
    } else {
      const e = await res.json().catch(() => ({}));
      notify(e.error || "Acțiunea nu a reușit.", "err");
    }
  }

  // Singura medalie care se dă de mână: „Cobai profesionist" (beta), pentru
  // testerii de dinainte de lansare. Serverul refuză orice alt id — restul se
  // câștigă, nu se acordă.
  async function toggleBeta(user: UserRow) {
    const hasBeta = (user.achievements || []).some((a) => a.id === "beta");
    const action = hasBeta ? "revoke" : "grant";
    const res = await fetch("/api/achievements/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user._id, action, id: "beta" }),
    });
    if (res.ok) {
      setUsers((cur) =>
        cur.map((u) =>
          u._id === user._id
            ? {
                ...u,
                achievements: hasBeta
                  ? (u.achievements || []).filter((a) => a.id !== "beta")
                  : [...(u.achievements || []), { id: "beta" }],
              }
            : u
        )
      );
      fetch("/api/admin/audit", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .then(setAudit);
      notify(hasBeta ? "Medalia beta a fost retrasă." : "Medalia beta a fost acordată.");
    } else {
      const e = await res.json().catch(() => ({}));
      notify(e.error || "Acțiunea nu a reușit.", "err");
    }
  }

  /* ---------- liste filtrate ---------- */
  const shownReports = useMemo(() => {
    const q = reportSearch.trim().toLowerCase();
    return reports.filter((r) => {
      if (reportFilter !== "all" && r.status !== reportFilter) return false;
      if (!q) return true;
      return (
        r.definition?.word?.toLowerCase().includes(q) ||
        r.userEmail?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    });
  }, [reports, reportFilter, reportSearch]);

  const shownHidden = useMemo(() => {
    const q = hiddenSearch.trim().toLowerCase();
    if (!q) return hidden;
    return hidden.filter(
      (d) => d.word?.toLowerCase().includes(q) || d.username?.toLowerCase().includes(q) || d.userEmail?.toLowerCase().includes(q)
    );
  }, [hidden, hiddenSearch]);

  const shownUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (userRoleFilter === "banned" && !u.banned) return false;
      if (userRoleFilter !== "all" && userRoleFilter !== "banned" && (u.role || "user") !== userRoleFilter) return false;
      if (!q) return true;
      return u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
    });
  }, [users, userSearch, userRoleFilter]);

  /* ---------- sugestii locale pentru autocomplete (din datele deja încărcate) ---------- */
  const reportSuggestions = useMemo<Suggestion[]>(
    () =>
      reports
        .filter((r) => r.definition?.word)
        .map((r) => ({ _id: r._id, label: r.definition!.word, sub: r.reason, type: "word" })),
    [reports]
  );
  const hiddenSuggestions = useMemo<Suggestion[]>(
    () => hidden.map((d) => ({ _id: d._id, label: d.word, sub: d.username || d.userEmail, type: "word" })),
    [hidden]
  );
  const userSuggestions = useMemo<Suggestion[]>(
    () => users.map((u) => ({ _id: u._id, label: u.username || u.email, sub: u.email, type: "user" })),
    [users]
  );

  const auditActions = useMemo(() => Array.from(new Set(audit.map((a) => a.action))), [audit]);
  const shownAudit = useMemo(
    () => (auditFilter === "all" ? audit : audit.filter((a) => a.action === auditFilter)),
    [audit, auditFilter]
  );

  const tabs: { id: Tab; label: string; icon: string; admin?: boolean }[] = [
    { id: "reports", label: "Rapoarte", icon: "flag" },
    { id: "hidden", label: "Ascunse", icon: "eyeOff" },
    { id: "users", label: "Utilizatori", icon: "users", admin: true },
    { id: "audit", label: "Audit", icon: "clock", admin: true },
  ];

  return (
    <section className="min-h-[calc(100vh-220px)] px-3 pb-20 font-Spacegrotesc text-mygray">
      {toast && (
        <div className="fixed left-1/2 top-5 z-[60] -translate-x-1/2">
          <div
            className={`relative border-2 border-mygray px-4 py-2 font-bold mydropshadow ${
              toast.kind === "ok" ? "bg-myorange text-mywhite" : "bg-red-600 text-white"
            }`}
          >
            {toast.text}
          </div>
        </div>
      )}

      {editing && (
        <EditModal
          report={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await loadAll();
            notify("Definiția a fost modificată și raportul rezolvat.");
          }}
        />
      )}

      {confirm && (
        <ConfirmModal
          text={confirm.text}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm.run();
            setConfirm(null);
          }}
        />
      )}

      {/* antet + rol */}
      <div className="mx-auto mt-10 flex w-full max-w-6xl items-center justify-between gap-3">
        <h1 className="font-Unbounded text-3xl font-bold md:text-4xl">
          Panou <span className="text-myorange">moderare</span>
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-mygray px-3 py-1.5 text-xs font-bold uppercase text-mywhite">
          <Icon name="shield" size={14} />
          {isAdmin ? "Admin" : "Moderator"}
        </span>
      </div>

      {/* taburi */}
      <div className="mx-auto mt-5 flex w-full max-w-6xl flex-wrap gap-2">
        {tabs
          .filter((t) => !t.admin || isAdmin)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-2 rounded-sm border-2 border-mygray px-4 py-2 text-sm font-bold mydropshadow transition-all ${
                tab === t.id ? "bg-myorange text-mywhite" : "bg-mywhite hover:text-myhovergray"
              }`}
            >
              <Icon name={t.icon} size={15} />
              {t.label}
            </button>
          ))}
      </div>

      {/* statistici */}
      <div className="mx-auto mt-5 grid w-full max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <div className="text-xs font-medium text-myhovergray">{s.label}</div>
            <div className={`font-Unbounded text-3xl font-bold ${s.accent ? "text-myorange" : ""}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 w-full max-w-6xl">
        {loading ? (
          <p className="py-16 text-center text-lg font-bold">Se încarcă…</p>
        ) : tab === "reports" ? (
          <ReportsView
            reports={shownReports}
            total={reports.length}
            filter={reportFilter}
            setFilter={setReportFilter}
            search={reportSearch}
            setSearch={setReportSearch}
            suggestions={reportSuggestions}
            onEdit={setEditing}
            onHide={(r) => setConfirm({ text: `Ascunzi definiția „${r.definition?.word}”?`, run: () => hideDefinition(r) })}
            onDismiss={(r) => setReportStatus(r._id, "dismissed")}
            onResolve={(r) => setReportStatus(r._id, "resolved")}
          />
        ) : tab === "hidden" ? (
          <HiddenView
            items={shownHidden}
            search={hiddenSearch}
            setSearch={setHiddenSearch}
            suggestions={hiddenSuggestions}
            onRestore={restore}
          />
        ) : tab === "users" ? (
          <UsersView
            users={shownUsers}
            search={userSearch}
            setSearch={setUserSearch}
            suggestions={userSuggestions}
            roleFilter={userRoleFilter}
            setRoleFilter={setUserRoleFilter}
            onBan={(u) => setConfirm({ text: `${u.banned ? "Deblochezi" : "Blochezi"} contul ${u.email}?`, run: () => updateUser(u._id, u.banned ? "unban" : "ban") })}
            onMod={(u) => updateUser(u._id, u.role === "moderator" ? "remove_moderator" : "assign_moderator")}
            onBeta={toggleBeta}
          />
        ) : (
          <AuditView logs={shownAudit} actions={auditActions} filter={auditFilter} setFilter={setAuditFilter} />
        )}
      </div>
    </section>
  );
}

/* ---------- vederea Rapoarte ---------- */
function StatusChip({ status }: { status: Report["status"] }) {
  const map = {
    pending: "bg-myorange text-mywhite",
    resolved: "bg-green-600 text-white",
    dismissed: "bg-zinc-300 text-mygray",
  } as const;
  return (
    <span className={`whitespace-nowrap rounded-sm border-2 border-mygray px-2 py-0.5 text-[11px] font-bold uppercase ${map[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
function ReasonChip({ reason }: { reason: string }) {
  const danger = /hărțuire|abuz|discrimin|personale|personală/i.test(reason);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border-2 border-mygray px-2 py-0.5 text-[11px] font-bold ${
        danger ? "bg-red-600 text-white" : "bg-mywhite text-mygray"
      }`}
    >
      {danger && <Icon name="alert" size={12} />}
      {reason}
    </span>
  );
}

// Căutare cu autocomplete pentru panou. Sursa de sugestii e LOCALĂ (datele sunt
// deja încărcate în memorie), deci zero request-uri. Tastarea filtrează oricum
// lista live prin useMemo — sugestiile sunt doar o scurtătură către o intrare.
function SearchBox({
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  suggestions: Suggestion[];
}) {
  const fetchLocal = (q: string) => {
    const seen = new Set<string>();
    const out: Suggestion[] = [];
    for (const s of suggestions) {
      if (out.length >= 8) break;
      const key = s.label.toLowerCase();
      if (seen.has(key)) continue;
      if (matches(s.label, q) || matches(s.sub, q)) {
        seen.add(key);
        out.push(s);
      }
    }
    return Promise.resolve(out);
  };
  return (
    <Autocomplete
      value={value}
      onChange={onChange}
      onSelect={(s) => onChange(s.label)}
      fetchSuggestions={fetchLocal}
      placeholder={placeholder}
      ariaLabel={placeholder}
      minLength={1}
      className="relative flex flex-1 items-center gap-2 rounded-sm border-2 border-mygray bg-mywhite px-3 py-1.5"
      inputClassName="w-full bg-transparent text-sm outline-none"
      leading={
        <span className="text-myhovergray">
          <Icon name="search" size={16} />
        </span>
      }
    />
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-sm border-2 border-mygray px-3 py-1.5 text-xs font-bold transition-all ${
        active ? "bg-mygray text-mywhite" : "bg-mywhite hover:text-myhovergray"
      }`}
    >
      {children}
    </button>
  );
}

function ReportsView({
  reports,
  total,
  filter,
  setFilter,
  search,
  setSearch,
  suggestions,
  onEdit,
  onHide,
  onDismiss,
  onResolve,
}: {
  reports: Report[];
  total: number;
  filter: ReportFilter;
  setFilter: (f: ReportFilter) => void;
  search: string;
  setSearch: (s: string) => void;
  suggestions: Suggestion[];
  onEdit: (r: Report) => void;
  onHide: (r: Report) => void;
  onDismiss: (r: Report) => void;
  onResolve: (r: Report) => void;
}) {
  const filters: { id: ReportFilter; label: string }[] = [
    { id: "pending", label: "În așteptare" },
    { id: "resolved", label: "Rezolvate" },
    { id: "dismissed", label: "Respinse" },
    { id: "all", label: "Toate" },
  ];
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchBox value={search} onChange={setSearch} suggestions={suggestions} placeholder="Caută cuvânt, motiv sau raportor…" />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <FilterChip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState icon="flag" text={total === 0 ? "Nu există rapoarte." : "Niciun raport pentru acest filtru."} />
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((r) => (
            <article
              key={r._id}
              className={`${card} p-4`}
              style={{ borderLeftWidth: 6, borderLeftColor: reportAccent[r.status] }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-Unbounded text-xl font-bold">{r.definition?.word || "Definiție lipsă"}</h3>
                <div className="flex items-center gap-2">
                  {r.definition?.hidden && (
                    <span className="rounded-sm border-2 border-mygray bg-mygray px-2 py-0.5 text-[11px] font-bold uppercase text-mywhite">
                      Ascunsă
                    </span>
                  )}
                  <StatusChip status={r.status} />
                </div>
              </div>

              <p className="mt-2 text-[15px] leading-relaxed">
                {r.definition?.definition || "Definiția nu mai există în baza de date."}
              </p>
              {r.definition?.exampleOfUsing && (
                <p className="mt-2 text-sm italic text-myhovergray">
                  <span className="font-bold not-italic text-mygray">Exemplu: </span>
                  {r.definition.exampleOfUsing}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-dashed border-zinc-300 pt-3">
                <ReasonChip reason={r.reason} />
                {r.optional && <span className="text-xs italic text-myhovergray">„{r.optional}”</span>}
                <span className="text-xs text-myhovergray">{displayEmail(r.userEmail)} · {r.date}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className={`${btn} ${fillBtn}`} onClick={() => onEdit(r)} disabled={!r.definition}>
                  <Icon name="edit" size={14} /> Editează
                </button>
                {r.status !== "resolved" && (
                  <button className={`${btn} ${fillBtn}`} onClick={() => onResolve(r)}>
                    <Icon name="check" size={14} /> Rezolvă
                  </button>
                )}
                <button
                  className={`${btnDanger} ${fillBtn}`}
                  onClick={() => onHide(r)}
                  disabled={!r.definition || r.definition.hidden}
                >
                  <Icon name="eyeOff" size={14} /> Ascunde
                </button>
                {r.status !== "dismissed" && (
                  <button className={`${btn} ${fillBtn}`} onClick={() => onDismiss(r)}>
                    <Icon name="x" size={14} /> Respinge
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- vederea Ascunse ---------- */
function HiddenView({
  items,
  search,
  setSearch,
  suggestions,
  onRestore,
}: {
  items: Definition[];
  search: string;
  setSearch: (s: string) => void;
  suggestions: Suggestion[];
  onRestore: (d: Definition) => void;
}) {
  return (
    <>
      <div className="mb-5">
        <SearchBox value={search} onChange={setSearch} suggestions={suggestions} placeholder="Caută în definițiile ascunse…" />
      </div>
      {items.length === 0 ? (
        <EmptyState icon="eyeOff" text="Nicio definiție ascunsă." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((d) => (
            <article
              key={d._id}
              className={`${card} p-4`}
              style={{ borderLeftWidth: 6, borderLeftColor: "#202020" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="font-Unbounded text-xl font-bold">{d.word}</h3>
                <span className="rounded-sm border-2 border-mygray bg-mygray px-2 py-0.5 text-[11px] font-bold uppercase text-mywhite">
                  Ascunsă
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed">{d.definition}</p>
              {d.exampleOfUsing && (
                <p className="mt-2 text-sm italic text-myhovergray">
                  <span className="font-bold not-italic text-mygray">Exemplu: </span>
                  {d.exampleOfUsing}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t-2 border-dashed border-zinc-300 pt-3">
                {d.hiddenReason && <ReasonChip reason={d.hiddenReason} />}
                <span className="text-xs text-myhovergray">
                  {d.username || "Anonim"} · {displayEmail(d.userEmail)}
                </span>
              </div>

              <div className="mt-3 flex">
                <button className={`${btnOrange} grow justify-center`} onClick={() => onRestore(d)}>
                  <Icon name="restore" size={14} /> Dezascunde
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- vederea Utilizatori ---------- */
function UsersView({
  users,
  search,
  setSearch,
  suggestions,
  roleFilter,
  setRoleFilter,
  onBan,
  onMod,
  onBeta,
}: {
  users: UserRow[];
  search: string;
  setSearch: (s: string) => void;
  suggestions: Suggestion[];
  roleFilter: "all" | "user" | "moderator" | "admin" | "banned";
  setRoleFilter: (r: "all" | "user" | "moderator" | "admin" | "banned") => void;
  onBan: (u: UserRow) => void;
  onMod: (u: UserRow) => void;
  onBeta: (u: UserRow) => void;
}) {
  const filters = [
    { id: "all", label: "Toți" },
    { id: "moderator", label: "Moderatori" },
    { id: "admin", label: "Admini" },
    { id: "user", label: "Useri" },
    { id: "banned", label: "Banați" },
  ] as const;
  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchBox value={search} onChange={setSearch} suggestions={suggestions} placeholder="Caută după poreclă sau email…" />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <FilterChip key={f.id} active={roleFilter === f.id} onClick={() => setRoleFilter(f.id)}>
              {f.label}
            </FilterChip>
          ))}
        </div>
      </div>
      {users.length === 0 ? (
        <EmptyState icon="users" text="Niciun utilizator pentru acest filtru." />
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <article key={u._id} className={`${card} flex flex-wrap items-center gap-3 p-4`}>
              <div className="flex size-11 shrink-0 items-center justify-center rounded-sm border-2 border-mygray bg-myorange font-Unbounded text-lg font-bold uppercase text-mywhite">
                {(u.username || u.email || "?").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold">{u.username || "Fără poreclă"}</p>
                <p className="truncate text-xs text-myhovergray">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-sm border-2 border-mygray bg-mywhite px-2 py-0.5 text-[11px] font-bold uppercase">
                  {u.role || "user"}
                </span>
                {u.banned && (
                  <span className="rounded-sm border-2 border-mygray bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase text-white">
                    Banat
                  </span>
                )}
              </div>
              <span className="grow" />
              <div className="flex flex-wrap gap-2">
                {/* Beta se poate acorda oricui, inclusiv unui admin — și el
                    poate fi fost tester. Restul acțiunilor nu ating adminii. */}
                <button className={btn} onClick={() => onBeta(u)}>
                  <Icon name="award" size={14} />
                  {(u.achievements || []).some((a) => a.id === "beta") ? "Scoate beta" : "Dă beta"}
                </button>
                {u.role !== "admin" && (
                  <>
                    <button className={btn} onClick={() => onMod(u)}>
                      <Icon name="shield" size={14} />
                      {u.role === "moderator" ? "Scoate mod" : "Fă moderator"}
                    </button>
                    <button className={u.banned ? btn : btnDanger} onClick={() => onBan(u)}>
                      <Icon name="ban" size={14} />
                      {u.banned ? "Deblochează" : "Blochează"}
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- vederea Audit ---------- */
function AuditView({
  logs,
  actions,
  filter,
  setFilter,
}: {
  logs: AuditLog[];
  actions: string[];
  filter: string;
  setFilter: (a: string) => void;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          Toate
        </FilterChip>
        {actions.map((a) => (
          <FilterChip key={a} active={filter === a} onClick={() => setFilter(a)}>
            {actionLabels[a] || a}
          </FilterChip>
        ))}
      </div>
      {logs.length === 0 ? (
        <EmptyState icon="clock" text="Nu există acțiuni în audit." />
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => (
            <article key={log._id} className={`${card} flex flex-wrap items-center gap-x-3 gap-y-1 p-3`}>
              <span className="rounded-sm border-2 border-mygray bg-mywhite px-2 py-0.5 text-[11px] font-bold">
                {actionLabels[log.action] || log.action}
              </span>
              <span className="text-sm font-bold">{log.actorEmail}</span>
              <span className="text-xs text-myhovergray">({log.actorRole})</span>
              <span className="text-xs">→ {log.targetEmail ? displayEmail(log.targetEmail) : log.targetId}</span>
              <span className="grow" />
              <span className="text-xs text-myhovergray">{new Date(log.createdAt).toLocaleString("ro-RO")}</span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- helpers UI ---------- */
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className={`${card} flex flex-col items-center gap-3 p-12 text-center`}>
      <span className="text-myhovergray">
        <Icon name={icon} size={40} />
      </span>
      <p className="font-bold text-myhovergray">{text}</p>
    </div>
  );
}

function ConfirmModal({ text, onConfirm, onCancel }: { text: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-3">
      <div className={`${card} w-full max-w-md p-6`}>
        <h3 className="font-Unbounded text-xl font-bold">Confirmă acțiunea</h3>
        <p className="mt-3">{text}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className={btn} onClick={onCancel}>
            Anulează
          </button>
          <button className={btnDanger} onClick={onConfirm}>
            Confirmă
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ report, onClose, onSaved }: { report: Report; onClose: () => void; onSaved: () => void }) {
  const d = report.definition;
  const [word, setWord] = useState(d?.word || "");
  const [definition, setDefinition] = useState(d?.definition || "");
  const [exampleOfUsing, setExampleOfUsing] = useState(d?.exampleOfUsing || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!d) return;
    setSaving(true);
    setErr("");
    const res = await fetch("/api/moderation/definitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: d._id,
        reportId: report._id,
        word: word.toLowerCase(),
        definition,
        exampleOfUsing,
      }),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else setErr("Nu am putut salva modificările.");
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-3">
      <div className={`${card} w-full max-w-[680px] p-6`}>
        <h2 className="text-center font-Unbounded text-2xl font-bold">Editează definiția</h2>
        <form className="mt-5 flex flex-col gap-3" onSubmit={save}>
          <label className="text-sm font-bold">Cuvânt</label>
          <input className={`${input} text-xl`} value={word} onChange={(e) => setWord(e.target.value)} required />
          <label className="text-sm font-bold">Definiție</label>
          <textarea
            className={`${input} h-32 resize-none`}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            required
          />
          <label className="text-sm font-bold">Exemplu de folosire</label>
          <textarea
            className={`${input} h-24 resize-none`}
            value={exampleOfUsing}
            onChange={(e) => setExampleOfUsing(e.target.value)}
            required
          />
          {err && <p className="text-sm font-bold text-red-600">{err}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <button type="button" className={btn} onClick={onClose}>
              Închide
            </button>
            <button type="submit" className={btnOrange} disabled={saving}>
              {saving ? "Se salvează…" : "Confirmă"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
