"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "./actions";
import { ROLE_LABEL } from "@/lib/labels";
import { EMPTY_STATE } from "@/lib/forms";

const initial = EMPTY_STATE;
const ROLES = ["REQUESTER", "AGENT", "ADMIN"] as const;

export default function NewUserForm() {
  const [state, formAction, pending] = useActionState(createUser, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form
      action={formAction}
      ref={ref}
      className="grid grid-cols-1 gap-3 sm:grid-cols-5"
    >
      <input name="name" className="input" placeholder="Full name" required />
      <input
        name="email"
        type="email"
        className="input"
        placeholder="email@adcommtv.com"
        required
      />
      <select name="role" className="select" defaultValue="REQUESTER">
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABEL[r]}
          </option>
        ))}
      </select>
      <input
        name="password"
        type="text"
        className="input"
        placeholder="Temp password"
        required
      />
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Adding…" : "Add user"}
      </button>
      {state?.error ? (
        <p className="text-sm text-red-400 sm:col-span-5">{state.error}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-sm text-emerald-400 sm:col-span-5">User created.</p>
      ) : null}
    </form>
  );
}
