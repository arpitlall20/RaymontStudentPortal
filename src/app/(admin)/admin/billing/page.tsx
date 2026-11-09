import Link from "next/link";
import { prisma } from "@/lib/db";
import { getResidentBalance } from "@/lib/billing";
import { createCharge, recordPayment } from "@/lib/actions/billing";
import { requireAdmin } from "@/lib/session";
import { formatCurrency, formatDate, toNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default async function AdminBillingPage() {
  await requireAdmin();

  const [residents, recentPayments, feePlans] = await Promise.all([
    prisma.residentProfile.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.payment.findMany({
      take: 15,
      orderBy: { paidAt: "desc" },
      include: { resident: { include: { user: true } } },
    }),
    prisma.feePlan.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const withBalances = await Promise.all(
    residents.map(async (r) => ({
      ...r,
      balance: await getResidentBalance(r.id),
    }))
  );

  const owing = withBalances
    .filter((r) => r.balance.remaining > 0)
    .sort((a, b) => b.balance.remaining - a.balance.remaining);

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Billing
        </h1>
        <p className="text-[var(--muted)]">Fee plans, charges, payments, and outstanding balances.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={recordPayment} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="residentId">Resident</Label>
                <Select id="residentId" name="residentId" required>
                  <option value="">Select resident</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.user.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="method">Method</Label>
                  <Select id="method" name="method" defaultValue="BANK_TRANSFER">
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="PORTAL">Portal</option>
                    <option value="CARD">Card</option>
                    <option value="CASH">Cash</option>
                  </Select>
                </div>
              </div>
              <Input name="reference" placeholder="Reference" />
              <Input name="note" placeholder="Note" />
              <Button type="submit">Record payment</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add charge</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCharge} className="space-y-3">
              <Select name="residentId" required>
                <option value="">Select resident</option>
                {residents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.user.name}
                  </option>
                ))}
              </Select>
              <Select name="type" defaultValue="EXTRA">
                <option value="DEPOSIT">Deposit</option>
                <option value="TERM_FEES">Term fees</option>
                <option value="MEAL_PLAN">Meal plan</option>
                <option value="EXTRA">Extra</option>
                <option value="OTHER">Other</option>
              </Select>
              <Input name="description" placeholder="Description" required />
              <Input name="amount" type="number" step="0.01" placeholder="Amount" required />
              <Input name="dueDate" type="date" />
              <Button type="submit" variant="secondary">
                Add charge
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee plans</CardTitle>
        </CardHeader>
        <CardContent className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Name</th>
                <th>Year</th>
                <th>Deposit</th>
                <th>Term</th>
                <th>Meals</th>
              </tr>
            </thead>
            <tbody>
              {feePlans.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.academicYear}</td>
                  <td>{formatCurrency(toNumber(p.deposit))}</td>
                  <td>{formatCurrency(toNumber(p.termFee))}</td>
                  <td>{formatCurrency(toNumber(p.mealFee))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding balances</CardTitle>
        </CardHeader>
        <CardContent className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Resident</th>
                <th>Charged</th>
                <th>Paid</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {owing.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link href={`/admin/residents/${r.id}`} className="text-[var(--brand)] hover:underline">
                      {r.user.name}
                    </Link>
                  </td>
                  <td>{formatCurrency(r.balance.totalCharges)}</td>
                  <td>{formatCurrency(r.balance.totalPaid)}</td>
                  <td>{formatCurrency(r.balance.remaining)}</td>
                </tr>
              ))}
              {owing.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-[var(--muted)]">
                    No outstanding balances.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent payments</CardTitle>
        </CardHeader>
        <CardContent className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Resident</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td>{formatDate(p.paidAt)}</td>
                  <td>{p.resident.user.name}</td>
                  <td>{p.method}</td>
                  <td>{formatCurrency(toNumber(p.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
