"use client";

import { useActionState } from "react";
import { updateTicket } from "../actions";
import {
  STATUSES,
  PRIORITIES,
  DEPLOY_STATUSES,
  STATUS_LABEL,
  PRIORITY_LABEL,
  DEPLOY_LABEL,
} from "@/lib/labels";
import { EMPTY_STATE } from "@/lib/forms";
import type { TicketStatus, Priority, DeployStatus } from "@prisma/client";

const initial = EMPTY_STATE;

export default function TicketControls({
  ticketId,
  status,
  priority,
  assigneeId,
  deployStatus,
  projectId,
  agents,
  projects,
}: {
  ticketId: number;
  status: TicketStatus;
  priority: Priority;
  assigneeId: string | null;
  deployStatus: DeployStatus;
  projectId: string | null;
  agents: { id: string; name: string }[];
  projects: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(updateTicket, initial);

  return (
    <form action={formAction} className="card space-y-3">
      <h2 className="text-sm font-medium text-zinc-300">Manage</h2>
      <input type="hidden" name="ticketId" value={ticketId} />

      <div>
        <label className="label">Status</label>
        <select name="status" defaultValue={status} className="select">
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Priority</label>
        <select name="priority" defaultValue={priority} className="select">
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Assignee</label>
        <select name="assigneeId" defaultValue={assigneeId ?? ""} className="select">
          <option value="">Unassigned</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Deploy status</label>
        <select
          name="deployStatus"
          defaultValue={deployStatus}
          className="select"
        >
          {DEPLOY_STATUSES.map((d) => (
            <option key={d} value={d}>
              {DEPLOY_LABEL[d]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Project</label>
        <select name="projectId" defaultValue={projectId ?? ""} className="select">
          <option value="">— None —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
      {state?.ok ? <p className="text-sm text-emerald-400">Saved.</p> : null}

      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
