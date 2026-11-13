"use client";

import { useActionState, useEffect, useRef } from "react";
import { addComment } from "../actions";
import { EMPTY_STATE } from "@/lib/forms";

const initial = EMPTY_STATE;

export default function CommentForm({
  ticketId,
  canInternal,
}: {
  ticketId: number;
  canInternal: boolean;
}) {
  const [state, formAction, pending] = useActionState(addComment, initial);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form action={formAction} ref={ref} className="space-y-2">
      <input type="hidden" name="ticketId" value={ticketId} />
      <textarea
        name="body"
        rows={3}
        className="textarea"
        placeholder="Add a comment…"
        required
      />
      <div className="flex items-center justify-between">
        {canInternal ? (
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input type="checkbox" name="internal" className="accent-brand" />
            Internal note (hidden from requester)
          </label>
        ) : (
          <span />
        )}
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Posting…" : "Comment"}
        </button>
      </div>
      {state?.error ? (
        <p className="text-sm text-red-400">{state.error}</p>
      ) : null}
    </form>
  );
}
