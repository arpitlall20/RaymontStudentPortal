import Link from "next/link";
import { SideNav } from "@/components/shell/nav";
import { SignOutButton } from "@/components/shell/sign-out-button";

export function AppShell({
  brand,
  subtitle,
  userName,
  items,
  children,
}: {
  brand: string;
  subtitle: string;
  userName: string;
  items: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-5 md:flex md:flex-col">
          <Link href="/" className="mb-8 block">
            <div className="text-lg font-semibold tracking-tight text-[var(--brand-dark)]">
              {brand}
            </div>
            <div className="text-xs text-[var(--muted)]">{subtitle}</div>
          </Link>
          <SideNav items={items} />
          <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-4">
            <div className="text-sm">
              <div className="font-medium">{userName}</div>
            </div>
            <SignOutButton />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3 md:hidden">
            <div>
              <div className="font-semibold text-[var(--brand-dark)]">{brand}</div>
              <div className="text-xs text-[var(--muted)]">{userName}</div>
            </div>
            <SignOutButton />
          </header>
          <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-md bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
