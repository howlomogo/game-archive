import { DataTable } from "@/components/table/data-table";

export default function Home() {
  return (
    <main className="min-h-screen w-full px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-6 bg-slate-950 text-slate-100">
      <header className="flex flex-col gap-1 border-b border-slate-800 pb-6">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Game Archive Explorer
        </h1>
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Search, filter, and explore a massive collection of games from the IGDB database
        </p>
      </header>

      <div className="w-full flex-1">
        <DataTable />
      </div>
    </main>
  );
}
