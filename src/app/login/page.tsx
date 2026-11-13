import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";
import TechTraderMark from "@/components/TechTraderMark";

export default async function LoginPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">AdcommTV DevDesk</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Salesforce projects, requests &amp; development
          </p>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-600">
            Powered by <TechTraderMark className="h-5 w-auto" />
          </p>
        </div>
        <div className="card">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500">
          Trouble signing in? Contact IT.
        </p>
      </div>
    </main>
  );
}
