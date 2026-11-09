"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, requireStudent } from "@/lib/session";

export async function submitApplication(formData: FormData) {
  const session = await requireStudent();
  const residentId = session.user.residentId;
  if (!residentId) throw new Error("No resident profile.");

  const academicYear = String(formData.get("academicYear") || "2026");
  const term = String(formData.get("term") || "Full Year");
  const preferredRoomType = String(formData.get("preferredRoomType") || "") as
    | "SINGLE"
    | "DOUBLE"
    | "TWIN"
    | "";
  const notes = String(formData.get("notes") || "") || null;

  const existing = await prisma.application.findFirst({
    where: {
      residentId,
      academicYear,
      status: { in: ["SUBMITTED", "INTERVIEW", "OFFERED", "ACCEPTED"] },
    },
  });
  if (existing) {
    throw new Error("You already have an open application for this year.");
  }

  await prisma.application.create({
    data: {
      residentId,
      academicYear,
      term,
      preferredRoomType: preferredRoomType || null,
      notes,
      status: "SUBMITTED",
    },
  });

  await prisma.residentProfile.update({
    where: { id: residentId },
    data: { status: "APPLICANT" },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/application");
  revalidatePath("/admin/applications");
  return;
}

export async function updateApplicationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "SUBMITTED"
    | "INTERVIEW"
    | "OFFERED"
    | "ACCEPTED"
    | "DECLINED"
    | "WITHDRAWN";
  const staffNotes = String(formData.get("staffNotes") || "") || null;
  const interviewAt = String(formData.get("interviewAt") || "");

  if (!id || !status) throw new Error("Missing fields.");

  const application = await prisma.application.update({
    where: { id },
    data: {
      status,
      staffNotes,
      interviewAt: interviewAt ? new Date(interviewAt) : undefined,
      offeredAt: status === "OFFERED" ? new Date() : undefined,
    },
  });

  if (status === "OFFERED") {
    await prisma.residentProfile.update({
      where: { id: application.residentId },
      data: { status: "OFFERED" },
    });

    const plan = await prisma.feePlan.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    });
    if (plan) {
      const existingDeposit = await prisma.charge.findFirst({
        where: {
          residentId: application.residentId,
          type: "DEPOSIT",
          description: { contains: "deposit" },
        },
      });
      if (!existingDeposit) {
        await prisma.charge.create({
          data: {
            residentId: application.residentId,
            type: "DEPOSIT",
            description: "Offer acceptance deposit",
            amount: plan.deposit,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  if (status === "ACCEPTED") {
    await prisma.residentProfile.update({
      where: { id: application.residentId },
      data: { status: "ACTIVE" },
    });
  }

  if (status === "DECLINED" || status === "WITHDRAWN") {
    await prisma.residentProfile.update({
      where: { id: application.residentId },
      data: { status: "APPLICANT" },
    });
  }

  revalidatePath("/admin/applications");
  revalidatePath("/portal/application");
  return;
}
