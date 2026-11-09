import { AppShell } from "@/components/shell/app-shell";
import { requireAdmin } from "@/lib/session";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/residents", label: "Residents" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/allocations", label: "Allocations" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/maintenance", label: "Maintenance" },
  { href: "/admin/announcements", label: "Announcements" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <AppShell
      brand="Raymont"
      subtitle="Admin portal"
      userName={session.user.name}
      items={items}
    >
      {children}
    </AppShell>
  );
}
