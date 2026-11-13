import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./auth";
import type { Role } from "@prisma/client";

/** Require a logged-in user; redirect to /login otherwise. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

/** Require one of the given roles; redirect to /dashboard otherwise. */
export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export function isStaff(role: Role) {
  return role === "ADMIN" || role === "AGENT";
}
