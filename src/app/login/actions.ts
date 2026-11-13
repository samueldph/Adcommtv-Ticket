"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession } from "@/lib/auth";
import type { ActionState } from "@/lib/forms";

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  await createSession(user);
  redirect("/dashboard");
}
