import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, isStaff } from "@/lib/session";
import { Badge } from "@/components/Badge";
import {
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_STYLE,
  OPEN_STATUSES,
} from "@/lib/labels";

export default async function ProjectsPage() {
  const user = await requireUser();
  const staff = isStaff(user.role);

  const projects = await prisma.project.findMany({
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      lead: true,
      _count: { select: { tickets: true } },
    },
  });

  // Open-item counts per project in one query.
  const openByProject = await prisma.ticket.groupBy({
    by: ["projectId"],
    where: { status: { in: OPEN_STATUSES } },
    _count: { _all: true },
  });
  const openCount = (pid: string) =>
    openByProject.find((r) => r.projectId === pid)?._count._all ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        {staff ? (
          <Link href="/projects/new" className="btn">
            New project
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="card hover:border-zinc-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-zinc-500">{p.key}</span>
                <span className="font-medium">{p.name}</span>
              </div>
              <Badge className={PROJECT_STATUS_STYLE[p.status]}>
                {PROJECT_STATUS_LABEL[p.status]}
              </Badge>
            </div>
            {p.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                {p.description}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
              <span>{openCount(p.id)} open</span>
              <span>{p._count.tickets} total</span>
              {p.lead ? <span>Lead: {p.lead.name}</span> : null}
            </div>
          </Link>
        ))}
        {projects.length === 0 ? (
          <p className="text-sm text-zinc-500">No projects yet.</p>
        ) : null}
      </div>
    </div>
  );
}
