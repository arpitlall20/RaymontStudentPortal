import { AppShell } from "@/components/shell/app-shell";
import { requireStudent } from "@/lib/session";

const items = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/room", label: "My room" },
  { href: "/portal/fees", label: "Fees" },
  { href: "/portal/application", label: "Application" },
  { href: "/portal/maintenance", label: "Maintenance" },
  { href: "/portal/announcements", label: "Announcements" },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireStudent();
  return (
    <AppShell
      brand="Raymont"
      subtitle="Student portal"
      userName={session.user.name}
      items={items}
    >
      {children}
    </AppShell>
  );
}
