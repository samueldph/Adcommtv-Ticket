import Link from "next/link";
import { notFound } from "next/navigation";
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
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_STYLE,
  OPEN_STATUSES,
} from "@/lib/labels";
import ProjectStatusControl from "./ProjectStatusControl";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      lead: true,
      tickets: {
        orderBy: [{ status: "asc" }, { priority: "desc" }, { updatedAt: "desc" }],
        include: { assignee: true },
      },
    },
  });
  if (!project) notFound();

  const staff = isStaff(user.role);
  const open = project.tickets.filter((t) =>
    OPEN_STATUSES.includes(t.status)
  );
  const done = project.tickets.filter(
    (t) => !OPEN_STATUSES.includes(t.status)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/projects" className="hover:text-zinc-300">
          Projects
        </Link>
        <span>/</span>
        <span className="font-mono">{project.key}</span>
      </div>

      <div className="card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{project.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {project.lead ? `Lead: ${project.lead.name} · ` : ""}
              {open.length} open · {project.tickets.length} total
            </p>
            {project.description ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-200">
                {project.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={PROJECT_STATUS_STYLE[project.status]}>
              {PROJECT_STATUS_LABEL[project.status]}
            </Badge>
            <Link
              href={`/tickets/new?project=${project.id}`}
              className="btn-ghost text-xs"
            >
              Add item
            </Link>
          </div>
        </div>
        {staff ? (
          <div className="mt-4 border-t border-zinc-800 pt-4">
            <ProjectStatusControl id={project.id} status={project.status} />
          </div>
        ) : null}
      </div>

      <Section title={`Open (${open.length})`} tickets={open} />
      <Section title={`Done (${done.length})`} tickets={done} muted />
    </div>
  );
}

function Section({
  title,
  tickets,
  muted,
}: {
  title: string;
  tickets: {
    id: number;
    subject: string;
    type: keyof typeof TYPE_LABEL;
    status: keyof typeof STATUS_LABEL;
    priority: keyof typeof PRIORITY_LABEL;
    assignee: { name: string } | null;
  }[];
  muted?: boolean;
}) {
  return (
    <div className="card">
      <h2 className={`mb-3 text-sm font-medium ${muted ? "text-zinc-500" : "text-zinc-300"}`}>
        {title}
      </h2>
      <ul className="divide-y divide-zinc-800">
        {tickets.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tickets/${t.id}`}
              className="flex items-center gap-3 py-2 text-sm hover:text-white"
            >
              <span className="w-12 shrink-0 tabular-nums text-zinc-500">
                #{t.id}
              </span>
              <Badge className={TYPE_STYLE[t.type]}>{TYPE_LABEL[t.type]}</Badge>
              <span className="flex-1 truncate">{t.subject}</span>
              <span className="hidden text-xs text-zinc-500 sm:inline">
                {t.assignee?.name ?? "Unassigned"}
              </span>
              <Badge className={PRIORITY_STYLE[t.priority]}>
                {PRIORITY_LABEL[t.priority]}
              </Badge>
              <Badge className={STATUS_STYLE[t.status]}>
                {STATUS_LABEL[t.status]}
              </Badge>
            </Link>
          </li>
        ))}
        {tickets.length === 0 ? (
          <li className="py-3 text-sm text-zinc-500">Nothing here.</li>
        ) : null}
      </ul>
    </div>
  );
}
