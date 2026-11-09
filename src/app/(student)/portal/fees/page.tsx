import { prisma } from "@/lib/db";
import { getResidentBalance } from "@/lib/billing";
import { studentMockPay } from "@/lib/actions/billing";
import { requireStudent } from "@/lib/session";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function StudentFeesPage() {
  const session = await requireStudent();
  const residentId = session.user.residentId!;
  const balance = await getResidentBalance(residentId);

  const [charges, payments] = await Promise.all([
    prisma.charge.findMany({
      where: { residentId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.findMany({
      where: { residentId },
      orderBy: { paidAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Fees & payments
        </h1>
        <p className="text-[var(--muted)]">
          Track charges, payments, and your remaining balance.
        </p>
      </div>

      <div className="stat-grid">
        <Card>
          <CardHeader>
            <CardTitle>Total charges</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.totalCharges)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatCurrency(balance.totalPaid)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Remaining</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-[var(--accent)]">
            {formatCurrency(balance.remaining)}
          </CardContent>
        </Card>
      </div>

      {balance.remaining > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Make a payment (demo)</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={studentMockPay} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="space-y-2 sm:w-48">
                <Label htmlFor="amount">Amount (AUD)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={Math.min(balance.remaining, 500).toFixed(2)}
                  required
                />
              </div>
              <Button type="submit">Pay now (simulated)</Button>
            </form>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Simulated portal payment — no real card charge. Staff can also record bank transfers.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Due</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((c) => (
                  <tr key={c.id}>
                    <td>{c.description}</td>
                    <td>{c.type}</td>
                    <td>{formatDate(c.dueDate)}</td>
                    <td>{formatCurrency(toNumber(c.amount))}</td>
                  </tr>
                ))}
                {charges.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-[var(--muted)]">
                      No charges yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.paidAt)}</td>
                    <td>{p.method}</td>
                    <td>{p.reference || "—"}</td>
                    <td>{formatCurrency(toNumber(p.amount))}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-[var(--muted)]">
                      No payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
