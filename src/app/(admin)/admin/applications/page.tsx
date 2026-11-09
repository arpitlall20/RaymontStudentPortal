import { prisma } from "@/lib/db";
import { updateApplicationStatus } from "@/lib/actions/applications";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

export default async function AdminApplicationsPage() {
  await requireAdmin();

  const applications = await prisma.application.findMany({
    include: { resident: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Applications
        </h1>
        <p className="text-[var(--muted)]">
          Move applicants through interview, offer, deposit, and acceptance.
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                <span>{app.resident.user.name}</span>
                <StatusBadge value={app.status} />
              </CardTitle>
              <p className="text-sm text-[var(--muted)]">
                {app.resident.user.email} · {app.academicYear} {app.term} · submitted{" "}
                {formatDate(app.createdAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p>Preferred room: {app.preferredRoomType || "—"}</p>
                <p>Applicant notes: {app.notes || "—"}</p>
                <p>University: {app.resident.university || "—"}</p>
              </div>
              <form action={updateApplicationStatus} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="id" value={app.id} />
                <Select name="status" defaultValue={app.status}>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFERED">Offered</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="DECLINED">Declined</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </Select>
                <Input
                  name="interviewAt"
                  type="datetime-local"
                  defaultValue={
                    app.interviewAt
                      ? new Date(app.interviewAt.getTime() - app.interviewAt.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                />
                <Textarea
                  name="staffNotes"
                  className="md:col-span-2"
                  defaultValue={app.staffNotes || ""}
                  placeholder="Staff notes"
                />
                <Button type="submit" className="md:col-span-2">
                  Update application
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
        {applications.length === 0 && (
          <Card>
            <CardContent className="py-8 text-sm text-[var(--muted)]">
              No applications yet.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
