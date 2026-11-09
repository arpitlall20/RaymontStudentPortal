import { prisma } from "@/lib/db";
import { allocateBed, checkoutAllocation } from "@/lib/actions/housing";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default async function AdminAllocationsPage() {
  await requireAdmin();

  const [allocations, residents, vacantBeds] = await Promise.all([
    prisma.allocation.findMany({
      where: { active: true },
      include: {
        resident: { include: { user: true } },
        bed: { include: { room: { include: { building: true } } } },
      },
      orderBy: { checkIn: "desc" },
    }),
    prisma.residentProfile.findMany({
      where: {
        status: { in: ["OFFERED", "ACTIVE", "APPLICANT"] },
        allocations: { none: { active: true } },
      },
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.bed.findMany({
      where: { allocations: { none: { active: true } } },
      include: { room: { include: { building: true } } },
      orderBy: [{ room: { building: { code: "asc" } } }, { room: { number: "asc" } }],
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Allocations
        </h1>
        <p className="text-[var(--muted)]">Check students into beds and manage check-outs.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocate bed</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={allocateBed} className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="residentId">Resident</Label>
              <Select id="residentId" name="residentId" required>
                <option value="">Select resident</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.user.name} ({r.status})
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedId">Vacant bed</Label>
              <Select id="bedId" name="bedId" required>
                <option value="">Select bed</option>
                {vacantBeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.room.building.code} {b.room.number}
                    {b.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input id="term" name="term" defaultValue="2026 Full Year" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkIn">Check-in</Label>
              <Input id="checkIn" name="checkIn" type="date" defaultValue="2026-02-15" required />
            </div>
            <Button type="submit" className="md:col-span-2 lg:col-span-4">
              Allocate
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active allocations ({allocations.length})</CardTitle>
        </CardHeader>
        <CardContent className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Room / bed</th>
                <th>Term</th>
                <th>Check-in</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((a) => (
                <tr key={a.id}>
                  <td>{a.resident.user.name}</td>
                  <td>
                    {a.bed.room.building.code} {a.bed.room.number}
                    {a.bed.label}
                  </td>
                  <td>{a.term}</td>
                  <td>{formatDate(a.checkIn)}</td>
                  <td>
                    <form action={checkoutAllocation}>
                      <input type="hidden" name="allocationId" value={a.id} />
                      <Button type="submit" size="sm" variant="outline">
                        Check out
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
