import { prisma } from "@/lib/db";
import { requireStudent } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function StudentAnnouncementsPage() {
  await requireStudent();
  const announcements = await prisma.announcement.findMany({
    where: {
      published: true,
      audience: { in: ["ALL", "STUDENTS"] },
    },
    orderBy: { publishAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Announcements
        </h1>
        <p className="text-[var(--muted)]">College notices for residents.</p>
      </div>

      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle>{a.title}</CardTitle>
              <p className="text-xs text-[var(--muted)]">{formatDate(a.publishAt)}</p>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{a.body}</p>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <Card>
            <CardContent className="py-8 text-sm text-[var(--muted)]">
              No announcements published.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
