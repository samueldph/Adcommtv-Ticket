"use client";

import { useActionState } from "react";
import { createTicket } from "../actions";
import {
  WORK_TYPES,
  PRIORITIES,
  SF_COMPONENTS,
  TYPE_LABEL,
  PRIORITY_LABEL,
  SF_COMPONENT_LABEL,
} from "@/lib/labels";
import { EMPTY_STATE } from "@/lib/forms";

const initial = EMPTY_STATE;

export default function NewTicketForm({
  projects,
  defaultProjectId = "",
}: {
  projects: { id: string; label: string }[];
  defaultProjectId?: string;
}) {
  const [state, formAction, pending] = useActionState(createTicket, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="subject">
          Subject
        </label>
        <input id="subject" name="subject" className="input" required />
      </div>

      <div>
        <label className="label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          className="textarea"
          placeholder="What needs to happen, acceptance criteria, links to the Salesforce org…"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="type">
            Type
          </label>
          <select id="type" name="type" className="select" defaultValue="REQUEST">
            {WORK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="select"
            defaultValue="MEDIUM"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="projectId">
          Project
        </label>
        <select
          id="projectId"
          name="projectId"
          className="select"
          defaultValue={defaultProjectId}
        >
          <option value="">— None —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="rounded-md border border-zinc-800 p-3">
        <legend className="px-1 text-xs uppercase tracking-wide text-zinc-500">
          Salesforce context
        </legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="sfComponent">
              Component
            </label>
            <select
              id="sfComponent"
              name="sfComponent"
              className="select"
              defaultValue=""
            >
              <option value="">— N/A —</option>
              {SF_COMPONENTS.map((c) => (
                <option key={c} value={c}>
                  {SF_COMPONENT_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sfEnvironment">
              Environment
            </label>
            <input
              id="sfEnvironment"
              name="sfEnvironment"
              className="input"
              placeholder="e.g. Full sandbox, Production"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <label className="label" htmlFor="dueDate">
          Due date (optional)
        </label>
        <input id="dueDate" name="dueDate" type="date" className="input" />
      </div>

      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Creating…" : "Create item"}
      </button>
    </form>
  );
}
