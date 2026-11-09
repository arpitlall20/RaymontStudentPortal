import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/utils";

export async function getResidentBalance(residentId: string) {
  const [charges, payments] = await Promise.all([
    prisma.charge.aggregate({
      where: { residentId },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { residentId },
      _sum: { amount: true },
    }),
  ]);

  const totalCharges = toNumber(charges._sum.amount ?? 0);
  const totalPaid = toNumber(payments._sum.amount ?? 0);
  const remaining = totalCharges - totalPaid;

  return { totalCharges, totalPaid, remaining };
}
