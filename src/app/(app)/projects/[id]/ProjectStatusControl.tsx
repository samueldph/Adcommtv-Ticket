"use client";

import { useActionState } from "react";
import { updateProjectStatus } from "../actions";
import { PROJECT_STATUSES, PROJECT_STATUS_LABEL } from "@/lib/labels";
import { EMPTY_STATE } from "@/lib/forms";
import type { ProjectStatus } from "@prisma/client";

const initial = EMPTY_STATE;

export default function ProjectStatusControl({
  id,
  status,
}: {
  id: string;
  status: ProjectStatus;
}) {
  const [state, formAction, pending] = useActionState(
    updateProjectStatus,
    initial
  );

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex-1">
        <label className="label">Project status</label>
        <select name="status" defaultValue={status} className="select">
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Saving…" : "Update"}
      </button>
      {state?.ok ? (
        <span className="pb-2 text-sm text-emerald-400">Saved</span>
      ) : null}
    </form>
  );
}
