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
  OPEN_STATUSES,
} from "@/lib/labels";
import type { Prisma } from "@prisma/client";

export default async function DashboardPage() {
  const user = await requireUser();

  // Requesters only ever see their own items.
  const scope: Prisma.TicketWhereInput =
    user.role === "REQUESTER" ? { requesterId: user.id } : {};

  const [byStatus, byType, openCount, urgentOpen, mine, recent] =
    await Promise.all([
      prisma.ticket.groupBy({
        by: ["status"],
        where: scope,
        _count: { _all: true },
      }),
      prisma.ticket.groupBy({
        by: ["type"],
        where: scope,
        _count: { _all: true },
      }),
      prisma.ticket.count({ where: { ...scope, status: { in: OPEN_STATUSES } } }),
      prisma.ticket.count({
        where: { ...scope, status: { in: OPEN_STATUSES }, priority: "URGENT" },
      }),
      user.role === "REQUESTER"
        ? prisma.ticket.count({ where: { requesterId: user.id } })
        : prisma.ticket.count({
            where: { assigneeId: user.id, status: { in: OPEN_STATUSES } },
          }),
      prisma.ticket.findMany({
        where: scope,
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: { project: true, assignee: true, requester: true },
      }),
    ]);

  const statusCount = (s: string) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;

  const stats = [
    { label: "Open items", value: openCount, href: "/tickets" },
    {
      label: user.role === "REQUESTER" ? "My items" : "Assigned to me",
      value: mine,
      href:
        user.role === "REQUESTER"
          ? "/tickets?mine=1"
          : "/tickets?assignee=me",
    },
    { label: "Urgent & open", value: urgentOpen, href: "/tickets?priority=URGENT" },
    { label: "In review", value: statusCount("IN_REVIEW"), href: "/tickets?status=IN_REVIEW" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link href="/tickets/new" className="btn">
          New item
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:border-zinc-700">
            <div className="text-3xl font-semibold">{s.value}</div>
            <div className="mt-1 text-sm text-zinc-400">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">By status</h2>
          <ul className="space-y-2 text-sm">
            {OPEN_STATUSES.concat(["DEPLOYED", "CLOSED"]).map((s) => (
              <li key={s} className="flex items-center justify-between">
                <Link href={`/tickets?status=${s}`}>
                  <Badge className={STATUS_STYLE[s]}>{STATUS_LABEL[s]}</Badge>
                </Link>
                <span className="tabular-nums text-zinc-400">
                  {statusCount(s)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">By type</h2>
          <ul className="space-y-2 text-sm">
            {(["REQUEST", "DEVELOPMENT", "BUG", "ENHANCEMENT", "TASK"] as const).map(
              (t) => (
                <li key={t} className="flex items-center justify-between">
                  <Link href={`/tickets?type=${t}`}>
                    <Badge className={TYPE_STYLE[t]}>{TYPE_LABEL[t]}</Badge>
                  </Link>
                  <span className="tabular-nums text-zinc-400">
                    {byType.find((r) => r.type === t)?._count._all ?? 0}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Recently updated</h2>
          <Link href="/tickets" className="text-sm text-brand hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-zinc-800">
          {recent.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tickets/${t.id}`}
                className="flex items-center gap-3 py-2 hover:text-white"
              >
                <span className="w-12 shrink-0 text-xs tabular-nums text-zinc-500">
                  #{t.id}
                </span>
                <Badge className={TYPE_STYLE[t.type]}>{TYPE_LABEL[t.type]}</Badge>
                <span className="flex-1 truncate">{t.subject}</span>
                {t.project ? (
                  <span className="hidden text-xs text-zinc-500 sm:inline">
                    {t.project.key}
                  </span>
                ) : null}
                <Badge className={PRIORITY_STYLE[t.priority]}>
                  {PRIORITY_LABEL[t.priority]}
                </Badge>
                <Badge className={STATUS_STYLE[t.status]}>
                  {STATUS_LABEL[t.status]}
                </Badge>
              </Link>
            </li>
          ))}
          {recent.length === 0 ? (
            <li className="py-4 text-sm text-zinc-500">No items yet.</li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
