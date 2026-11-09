import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
            Sign in
          </CardTitle>
          <CardDescription>
            Raymont student and staff portal. Demo: student@raymont.local or
            admin@raymont.local / password123
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
              Invalid email or password.
            </p>
          )}
          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={params.callbackUrl || ""} />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <p className="mt-4 text-sm text-[var(--muted)]">
            New student?{" "}
            <Link href="/register" className="font-medium text-[var(--brand)]">
              Register and apply
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
