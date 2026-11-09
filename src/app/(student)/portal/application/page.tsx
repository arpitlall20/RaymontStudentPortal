import { prisma } from "@/lib/db";
import { submitApplication } from "@/lib/actions/applications";
import { requireStudent } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

export default async function StudentApplicationPage() {
  const session = await requireStudent();
  const residentId = session.user.residentId!;

  const applications = await prisma.application.findMany({
    where: { residentId },
    orderBy: { createdAt: "desc" },
  });

  const open = applications.find((a) =>
    ["SUBMITTED", "INTERVIEW", "OFFERED", "ACCEPTED"].includes(a.status)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Application
        </h1>
        <p className="text-[var(--muted)]">
          Apply for a place or track your current application status.
        </p>
      </div>

      {open ? (
        <Card>
          <CardHeader>
            <CardTitle>Current application — {open.academicYear}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Status: <StatusBadge value={open.status} />
            </p>
            <p>Term: {open.term}</p>
            <p>Preferred room: {open.preferredRoomType || "—"}</p>
            <p>Submitted: {formatDate(open.createdAt)}</p>
            {open.interviewAt && <p>Interview: {formatDate(open.interviewAt)}</p>}
            {open.offeredAt && <p>Offer date: {formatDate(open.offeredAt)}</p>}
            {open.notes && <p>Your notes: {open.notes}</p>}
            {open.status === "OFFERED" && (
              <p className="mt-3 rounded-md bg-[var(--brand-soft)] p-3 text-[var(--brand-dark)]">
                You have an offer. Pay your deposit under Fees to secure your place, then
                college staff will allocate a room.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Start an application</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={submitApplication} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic year</Label>
                  <Input id="academicYear" name="academicYear" defaultValue="2026" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Input id="term" name="term" defaultValue="Full Year" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredRoomType">Preferred room type</Label>
                <Select id="preferredRoomType" name="preferredRoomType" defaultValue="SINGLE">
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="TWIN">Twin</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Anything we should know?" />
              </div>
              <Button type="submit">Submit application</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>{a.academicYear}</td>
                    <td>
                      <StatusBadge value={a.status} />
                    </td>
                    <td>{formatDate(a.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
