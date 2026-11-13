/** Shared result shape for Server Actions used with useActionState. */
export type ActionState = { error?: string; ok?: boolean };

export const EMPTY_STATE: ActionState = {};
