import { useQuery } from "@tanstack/react-query";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAdminAuth } from "../auth";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin",
  dealer_admin: "Forhandleradmin",
  editor: "Redaktør",
  lead_agent: "Leadmedarbejder",
};

interface MemberRow {
  id: string;
  name: string;
  roles: string[];
}

export default function AdminUsersPage() {
  const { user } = useAdminAuth();
  const { data: members, isLoading } = useQuery({
    queryKey: ["admin", "members"],
    enabled: !!user,
    queryFn: async (): Promise<MemberRow[]> => {
      if (!isSupabaseConfigured) {
        return [{ id: "demo-admin", name: "Demo Administrator (TESTDATA)", roles: ["dealer_admin"] }];
      }
      const supabase = getSupabase();
      const [{ data: memberRows }, { data: roleRows }] = await Promise.all([
        supabase.from("organization_members").select("profile_id, profiles(full_name)").eq("organization_id", user!.organizationId),
        supabase.from("user_roles").select("profile_id, role").eq("organization_id", user!.organizationId),
      ]);
      return (memberRows ?? []).map((m) => ({
        id: m.profile_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name: (m as any).profiles?.full_name ?? m.profile_id,
        roles: (roleRows ?? []).filter((r) => r.profile_id === m.profile_id).map((r) => r.role),
      }));
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-primary">Brugere og roller</h1>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-brand-ink/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-ink/10 text-left text-xs uppercase tracking-wide text-brand-ink/50">
              <th className="p-3">Bruger</th>
              <th className="p-3">Roller</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={2} className="p-6 text-center text-brand-ink/50">Indlæser…</td></tr>}
            {(members ?? []).map((m) => (
              <tr key={m.id} className="border-b border-brand-ink/5">
                <td className="p-3 font-medium">{m.name}</td>
                <td className="p-3">
                  {m.roles.length
                    ? m.roles.map((r) => (
                        <span key={r} className="mr-1.5 rounded-full bg-brand-primary/10 px-2.5 py-1 text-xs font-medium text-brand-primary">
                          {ROLE_LABELS[r] ?? r}
                        </span>
                      ))
                    : <span className="text-brand-ink/40">Ingen roller</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl bg-white p-5 text-sm text-brand-ink/60 shadow-sm ring-1 ring-brand-ink/5">
        <h2 className="mb-2 font-display text-lg font-bold text-brand-primary">Sådan tilføjer du en bruger</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Invitér brugeren i Supabase Dashboard (Authentication → Users → Invite). Selvregistrering skal være slået fra.</li>
          <li>Kør derefter i SQL-editoren: <code>select public.grant_admin(&#39;email@firma.dk&#39;, &#39;autohuset-vest&#39;, &#39;editor&#39;);</code></li>
          <li>Roller: superadmin, dealer_admin, editor, lead_agent. Rettigheder håndhæves af Row Level Security i databasen – ikke kun i brugerfladen.</li>
        </ol>
      </div>
    </div>
  );
}
