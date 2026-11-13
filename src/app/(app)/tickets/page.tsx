import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/Badge";
import {
  STATUS_LABEL,
  STATUS_STYLE,
  TYPE_LABEL,
  TYPE_STYLE,
  PRIORITY_LABEL,
  PRIORITY_STYLE,
  STATUSES,
  WORK_TYPES,
  PRIORITIES,
} from "@/lib/labels";
import type { Prisma } from "@prisma/client";

function fmt(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const where: Prisma.TicketWhereInput = {};
  if (user.role === "REQUESTER") where.requesterId = user.id;
  else if (sp.mine === "1") where.requesterId = user.id;
  else if (sp.assignee === "me") where.assigneeId = user.id;

  if (sp.status && STATUSES.includes(sp.status as never))
    where.status = sp.status as never;
  if (sp.type && WORK_TYPES.includes(sp.type as never))
    where.type = sp.type as never;
  if (sp.priority && PRIORITIES.includes(sp.priority as never))
    where.priority = sp.priority as never;
  if (sp.project) where.projectId = sp.project;
  if (sp.q)
    where.OR = [
      { subject: { contains: sp.q, mode: "insensitive" } },
      { description: { contains: sp.q, mode: "insensitive" } },
    ];

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 100,
    include: { project: true, assignee: true, requester: true },
  });

  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Work items</h1>
        <Link href="/tickets/new" className="btn">
          New item
        </Link>
      </div>

      <form method="get" className="card grid grid-cols-2 gap-3 sm:grid-cols-6">
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search…"
          className="input col-span-2 sm:col-span-2"
        />
        <select name="type" defaultValue={sp.type ?? ""} className="select">
          <option value="">All types</option>
          {WORK_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className="select">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <select name="priority" defaultValue={sp.priority ?? ""} className="select">
          <option value="">Any priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <select name="project" defaultValue={sp.project ?? ""} className="select">
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.key} — {p.name}
            </option>
          ))}
        </select>
        <div className="col-span-2 flex gap-2 sm:col-span-6">
          <button className="btn" type="submit">
            Filter
          </button>
          <Link href="/tickets" className="btn-ghost">
            Reset
          </Link>
        </div>
      </form>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Subject</th>
              <th className="hidden px-3 py-2 md:table-cell">Project</th>
              <th className="hidden px-3 py-2 lg:table-cell">Assignee</th>
              <th className="px-3 py-2">Priority</th>
              <th className="px-3 py-2">Status</th>
              <th className="hidden px-3 py-2 sm:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-zinc-800/40">
                <td className="px-3 py-2 tabular-nums text-zinc-500">
                  <Link href={`/tickets/${t.id}`}>#{t.id}</Link>
                </td>
                <td className="px-3 py-2">
                  <Badge className={TYPE_STYLE[t.type]}>{TYPE_LABEL[t.type]}</Badge>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/tickets/${t.id}`}
                    className="font-medium hover:text-white"
                  >
                    {t.subject}
                  </Link>
                </td>
                <td className="hidden px-3 py-2 text-zinc-400 md:table-cell">
                  {t.project?.key ?? "—"}
                </td>
                <td className="hidden px-3 py-2 text-zinc-400 lg:table-cell">
                  {t.assignee?.name ?? "Unassigned"}
                </td>
                <td className="px-3 py-2">
                  <Badge className={PRIORITY_STYLE[t.priority]}>
                    {PRIORITY_LABEL[t.priority]}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <Badge className={STATUS_STYLE[t.status]}>
                    {STATUS_LABEL[t.status]}
                  </Badge>
                </td>
                <td className="hidden px-3 py-2 text-zinc-500 sm:table-cell">
                  {fmt(t.updatedAt)}
                </td>
              </tr>
            ))}
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-zinc-500">
                  No items match these filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
