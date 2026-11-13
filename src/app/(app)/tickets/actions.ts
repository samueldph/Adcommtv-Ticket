"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { STATUS_LABEL, PRIORITY_LABEL, DEPLOY_LABEL } from "@/lib/labels";
import type { ActionState } from "@/lib/forms";
import type { TicketStatus } from "@prisma/client";

const createSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().default(""),
  type: z.enum(["REQUEST", "DEVELOPMENT", "BUG", "ENHANCEMENT", "TASK"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  projectId: z.string().optional(),
  sfComponent: z
    .enum([
      "APEX",
      "FLOW",
      "LWC",
      "AURA",
      "VALIDATION_RULE",
      "PERMISSION",
      "REPORT_DASHBOARD",
      "INTEGRATION",
      "DATA",
      "CONFIG",
      "OTHER",
    ])
    .optional(),
  sfEnvironment: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function createTicket(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description") ?? "",
    type: formData.get("type"),
    priority: formData.get("priority"),
    projectId: formData.get("projectId") || undefined,
    sfComponent: formData.get("sfComponent") || undefined,
    sfEnvironment: formData.get("sfEnvironment") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const ticket = await prisma.ticket.create({
    data: {
      subject: d.subject,
      description: d.description,
      type: d.type,
      priority: d.priority,
      projectId: d.projectId || null,
      sfComponent: d.sfComponent || null,
      sfEnvironment: d.sfEnvironment || null,
      dueDate: d.dueDate ? new Date(d.dueDate) : null,
      requesterId: user.id,
      activities: {
        create: { actorId: user.id, message: "created this item" },
      },
    },
  });

  redirect(`/tickets/${ticket.id}`);
}

export async function addComment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  const ticketId = Number(formData.get("ticketId"));
  const body = String(formData.get("body") || "").trim();
  const internal = formData.get("internal") === "on";
  if (!body) return { error: "Comment cannot be empty" };

  await prisma.comment.create({
    data: {
      ticketId,
      authorId: user.id,
      body,
      // only staff can post internal notes
      internal: internal && user.role !== "REQUESTER",
    },
  });
  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}

/** Staff-only field updates (status, priority, assignee, deploy status, project). */
export async function updateTicket(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();
  if (user.role === "REQUESTER") return { error: "Not allowed" };

  const ticketId = Number(formData.get("ticketId"));
  const current = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!current) return { error: "Not found" };

  const status = formData.get("status") as TicketStatus | null;
  const priority = formData.get("priority") as string | null;
  const assigneeId = (formData.get("assigneeId") as string) || "";
  const deployStatus = formData.get("deployStatus") as string | null;
  const projectId = (formData.get("projectId") as string) || "";

  const activities: string[] = [];
  const data: Record<string, unknown> = {};

  if (status && status !== current.status) {
    data.status = status;
    activities.push(
      `changed status ${STATUS_LABEL[current.status]} → ${STATUS_LABEL[status]}`
    );
    if (status === "DEPLOYED" || status === "CLOSED") {
      if (!current.resolvedAt) data.resolvedAt = new Date();
    }
  }
  if (priority && priority !== current.priority) {
    data.priority = priority;
    activities.push(
      `changed priority ${PRIORITY_LABEL[current.priority]} → ${
        PRIORITY_LABEL[priority as keyof typeof PRIORITY_LABEL]
      }`
    );
  }
  if (assigneeId !== (current.assigneeId ?? "")) {
    data.assigneeId = assigneeId || null;
    if (!assigneeId) {
      activities.push("unassigned");
    } else {
      const a = await prisma.user.findUnique({ where: { id: assigneeId } });
      activities.push(`assigned to ${a?.name ?? "someone"}`);
    }
  }
  if (deployStatus && deployStatus !== current.deployStatus) {
    data.deployStatus = deployStatus;
    activities.push(
      `deploy: ${DEPLOY_LABEL[current.deployStatus]} → ${
        DEPLOY_LABEL[deployStatus as keyof typeof DEPLOY_LABEL]
      }`
    );
  }
  if (projectId !== (current.projectId ?? "")) {
    data.projectId = projectId || null;
    activities.push(projectId ? "moved to another project" : "removed from project");
  }

  if (Object.keys(data).length === 0) return { ok: true };

  await prisma.ticket.update({ where: { id: ticketId }, data });
  for (const message of activities) {
    await prisma.activity.create({
      data: { ticketId, actorId: user.id, message },
    });
  }
  revalidatePath(`/tickets/${ticketId}`);
  return { ok: true };
}
