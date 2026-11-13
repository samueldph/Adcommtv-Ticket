import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import NewTicketForm from "./NewTicketForm";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  await requireUser();
  const sp = await searchParams;
  const projects = await prisma.project.findMany({
    where: { status: { in: ["PLANNING", "ACTIVE", "ON_HOLD"] } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-semibold">New work item</h1>
      <div className="card">
        <NewTicketForm
          defaultProjectId={sp.project ?? ""}
          projects={projects.map((p) => ({
            id: p.id,
            label: `${p.key} — ${p.name}`,
          }))}
        />
      </div>
    </div>
  );
}
