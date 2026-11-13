"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import type { ActionState } from "@/lib/forms";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  role: z.enum(["ADMIN", "AGENT", "REQUESTER"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const email = d.email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "A user with that email already exists" };

  await prisma.user.create({
    data: {
      name: d.name,
      email,
      role: d.role,
      passwordHash: await hashPassword(d.password),
    },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setRole(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  const role = String(formData.get("role"));
  if (id === admin.id) return { error: "You can't change your own role" };
  await prisma.user.update({ where: { id }, data: { role: role as never } });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function toggleActive(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["ADMIN"]);
  const id = String(formData.get("id"));
  if (id === admin.id) return { error: "You can't deactivate yourself" };
  const u = await prisma.user.findUnique({ where: { id } });
  if (!u) return { error: "Not found" };
  await prisma.user.update({ where: { id }, data: { active: !u.active } });
  revalidatePath("/admin/users");
  return { ok: true };
}
