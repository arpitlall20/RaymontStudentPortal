import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { formatCurrency, toNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminDashboard() {
  await requireAdmin();

  const [
    activeResidents,
    beds,
    occupied,
    openApps,
    openMaint,
    charges,
    payments,
  ] = await Promise.all([
    prisma.residentProfile.count({ where: { status: "ACTIVE" } }),
    prisma.bed.count(),
    prisma.allocation.count({ where: { active: true } }),
    prisma.application.count({
      where: { status: { in: ["SUBMITTED", "INTERVIEW", "OFFERED"] } },
    }),
    prisma.maintenanceRequest.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.charge.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const outstanding =
    toNumber(charges._sum.amount ?? 0) - toNumber(payments._sum.amount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Admin dashboard
        </h1>
        <p className="text-[var(--muted)]">
          Occupancy, applications, billing, and residence operations.
        </p>
      </div>

      <div className="stat-grid">
        <Card>
          <CardHeader>
            <CardTitle>Active residents</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeResidents}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {occupied}/{beds}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open applications</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{openApps}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance open</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{openMaint}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding fees</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {formatCurrency(outstanding)}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/applications">Review applications</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/admin/allocations">Allocate rooms</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/billing">Record payment</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/maintenance">Maintenance queue</Link>
        </Button>
      </div>
    </div>
  );
}
