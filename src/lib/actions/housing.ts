"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export async function createBuilding(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim().toUpperCase();
  const floors = Number(formData.get("floors") || 1);
  if (!name || !code) throw new Error("Name and code are required.");

  await prisma.building.create({ data: { name, code, floors } });
  revalidatePath("/admin/rooms");
  return;
}

export async function createRoom(formData: FormData) {
  await requireAdmin();
  const buildingId = String(formData.get("buildingId") || "");
  const number = String(formData.get("number") || "").trim();
  const floor = Number(formData.get("floor") || 1);
  const roomType = String(formData.get("roomType") || "SINGLE") as
    | "SINGLE"
    | "DOUBLE"
    | "TWIN";
  const capacity = Number(formData.get("capacity") || 1);

  if (!buildingId || !number) throw new Error("Building and number required.");

  await prisma.room.create({
    data: {
      buildingId,
      number,
      floor,
      roomType,
      capacity,
      beds: {
        create: Array.from({ length: capacity }, (_, i) => ({
          label: String.fromCharCode(65 + i),
        })),
      },
    },
  });
  revalidatePath("/admin/rooms");
  return;
}

const allocateSchema = z.object({
  residentId: z.string().min(1),
  bedId: z.string().min(1),
  term: z.string().min(1),
  checkIn: z.string().min(1),
});

export async function allocateBed(formData: FormData) {
  await requireAdmin();
  const parsed = allocateSchema.safeParse({
    residentId: formData.get("residentId"),
    bedId: formData.get("bedId"),
    term: formData.get("term"),
    checkIn: formData.get("checkIn"),
  });
  if (!parsed.success) throw new Error("Invalid allocation details.");

  const existingActive = await prisma.allocation.findFirst({
    where: {
      OR: [
        { bedId: parsed.data.bedId, active: true },
        { residentId: parsed.data.residentId, active: true },
      ],
    },
  });
  if (existingActive) {
    throw new Error("Bed or resident already has an active allocation.");
  }

  await prisma.$transaction([
    prisma.allocation.create({
      data: {
        residentId: parsed.data.residentId,
        bedId: parsed.data.bedId,
        term: parsed.data.term,
        checkIn: new Date(parsed.data.checkIn),
        active: true,
      },
    }),
    prisma.residentProfile.update({
      where: { id: parsed.data.residentId },
      data: { status: "ACTIVE" },
    }),
  ]);

  revalidatePath("/admin/allocations");
  revalidatePath("/admin/rooms");
  revalidatePath("/admin/residents");
  return;
}

export async function checkoutAllocation(formData: FormData) {
  await requireAdmin();
  const allocationId = String(formData.get("allocationId") || "");
  if (!allocationId) throw new Error("Missing allocation.");

  const allocation = await prisma.allocation.update({
    where: { id: allocationId },
    data: { active: false, checkOut: new Date() },
  });

  await prisma.residentProfile.update({
    where: { id: allocation.residentId },
    data: { status: "ALUMNI" },
  });

  revalidatePath("/admin/allocations");
  revalidatePath("/admin/rooms");
  revalidatePath("/admin/residents");
  return;
}

export async function updateResident(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("Missing resident.");

  await prisma.residentProfile.update({
    where: { id },
    data: {
      studentId: String(formData.get("studentId") || "") || null,
      phone: String(formData.get("phone") || "") || null,
      university: String(formData.get("university") || "") || null,
      course: String(formData.get("course") || "") || null,
      emergencyName: String(formData.get("emergencyName") || "") || null,
      emergencyPhone: String(formData.get("emergencyPhone") || "") || null,
      status: String(formData.get("status") || "APPLICANT") as
        | "APPLICANT"
        | "OFFERED"
        | "ACTIVE"
        | "ALUMNI",
    },
  });

  const name = String(formData.get("name") || "").trim();
  if (name) {
    const resident = await prisma.residentProfile.findUnique({ where: { id } });
    if (resident) {
      await prisma.user.update({
        where: { id: resident.userId },
        data: { name },
      });
    }
  }

  revalidatePath("/admin/residents");
  revalidatePath(`/admin/residents/${id}`);
  return;
}
