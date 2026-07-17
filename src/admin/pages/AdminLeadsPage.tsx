import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { downloadCsv, leadsToCsv, useAdminLeads } from "../api";
import { LEAD_STATUS_LABELS, type AdminLeadStatus } from "../types";
import { formatDateTime, formatMileage } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Partial<Record<AdminLeadStatus, string>> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-emerald-100 text-emerald-800",
  offer_sent: "bg-amber-100 text-amber-800",
  won: "bg-emerald-200 text-emerald-900",
  lost: "bg-red-100 text-red-800",
};

type SortKey = "newest" | "oldest" | "status";

export default function AdminLeadsPage() {
  const { data: leads, isLoading } = useAdminLeads();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    let list = [...(leads ?? [])];
    if (statusFilter) list = list.filter((l) => l.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        [l.reference, l.registrationNumber, l.contact?.name, l.contact?.email, l.contact?.phone, l.vehicle?.make, l.vehicle?.model]
          .filter(Boolean).join(" ").toLowerCase().includes(q)
      );
    }
    switch (sort) {
      case "oldest": list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
      case "status": list.sort((a, b) => a.status.localeCompare(b.status)); break;
      default: list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return list;
  }, [leads, search, statusFilter, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand-primary">Leads</h1>
        <button type="button" onClick={() => downloadCsv("leads.csv", leadsToCsv(filtered))}
          className="inline-flex items-center gap-1.5 rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm hover:bg-brand-ink/5">
          <Download className="h-4 w-4" aria-hidden /> Eksportér CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="search" placeholder="Søg reference, navn, plade…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-64 rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm" aria-label="Søg i leads" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm" aria-label="Filtrér på status">
          <option value="">Alle statusser</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-brand-ink/15 bg-white px-3 py-2 text-sm" aria-label="Sortering">
          <option value="newest">Nyeste først</option>
          <option value="oldest">Ældste først</option>
          <option value="status">Status</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-brand-ink/5">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-brand-ink/10 text-left text-xs uppercase tracking-wide text-brand-ink/50">
              <th className="p-3">Reference</th>
              <th className="p-3">Bil</th>
              <th className="p-3">Kontakt</th>
              <th className="p-3">Modtaget</th>
              <th className="p-3">Tildelt</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-brand-ink/50">Indlæser…</td></tr>}
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-brand-ink/5 hover:bg-brand-ink/[0.02]">
                <td className="p-3">
                  <Link to={`/admin/leads/${lead.id}`} className="font-medium text-brand-primary hover:underline">
                    {lead.reference}
                  </Link>
                </td>
                <td className="p-3">
                  {lead.vehicle?.make} {lead.vehicle?.model}
                  <span className="block text-xs text-brand-ink/50">
                    {lead.registrationNumber} · {lead.mileageKm !== null ? formatMileage(lead.mileageKm) : "–"}
                  </span>
                </td>
                <td className="p-3">
                  {lead.contact?.name}
                  <span className="block text-xs text-brand-ink/50">{lead.contact?.phone}</span>
                </td>
                <td className="p-3 text-brand-ink/70">{formatDateTime(lead.createdAt)}</td>
                <td className="p-3 text-brand-ink/70">{lead.assignedTo ?? "–"}</td>
                <td className="p-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_STYLES[lead.status] ?? "bg-brand-ink/10 text-brand-ink")}>
                    {LEAD_STATUS_LABELS[lead.status]}
                  </span>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-brand-ink/50">Ingen leads matcher.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
