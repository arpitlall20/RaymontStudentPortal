"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, requireStudent } from "@/lib/session";

export async function createCharge(formData: FormData) {
  await requireAdmin();
  const residentId = String(formData.get("residentId") || "");
  const type = String(formData.get("type") || "OTHER") as
    | "DEPOSIT"
    | "TERM_FEES"
    | "MEAL_PLAN"
    | "EXTRA"
    | "OTHER";
  const description = String(formData.get("description") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const dueDate = String(formData.get("dueDate") || "");

  if (!residentId || !description || !(amount > 0)) {
    throw new Error("Resident, description, and positive amount required.");
  }

  await prisma.charge.create({
    data: {
      residentId,
      type,
      description,
      amount,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/residents/${residentId}`);
  revalidatePath("/portal/fees");
  return;
}

export async function recordPayment(formData: FormData) {
  const session = await requireAdmin();
  const residentId = String(formData.get("residentId") || "");
  const amount = Number(formData.get("amount") || 0);
  const method = String(formData.get("method") || "PORTAL");
  const reference = String(formData.get("reference") || "") || null;
  const note = String(formData.get("note") || "") || null;

  if (!residentId || !(amount > 0)) {
    throw new Error("Resident and positive amount required.");
  }

  await prisma.payment.create({
    data: {
      residentId,
      amount,
      method,
      reference,
      note,
      createdById: session.user.id,
    },
  });

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/residents/${residentId}`);
  revalidatePath("/portal/fees");
  return;
}

export async function studentMockPay(formData: FormData) {
  const session = await requireStudent();
  const residentId = session.user.residentId;
  if (!residentId) throw new Error("No resident profile.");

  const amount = Number(formData.get("amount") || 0);
  if (!(amount > 0)) throw new Error("Enter a positive amount.");

  await prisma.payment.create({
    data: {
      residentId,
      amount,
      method: "PORTAL",
      reference: `STU-${Date.now()}`,
      note: "Student portal mock payment",
      createdById: session.user.id,
    },
  });

  revalidatePath("/portal/fees");
  revalidatePath("/portal");
  return;
}

export async function applyFeePlan(formData: FormData) {
  await requireAdmin();
  const residentId = String(formData.get("residentId") || "");
  const feePlanId = String(formData.get("feePlanId") || "");
  if (!residentId || !feePlanId) throw new Error("Missing fields.");

  const plan = await prisma.feePlan.findUnique({ where: { id: feePlanId } });
  if (!plan) throw new Error("Fee plan not found.");

  await prisma.charge.createMany({
    data: [
      {
        residentId,
        type: "DEPOSIT",
        description: `${plan.name} deposit`,
        amount: plan.deposit,
      },
      {
        residentId,
        type: "TERM_FEES",
        description: `${plan.name} term fees`,
        amount: plan.termFee,
      },
      {
        residentId,
        type: "MEAL_PLAN",
        description: `${plan.name} meal fees`,
        amount: plan.mealFee,
      },
    ],
  });

  revalidatePath("/admin/billing");
  revalidatePath(`/admin/residents/${residentId}`);
  return;
}
