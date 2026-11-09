import Link from "next/link";
import { prisma } from "@/lib/db";
import { getResidentBalance } from "@/lib/billing";
import { requireAdmin } from "@/lib/session";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminResidentsPage() {
  await requireAdmin();
  const residents = await prisma.residentProfile.findMany({
    include: {
      user: true,
      allocations: {
        where: { active: true },
        include: { bed: { include: { room: { include: { building: true } } } } },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const balances = await Promise.all(
    residents.map(async (r) => [r.id, await getResidentBalance(r.id)] as const)
  );
  const balanceMap = Object.fromEntries(balances);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Residents
        </h1>
        <p className="text-[var(--muted)]">Student profiles, status, rooms, and balances.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{residents.length} profiles</CardTitle>
        </CardHeader>
        <CardContent className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Room</th>
                <th>University</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r) => {
                const alloc = r.allocations[0];
                const room = alloc
                  ? `${alloc.bed.room.building.code} ${alloc.bed.room.number}${alloc.bed.label}`
                  : "—";
                return (
                  <tr key={r.id}>
                    <td>
                      <Link
                        href={`/admin/residents/${r.id}`}
                        className="font-medium text-[var(--brand)] hover:underline"
                      >
                        {r.user.name}
                      </Link>
                      <div className="text-xs text-[var(--muted)]">{r.user.email}</div>
                    </td>
                    <td>
                      <StatusBadge value={r.status} />
                    </td>
                    <td>{room}</td>
                    <td>{r.university || "—"}</td>
                    <td>{formatCurrency(balanceMap[r.id].remaining)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
