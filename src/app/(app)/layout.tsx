import { requireUser } from "@/lib/session";
import Nav from "@/components/Nav";
import TechTraderMark from "@/components/TechTraderMark";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="min-h-screen">
      <Nav user={user} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="mx-auto flex max-w-6xl items-center justify-center gap-2 px-4 py-6 text-center text-xs text-zinc-600">
        AdcommTV DevDesk · Powered by{" "}
        <TechTraderMark className="h-4 w-auto" />
      </footer>
    </div>
  );
}
