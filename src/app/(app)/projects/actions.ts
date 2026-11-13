"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { ActionState } from "@/lib/forms";

const schema = z.object({
  key: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[A-Za-z0-9]+$/, "Key must be letters/numbers only"),
  name: z.string().min(2, "Name is required"),
  description: z.string().default(""),
  leadId: z.string().optional(),
});

export async function createProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN", "AGENT"]);

  const parsed = schema.safeParse({
    key: formData.get("key"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    leadId: formData.get("leadId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const exists = await prisma.project.findUnique({
    where: { key: d.key.toUpperCase() },
  });
  if (exists) return { error: `Project key "${d.key.toUpperCase()}" already exists` };

  await prisma.project.create({
    data: {
      key: d.key.toUpperCase(),
      name: d.name,
      description: d.description,
      leadId: d.leadId || null,
    },
  });
  redirect("/projects");
}

export async function updateProjectStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN", "AGENT"]);
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.project.update({
    where: { id },
    data: { status: status as never },
  });
  revalidatePath(`/projects/${id}`);
  return { ok: true };
}
