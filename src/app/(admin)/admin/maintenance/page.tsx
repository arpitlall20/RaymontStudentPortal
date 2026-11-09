import { prisma } from "@/lib/db";
import { updateMaintenanceStatus } from "@/lib/actions/ops";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminMaintenancePage() {
  await requireAdmin();

  const requests = await prisma.maintenanceRequest.findMany({
    include: {
      resident: { include: { user: true } },
      room: { include: { building: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Maintenance
        </h1>
        <p className="text-[var(--muted)]">Track and resolve resident work orders.</p>
      </div>

      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                <span>{r.title}</span>
                <StatusBadge value={r.status} />
              </CardTitle>
              <p className="text-sm text-[var(--muted)]">
                {r.resident.user.name} · {r.category} · {formatDate(r.createdAt)}
                {r.room
                  ? ` · ${r.room.building.code} ${r.room.number}`
                  : ""}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{r.description}</p>
              <form action={updateMaintenanceStatus} className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
                <input type="hidden" name="id" value={r.id} />
                <Select name="status" defaultValue={r.status}>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </Select>
                <Textarea
                  name="staffNotes"
                  defaultValue={r.staffNotes || ""}
                  placeholder="Staff notes"
                />
                <Button type="submit">Update</Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {requests.length === 0 && (
          <Card>
            <CardContent className="py-8 text-sm text-[var(--muted)]">
              No maintenance requests.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
