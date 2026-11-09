import { prisma } from "@/lib/db";
import { createAnnouncement, toggleAnnouncement } from "@/lib/actions/ops";
import { requireAdmin } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const announcements = await prisma.announcement.findMany({
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
        <p className="text-[var(--muted)]">Publish notices to students and staff.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Select id="audience" name="audience" defaultValue="ALL">
                <option value="ALL">All</option>
                <option value="STUDENTS">Students</option>
                <option value="STAFF">Staff</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" required />
            </div>
            <Button type="submit">Publish</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {announcements.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-3">
                <span>{a.title}</span>
                <Badge tone={a.published ? "success" : "default"}>
                  {a.published ? "Published" : "Hidden"}
                </Badge>
                <Badge>{a.audience}</Badge>
              </CardTitle>
              <p className="text-xs text-[var(--muted)]">{formatDate(a.publishAt)}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-wrap text-sm">{a.body}</p>
              <form action={toggleAnnouncement}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="published" value={String(a.published)} />
                <Button type="submit" variant="outline" size="sm">
                  {a.published ? "Unpublish" : "Publish"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
