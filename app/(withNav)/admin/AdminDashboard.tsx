"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface User {
  _id: string;
  email: string;
  username: string;
  role?: "user" | "moderator" | "admin";
  banned?: boolean;
  date?: string;
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

const actionLabels: Record<string, string> = {
  ban: "Ban",
  unban: "Unban",
  assign_moderator: "Rol moderator acordat",
  remove_moderator: "Rol moderator retras",
  definition_edited: "Definiție editată",
  definition_hidden: "Definiție ascunsă",
  report_status_changed: "Status raport schimbat",
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const moderators = useMemo(
    () => users.filter((user) => user.role === "moderator" || user.role === "admin").length,
    [users]
  );

  async function loadAdminData() {
    setLoading(true);
    const [usersResponse, auditResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/audit", { cache: "no-store" }),
    ]);

    if (usersResponse.ok) setUsers(await usersResponse.json());
    if (auditResponse.ok) setAuditLogs(await auditResponse.json());

    if (!usersResponse.ok || !auditResponse.ok) {
      setMessage("Nu ai acces la datele de administrare.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  async function updateUser(userId: string, action: string) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action }),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user._id === updatedUser._id ? updatedUser : user))
      );
      const auditResponse = await fetch("/api/admin/audit", { cache: "no-store" });
      if (auditResponse.ok) setAuditLogs(await auditResponse.json());
      setMessage("Utilizatorul a fost actualizat.");
    } else {
      const error = await response.json();
      setMessage(error.error || "Acțiunea nu a reușit.");
    }
  }

  return (
    <section className="min-h-[calc(100vh-220px)] px-3 pb-16 font-Spacegrotesc text-mygray">
      <div className="mx-auto my-10 flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-Unbounded text-4xl font-bold">Admin</h1>
          <p className="mt-2 text-lg">
            {users.length} utilizatori, {moderators} membri în echipa de moderare.
          </p>
        </div>
        <Link
          href="/moderator"
          className="relative w-fit rounded-sm rounded-br-none border-2 border-mygray bg-myorange px-4 py-2 font-bold text-mywhite mydropshadow hover:bg-myhoverorange"
        >
          Moderare
        </Link>
      </div>

      <div className="mx-auto mb-6 flex max-w-6xl gap-3">
        <button
          className={`relative border-2 border-mygray px-4 py-2 font-bold mydropshadow ${
            activeTab === "users" ? "bg-myorange text-mywhite" : "bg-mywhite"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Utilizatori
        </button>
        <button
          className={`relative border-2 border-mygray px-4 py-2 font-bold mydropshadow ${
            activeTab === "audit" ? "bg-myorange text-mywhite" : "bg-mywhite"
          }`}
          onClick={() => setActiveTab("audit")}
        >
          Audit
        </button>
      </div>

      {message && (
        <p className="mx-auto mb-5 max-w-6xl rounded-sm border-2 border-mygray bg-mywhite p-3 font-bold">
          {message}
        </p>
      )}

      <div className="mx-auto w-full max-w-6xl overflow-x-auto">
        {activeTab === "users" ? (
          <table className="w-full bg-mywhite">
            <thead>
              <tr>
                <th>Poreclă</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Stare</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Se încarcă...</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username || "Fără poreclă"}</td>
                    <td>{user.email}</td>
                    <td>{user.role || "user"}</td>
                    <td>{user.banned ? "Blocat" : "Activ"}</td>
                    <td>
                      <div className="flex min-w-[260px] flex-wrap justify-center gap-2">
                        <button
                          className="relative border-2 border-mygray bg-red-600 px-3 py-2 font-bold text-white mydropshadow hover:bg-red-400"
                          onClick={() => updateUser(user._id, user.banned ? "unban" : "ban")}
                        >
                          {user.banned ? "Deblochează" : "Blochează"}
                        </button>
                        {user.role === "moderator" ? (
                          <button
                            className="relative border-2 border-mygray bg-mywhite px-3 py-2 font-bold mydropshadow hover:text-myhovergray"
                            onClick={() => updateUser(user._id, "remove_moderator")}
                          >
                            Scoate moderator
                          </button>
                        ) : user.role !== "admin" ? (
                          <button
                            className="relative border-2 border-mygray bg-mywhite px-3 py-2 font-bold mydropshadow hover:text-myhovergray"
                            onClick={() => updateUser(user._id, "assign_moderator")}
                          >
                            Fă moderator
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full bg-mywhite">
            <thead>
              <tr>
                <th>Data</th>
                <th>Actor</th>
                <th>Acțiune</th>
                <th>Țintă</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={4}>Nu există acțiuni în audit.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString("ro-RO")}</td>
                    <td>
                      <p className="font-bold">{log.actorEmail}</p>
                      <p>{log.actorRole}</p>
                    </td>
                    <td>{actionLabels[log.action] || log.action}</td>
                    <td>
                      <p>{log.targetType}</p>
                      <p>{log.targetEmail || log.targetId}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
