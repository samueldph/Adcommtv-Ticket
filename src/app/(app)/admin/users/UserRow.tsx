"use client";

import { useActionState } from "react";
import { setRole, toggleActive } from "./actions";
import { ROLE_LABEL } from "@/lib/labels";
import { EMPTY_STATE } from "@/lib/forms";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["REQUESTER", "AGENT", "ADMIN"];

export default function UserRow({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: Role; active: boolean };
  isSelf: boolean;
}) {
  const [, roleAction] = useActionState(setRole, EMPTY_STATE);
  const [, activeAction] = useActionState(toggleActive, EMPTY_STATE);

  return (
    <tr className="hover:bg-zinc-800/40">
      <td className="px-3 py-2 font-medium">
        {user.name}
        {isSelf ? <span className="ml-2 text-xs text-zinc-500">(you)</span> : null}
      </td>
      <td className="px-3 py-2 text-zinc-400">{user.email}</td>
      <td className="px-3 py-2">
        {isSelf ? (
          <span className="text-zinc-400">{ROLE_LABEL[user.role]}</span>
        ) : (
          <form action={roleAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={user.id} />
            <select
              name="role"
              defaultValue={user.role}
              className="select !w-auto !py-1"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
            <button type="submit" className="btn-ghost !py-1 text-xs">
              Set
            </button>
          </form>
        )}
      </td>
      <td className="px-3 py-2">
        <span
          className={`badge ${
            user.active
              ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
              : "bg-zinc-700/40 text-zinc-400 ring-zinc-600/30"
          }`}
        >
          {user.active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-3 py-2 text-right">
        {isSelf ? null : (
          <form action={activeAction}>
            <input type="hidden" name="id" value={user.id} />
            <button type="submit" className="btn-ghost !py-1 text-xs">
              {user.active ? "Deactivate" : "Activate"}
            </button>
          </form>
        )}
      </td>
    </tr>
  );
}
