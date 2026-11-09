"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, requireStudent } from "@/lib/session";

export async function createMaintenanceRequest(formData: FormData) {
  const session = await requireStudent();
  const residentId = session.user.residentId;
  if (!residentId) throw new Error("No resident profile.");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "OTHER") as
    | "PLUMBING"
    | "ELECTRICAL"
    | "FURNITURE"
    | "CLEANING"
    | "HVAC"
    | "OTHER";

  if (!title || !description) throw new Error("Title and description required.");

  const allocation = await prisma.allocation.findFirst({
    where: { residentId, active: true },
    include: { bed: true },
  });

  await prisma.maintenanceRequest.create({
    data: {
      residentId,
      roomId: allocation?.bed.roomId,
      title,
      description,
      category,
    },
  });

  revalidatePath("/portal/maintenance");
  revalidatePath("/admin/maintenance");
  return;
}

export async function updateMaintenanceStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as
    | "OPEN"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "CLOSED";
  const staffNotes = String(formData.get("staffNotes") || "") || null;

  if (!id || !status) throw new Error("Missing fields.");

  await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      status,
      staffNotes,
      resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : null,
    },
  });

  revalidatePath("/admin/maintenance");
  revalidatePath("/portal/maintenance");
  return;
}

export async function createAnnouncement(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const audience = String(formData.get("audience") || "ALL") as
    | "ALL"
    | "STUDENTS"
    | "STAFF";

  if (!title || !body) throw new Error("Title and body required.");

  await prisma.announcement.create({
    data: { title, body, audience, published: true },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/portal/announcements");
  revalidatePath("/portal");
  revalidatePath("/admin");
  return;
}

export async function toggleAnnouncement(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const published = String(formData.get("published") || "") === "true";
  await prisma.announcement.update({
    where: { id },
    data: { published: !published },
  });
  revalidatePath("/admin/announcements");
  revalidatePath("/portal/announcements");
  return;
}
