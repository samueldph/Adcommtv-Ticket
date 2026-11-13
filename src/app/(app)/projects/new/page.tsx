import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage() {
  await requireRole(["ADMIN", "AGENT"]);
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "AGENT"] }, active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-xl font-semibold">New project</h1>
      <div className="card">
        <NewProjectForm
          leads={staff.map((s) => ({ id: s.id, name: s.name }))}
        />
      </div>
    </div>
  );
}
