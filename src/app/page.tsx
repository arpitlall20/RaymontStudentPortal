import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();
  const href = session
    ? session.user.role === "ADMIN"
      ? "/admin"
      : "/portal"
    : "/login";

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="text-lg font-semibold tracking-tight text-[var(--brand-dark)]">
          Raymont Residential College
        </div>
        <div className="flex items-center gap-3">
          {!session && (
            <Link href="/register" className="text-sm font-medium text-[var(--brand-dark)]">
              Register
            </Link>
          )}
          <Button asChild>
            <Link href={href}>{session ? "Open portal" : "Sign in"}</Link>
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="mx-auto min-h-[70vh] max-w-6xl px-6 pb-16 pt-10"
          style={{
            background:
              "linear-gradient(135deg, var(--hero-from), var(--hero-to))",
            borderRadius: "1.5rem",
            margin: "0 1rem 2rem",
            color: "white",
          }}
        >
          <div className="flex min-h-[60vh] flex-col justify-end gap-6 p-6 md:max-w-2xl md:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-white/80">
              Student accommodation portal
            </p>
            <h1
              className="text-4xl leading-tight md:text-6xl"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Raymont
            </h1>
            <p className="max-w-xl text-base text-white/90 md:text-lg">
              Manage your room, fees, applications, and college life in one place —
              built for residents and staff at Raymont Residential College.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-white text-[var(--brand-dark)] hover:bg-white/90">
                <Link href={href}>{session ? "Go to dashboard" : "Student / staff login"}</Link>
              </Button>
              {!session && (
                <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
                  <Link href="/register">Apply to stay</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 md:grid-cols-3">
        {[
          {
            title: "Your room & profile",
            body: "See your allocation, meal plan, and emergency contacts at a glance.",
          },
          {
            title: "Fees paid & remaining",
            body: "Track charges, payments, and balances with a clear student ledger.",
          },
          {
            title: "College operations",
            body: "Staff manage rooms, applications, maintenance, and announcements.",
          },
        ].map((item) => (
          <div key={item.title} className="space-y-2">
            <h2
              className="text-xl text-[var(--brand-dark)]"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              {item.title}
            </h2>
            <p className="text-sm text-[var(--muted)]">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
