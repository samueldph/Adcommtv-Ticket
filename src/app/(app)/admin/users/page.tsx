import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/labels";
import NewUserForm from "./NewUserForm";
import UserRow from "./UserRow";

export default async function AdminUsersPage() {
  const me = await requireRole(["ADMIN"]);
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Users</h1>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={{
                  id: u.id,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  active: u.active,
                }}
                isSelf={u.id === me.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Add a user</h2>
        <NewUserForm />
      </div>

      <p className="text-xs text-zinc-500">
        Roles — {ROLE_LABEL.ADMIN}: full control. {ROLE_LABEL.AGENT}: delivery
        team (work/assign/resolve any item, manage projects).{" "}
        {ROLE_LABEL.REQUESTER}: raise requests, see only their own.
      </p>
    </div>
  );
}
