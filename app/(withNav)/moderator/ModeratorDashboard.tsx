"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

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
}

interface Report {
  _id: string;
  wordId: string;
  reason: string;
  optional?: string;
  userEmail: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  definition: Definition | null;
}

const statusLabels = {
  pending: "În așteptare",
  resolved: "Rezolvat",
  dismissed: "Respins",
};

export default function ModeratorDashboard({ canViewAdmin }: { canViewAdmin: boolean }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === "pending").length,
    [reports]
  );

  async function loadReports() {
    setLoading(true);
    const response = await fetch("/api/report", { cache: "no-store" });
    if (response.ok) {
      setReports(await response.json());
    } else {
      setMessage("Nu ai acces la rapoartele de moderare.");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function updateReportStatus(reportId: string, status: Report["status"]) {
    const response = await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });

    if (response.ok) {
      setReports((currentReports) =>
        currentReports.map((report) =>
          report._id === reportId ? { ...report, status } : report
        )
      );
      setMessage("Statusul raportului a fost actualizat.");
    }
  }

  async function hideDefinition(report: Report) {
    if (!report.definition) return;

    const response = await fetch("/api/moderation/definitions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: report.definition._id,
        reportId: report._id,
        reason: report.reason,
      }),
    });

    if (response.ok) {
      await loadReports();
      setMessage("Definiția a fost ascunsă și acțiunea a fost salvată în audit.");
    }
  }

  return (
    <section className="min-h-[calc(100vh-220px)] px-3 pb-16 font-Spacegrotesc text-mygray">
      {selectedReport && (
        <ModerationEditor
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSaved={async () => {
            setSelectedReport(null);
            await loadReports();
            setMessage("Definiția a fost modificată și raportul a fost rezolvat.");
          }}
        />
      )}

      <div className="mx-auto my-10 flex w-full max-w-6xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-Unbounded text-4xl font-bold text-mygray">Moderare</h1>
          <p className="mt-2 text-lg">
            {pendingReports} rapoarte în așteptare din {reports.length} total.
          </p>
        </div>
        {canViewAdmin && (
          <Link
            href="/admin"
            className="relative w-fit rounded-sm rounded-br-none border-2 border-mygray bg-myorange px-4 py-2 font-bold text-mywhite mydropshadow hover:bg-myhoverorange"
          >
            Deschide admin
          </Link>
        )}
      </div>

      {message && (
        <p className="mx-auto mb-5 max-w-6xl rounded-sm border-2 border-mygray bg-mywhite p-3 font-bold">
          {message}
        </p>
      )}

      <div className="mx-auto w-full max-w-6xl overflow-x-auto">
        <table className="w-full bg-mywhite">
          <thead>
            <tr>
              <th>Status</th>
              <th>Cuvânt</th>
              <th>Definiție raportată</th>
              <th>Motiv</th>
              <th>Trimis de</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Se încarcă...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={6}>Nu există rapoarte.</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report._id}>
                  <td>{statusLabels[report.status]}</td>
                  <td>{report.definition?.word || "Definiție lipsă"}</td>
                  <td className="min-w-[280px] text-left">
                    <p>{report.definition?.definition || "Nu mai există în baza de date."}</p>
                    {report.definition?.hidden && (
                      <span className="mt-2 inline-block font-bold text-red-600">Ascunsă</span>
                    )}
                  </td>
                  <td>
                    <p className="font-bold">{report.reason}</p>
                    {report.optional && <p>{report.optional}</p>}
                    <p className="text-xs text-zinc-500">{report.date}</p>
                  </td>
                  <td>{report.userEmail}</td>
                  <td>
                    <div className="flex min-w-[220px] flex-col gap-2">
                      <button
                        className="relative border-2 border-mygray bg-mywhite px-3 py-2 font-bold mydropshadow hover:text-myhovergray"
                        onClick={() => setSelectedReport(report)}
                        disabled={!report.definition}
                      >
                        Editează
                      </button>
                      <button
                        className="relative border-2 border-mygray bg-red-600 px-3 py-2 font-bold text-white mydropshadow hover:bg-red-400"
                        onClick={() => hideDefinition(report)}
                        disabled={!report.definition || report.definition.hidden}
                      >
                        Ascunde
                      </button>
                      <button
                        className="relative border-2 border-mygray bg-mywhite px-3 py-2 font-bold mydropshadow hover:text-myhovergray"
                        onClick={() => updateReportStatus(report._id, "dismissed")}
                      >
                        Respinge raportul
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModerationEditor({
  report,
  onClose,
  onSaved,
}: {
  report: Report;
  onClose: () => void;
  onSaved: () => void;
}) {
  const definition = report.definition;
  const [word, setWord] = useState(definition?.word || "");
  const [definitionText, setDefinitionText] = useState(definition?.definition || "");
  const [exampleOfUsing, setExampleOfUsing] = useState(definition?.exampleOfUsing || "");
  const [saving, setSaving] = useState(false);

  async function saveDefinition(event: FormEvent) {
    event.preventDefault();
    if (!definition) return;

    setSaving(true);
    const response = await fetch("/api/moderation/definitions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: definition._id,
        reportId: report._id,
        word: word.toLowerCase(),
        definition: definitionText,
        exampleOfUsing,
      }),
    });
    setSaving(false);

    if (response.ok) {
      onSaved();
    }
  }

  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center bg-black bg-opacity-70 px-3">
      <div className="w-full max-w-[720px] border-2 border-mygray bg-mywhite p-6 font-Spacegrotesc">
        <h2 className="text-center font-Unbounded text-3xl font-bold">Editează definiția</h2>
        <form className="mt-5 flex flex-col gap-4" onSubmit={saveDefinition}>
          <input
            className="w-full rounded-sm border-2 border-mygray bg-mywhite px-4 py-2 text-2xl outline-none"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            required
          />
          <textarea
            className="h-36 w-full resize-none rounded-sm border-2 border-mygray bg-mywhite px-4 py-2 text-xl outline-none"
            value={definitionText}
            onChange={(event) => setDefinitionText(event.target.value)}
            required
          />
          <textarea
            className="h-28 w-full resize-none rounded-sm border-2 border-mygray bg-mywhite px-4 py-2 text-xl outline-none"
            value={exampleOfUsing}
            onChange={(event) => setExampleOfUsing(event.target.value)}
            required
          />
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              className="relative rounded-sm rounded-br-none border-2 border-mygray bg-myorange px-4 py-2 font-bold text-mywhite mydropshadow hover:bg-myhoverorange"
              disabled={saving}
            >
              {saving ? "Se salvează..." : "Confirmă"}
            </button>
            <button
              type="button"
              className="relative rounded-sm rounded-br-none border-2 border-mygray bg-mywhite px-4 py-2 font-bold mydropshadow hover:text-myhovergray"
              onClick={onClose}
            >
              Închide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
