import { DataTable } from "@/components/table/data-table";
import { FilterBar } from "@/components/table/filter-bar";
import { Gamepad2 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen w-full px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Dashboard Top Header Title Bar */}
      <header className="flex items-center gap-3 border-b border-slate-800 pb-6">
        <div className="bg-indigo-600/10 border border-indigo-500/30 p-2.5 rounded-xl text-indigo-400">
          <Gamepad2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
            Video Games Archive Ledger
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            A real-time data grid exploring historical media records powered by an internal IGDB GraphQL layer.
          </p>
        </div>
      </header>

      {/* Control Input & Filtering Options Layer */}
      <FilterBar />

      {/* Main Relational Content Grid View */}
      <DataTable />
      
    </main>
  );
}