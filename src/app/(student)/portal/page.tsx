import Link from "next/link";
import { prisma } from "@/lib/db";
import { getResidentBalance } from "@/lib/billing";
import { requireStudent } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const session = await requireStudent();
  const residentId = session.user.residentId;

  if (!residentId) {
    return <p>No resident profile linked to this account.</p>;
  }

  const resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
    include: {
      user: true,
      mealPlan: true,
      allocations: {
        where: { active: true },
        include: {
          bed: { include: { room: { include: { building: true } } } },
        },
        take: 1,
      },
      applications: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const balance = await getResidentBalance(residentId);
  const announcements = await prisma.announcement.findMany({
    where: {
      published: true,
      audience: { in: ["ALL", "STUDENTS"] },
    },
    orderBy: { publishAt: "desc" },
    take: 3,
  });

  const allocation = resident?.allocations[0];
  const roomLabel = allocation
    ? `${allocation.bed.room.building.code} ${allocation.bed.room.number}${allocation.bed.label}`
    : "Not allocated";

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Welcome, {resident?.user.name.split(" ")[0]}
        </h1>
        <p className="text-[var(--muted)]">
          Your Raymont residence overview for the current term.
        </p>
      </div>

      <div className="stat-grid">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBadge value={resident?.status || "APPLICANT"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Room</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{roomLabel}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fees remaining</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.remaining)}
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
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-[var(--muted)]">Student ID:</span>{" "}
              {resident?.studentId || "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">University:</span>{" "}
              {resident?.university || "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">Course:</span>{" "}
              {resident?.course || "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">Meal plan:</span>{" "}
              {resident?.mealPlan?.name || "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">Application:</span>{" "}
              {resident?.applications[0] ? (
                <StatusBadge value={resident.applications[0].status} />
              ) : (
                "None"
              )}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href="/portal/application">View application</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No announcements yet.</p>
            )}
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-[var(--muted)]">{formatDate(a.publishAt)}</div>
                <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{a.body}</p>
              </div>
            ))}
            <Button asChild variant="outline" size="sm">
              <Link href="/portal/announcements">All announcements</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
