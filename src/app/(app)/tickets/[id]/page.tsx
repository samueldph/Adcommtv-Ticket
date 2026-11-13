import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isStaff } from "@/lib/session";
import { Badge } from "@/components/Badge";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  TYPE_LABEL,
  TYPE_STYLE,
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  SF_COMPONENT_LABEL,
  DEPLOY_LABEL,
} from "@/lib/labels";
import TicketControls from "./TicketControls";
import CommentForm from "./CommentForm";

function fmt(d: Date) {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function TicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      project: true,
      requester: true,
      assignee: true,
      comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
      activities: { include: { actor: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!ticket) notFound();

  // Requesters may only view their own items.
  if (user.role === "REQUESTER" && ticket.requesterId !== user.id) {
    redirect("/tickets");
  }

  const staff = isStaff(user.role);
  const [agents, projects] = await Promise.all([
    staff
      ? prisma.user.findMany({
          where: { role: { in: ["ADMIN", "AGENT"] }, active: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    staff
      ? prisma.project.findMany({ orderBy: { name: "asc" } })
      : Promise.resolve([]),
  ]);

  // Requesters never see internal notes.
  const visibleComments = staff
    ? ticket.comments
    : ticket.comments.filter((c) => !c.internal);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/tickets" className="hover:text-zinc-300">
          Work items
        </Link>
        <span>/</span>
        <span className="tabular-nums">#{ticket.id}</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="card">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className={TYPE_STYLE[ticket.type]}>
                {TYPE_LABEL[ticket.type]}
              </Badge>
              <Badge className={PRIORITY_STYLE[ticket.priority]}>
                {PRIORITY_LABEL[ticket.priority]}
              </Badge>
              <Badge className={STATUS_STYLE[ticket.status]}>
                {STATUS_LABEL[ticket.status]}
              </Badge>
            </div>
            <h1 className="text-xl font-semibold">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Opened by {ticket.requester.name} · {fmt(ticket.createdAt)}
            </p>
            {ticket.description ? (
              <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-200">
                {ticket.description}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-zinc-500">
                No description provided.
              </p>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">
              Comments {visibleComments.length > 0 ? `(${visibleComments.length})` : ""}
            </h2>
            <ul className="space-y-3">
              {visibleComments.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-md border p-3 text-sm ${
                    c.internal
                      ? "border-amber-900/50 bg-amber-950/20"
                      : "border-zinc-800 bg-zinc-900/60"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-medium text-zinc-300">
                      {c.author.name}
                    </span>
                    <span>{fmt(c.createdAt)}</span>
                    {c.internal ? (
                      <span className="badge bg-amber-500/15 text-amber-300 ring-amber-500/30">
                        Internal note
                      </span>
                    ) : null}
                  </div>
                  <p className="whitespace-pre-wrap text-zinc-200">{c.body}</p>
                </li>
              ))}
              {visibleComments.length === 0 ? (
                <li className="text-sm text-zinc-500">No comments yet.</li>
              ) : null}
            </ul>
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <CommentForm ticketId={ticket.id} canInternal={staff} />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {staff ? (
            <TicketControls
              ticketId={ticket.id}
              status={ticket.status}
              priority={ticket.priority}
              assigneeId={ticket.assigneeId}
              deployStatus={ticket.deployStatus}
              projectId={ticket.projectId}
              agents={agents.map((a) => ({ id: a.id, name: a.name }))}
              projects={projects.map((p) => ({
                id: p.id,
                label: `${p.key} — ${p.name}`,
              }))}
            />
          ) : null}

          <div className="card space-y-3 text-sm">
            <h2 className="text-sm font-medium text-zinc-300">Details</h2>
            <Detail label="Requester" value={ticket.requester.name} />
            <Detail
              label="Assignee"
              value={ticket.assignee?.name ?? "Unassigned"}
            />
            <Detail
              label="Project"
              value={
                ticket.project
                  ? `${ticket.project.key} — ${ticket.project.name}`
                  : "—"
              }
            />
            <Detail
              label="SF component"
              value={
                ticket.sfComponent ? SF_COMPONENT_LABEL[ticket.sfComponent] : "—"
              }
            />
            <Detail label="Environment" value={ticket.sfEnvironment ?? "—"} />
            <Detail
              label="Deploy status"
              value={DEPLOY_LABEL[ticket.deployStatus]}
            />
            <Detail
              label="Due"
              value={
                ticket.dueDate
                  ? new Date(ticket.dueDate).toLocaleDateString("en-US")
                  : "—"
              }
            />
          </div>

          <div className="card">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">Activity</h2>
            <ul className="space-y-2 text-xs text-zinc-400">
              {ticket.activities.map((a) => (
                <li key={a.id}>
                  <span className="text-zinc-300">{a.actor.name}</span>{" "}
                  {a.message}
                  <span className="block text-zinc-600">{fmt(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
