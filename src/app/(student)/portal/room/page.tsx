import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentRoomPage() {
  const session = await requireStudent();
  const residentId = session.user.residentId!;

  const allocation = await prisma.allocation.findFirst({
    where: { residentId, active: true },
    include: {
      bed: {
        include: {
          room: { include: { building: true } },
        },
      },
    },
  });

  const resident = await prisma.residentProfile.findUnique({
    where: { id: residentId },
    include: { mealPlan: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          My room
        </h1>
        <p className="text-[var(--muted)]">Your current allocation and residence details.</p>
      </div>

      {!allocation ? (
        <Card>
          <CardContent className="py-10 text-sm text-[var(--muted)]">
            You do not have an active room allocation yet. Once an offer is accepted and
            staff assign a bed, it will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Allocation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--muted)]">Building:</span>{" "}
                {allocation.bed.room.building.name}
              </p>
              <p>
                <span className="text-[var(--muted)]">Room:</span>{" "}
                {allocation.bed.room.number}
              </p>
              <p>
                <span className="text-[var(--muted)]">Bed:</span> {allocation.bed.label}
              </p>
              <p>
                <span className="text-[var(--muted)]">Room type:</span>{" "}
                {allocation.bed.room.roomType}
              </p>
              <p>
                <span className="text-[var(--muted)]">Term:</span> {allocation.term}
              </p>
              <p>
                <span className="text-[var(--muted)]">Check-in:</span>{" "}
                {formatDate(allocation.checkIn)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Residence extras</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-[var(--muted)]">Meal plan:</span>{" "}
                {resident?.mealPlan?.name || "—"}
              </p>
              <p>
                <span className="text-[var(--muted)]">Description:</span>{" "}
                {resident?.mealPlan?.description || "—"}
              </p>
              <p>
                <span className="text-[var(--muted)]">Emergency contact:</span>{" "}
                {resident?.emergencyName || "—"} ({resident?.emergencyPhone || "—"})
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
