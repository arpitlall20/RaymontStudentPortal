import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getResidentBalance } from "@/lib/billing";
import { updateResident } from "@/lib/actions/housing";
import { createCharge, recordPayment, applyFeePlan } from "@/lib/actions/billing";
import { requireAdmin } from "@/lib/session";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminResidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const resident = await prisma.residentProfile.findUnique({
    where: { id },
    include: {
      user: true,
      mealPlan: true,
      allocations: {
        include: { bed: { include: { room: { include: { building: true } } } } },
        orderBy: { createdAt: "desc" },
      },
      charges: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { paidAt: "desc" } },
      applications: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!resident) notFound();

  const balance = await getResidentBalance(id);
  const feePlans = await prisma.feePlan.findMany({ where: { active: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          {resident.user.name}
        </h1>
        <p className="text-[var(--muted)]">
          {resident.user.email} · <StatusBadge value={resident.status} />
        </p>
      </div>

      <div className="stat-grid">
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.totalCharges)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.totalPaid)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Remaining</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.remaining)}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateResident} className="space-y-3">
              <input type="hidden" name="id" value={resident.id} />
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={resident.user.name} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input id="studentId" name="studentId" defaultValue={resident.studentId || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue={resident.status}>
                    <option value="APPLICANT">Applicant</option>
                    <option value="OFFERED">Offered</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ALUMNI">Alumni</option>
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={resident.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input id="university" name="university" defaultValue={resident.university || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input id="course" name="course" defaultValue={resident.course || ""} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">Emergency name</Label>
                  <Input
                    id="emergencyName"
                    name="emergencyName"
                    defaultValue={resident.emergencyName || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency phone</Label>
                  <Input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    defaultValue={resident.emergencyPhone || ""}
                  />
                </div>
              </div>
              <Button type="submit">Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allocations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {resident.allocations.map((a) => (
              <div key={a.id} className="rounded-md border border-[var(--border)] p-3">
                {a.bed.room.building.code} {a.bed.room.number}
                {a.bed.label} · {a.term} ·{" "}
                {a.active ? "Active" : `Checked out ${formatDate(a.checkOut)}`}
              </div>
            ))}
            {resident.allocations.length === 0 && (
              <p className="text-[var(--muted)]">No allocations yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Apply fee plan</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={applyFeePlan} className="space-y-3">
              <input type="hidden" name="residentId" value={resident.id} />
              <Select name="feePlanId" defaultValue={feePlans[0]?.id}>
                {feePlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" variant="secondary">
                Add plan charges
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add charge</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCharge} className="space-y-3">
              <input type="hidden" name="residentId" value={resident.id} />
              <Select name="type" defaultValue="EXTRA">
                <option value="DEPOSIT">Deposit</option>
                <option value="TERM_FEES">Term fees</option>
                <option value="MEAL_PLAN">Meal plan</option>
                <option value="EXTRA">Extra</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input name="description" placeholder="Description" required />
              <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
              <Input name="dueDate" type="date" />
              <Button type="submit">Add charge</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={recordPayment} className="space-y-3">
              <input type="hidden" name="residentId" value={resident.id} />
              <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
              <Select name="method" defaultValue="BANK_TRANSFER">
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="PORTAL">Portal</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </Select>
              <Input name="reference" placeholder="Reference" />
              <Input name="note" placeholder="Note" />
              <Button type="submit">Record payment</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {resident.charges.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.description}
                      <div className="text-xs text-[var(--muted)]">{c.type}</div>
                    </td>
                    <td>{formatCurrency(toNumber(c.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {resident.payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {formatDate(p.paidAt)}
                      <div className="text-xs text-[var(--muted)]">{p.method}</div>
                    </td>
                    <td>{formatCurrency(toNumber(p.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
