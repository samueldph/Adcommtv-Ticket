"use client";

import { useActionState } from "react";
import { createProject } from "../actions";
import { EMPTY_STATE } from "@/lib/forms";

const initial = EMPTY_STATE;

export default function NewProjectForm({
  leads,
}: {
  leads: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createProject, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="key">
            Key
          </label>
          <input
            id="key"
            name="key"
            className="input uppercase"
            placeholder="SFDC"
            maxLength={10}
            required
          />
        </div>
        <div className="col-span-2">
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" className="input" required />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="textarea"
        />
      </div>

      <div>
        <label className="label" htmlFor="leadId">
          Project lead
        </label>
        <select id="leadId" name="leadId" className="select" defaultValue="">
          <option value="">— None —</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </div>

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Creating…" : "Create project"}
      </button>
    </form>
  );
}
