import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/labels";
import { logoutAction } from "@/app/(app)/actions";

export default function Nav({ user }: { user: SessionUser }) {
  return (
    <header className="border-b border-zinc-800 bg-zinc-900/60">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/dashboard" className="font-semibold">
          AdcommTV <span className="text-brand">DevDesk</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-300">
          <Link href="/dashboard" className="hover:text-white">
            Dashboard
          </Link>
          <Link href="/tickets" className="hover:text-white">
            Work items
          </Link>
          <Link href="/projects" className="hover:text-white">
            Projects
          </Link>
          <Link href="/tickets/new" className="hover:text-white">
            New
          </Link>
          {user.role === "ADMIN" ? (
            <Link href="/admin/users" className="hover:text-white">
              Users
            </Link>
          ) : null}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="hidden text-zinc-400 sm:inline">
            {user.name}
            <span className="ml-2 badge bg-zinc-700/40 text-zinc-300 ring-zinc-600/30">
              {ROLE_LABEL[user.role]}
            </span>
          </span>
          <form action={logoutAction}>
            <button className="btn-ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
