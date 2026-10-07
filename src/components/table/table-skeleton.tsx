export function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx} className="border-b border-slate-800/50 bg-slate-900/20 animate-pulse">
          <td className="p-4 w-20">
            <div className="h-12 w-9 rounded bg-slate-800/80 border border-slate-700/40" />
          </td>
          <td className="p-4 w-auto">
            <div className="h-4 w-48 rounded bg-slate-800/80 mb-2" />
            <div className="h-3 w-32 rounded bg-slate-800/40" />
          </td>
          <td className="p-4 w-36">
            <div className="h-4 w-16 rounded bg-slate-800/60" />
          </td>
          <td className="p-4 w-32">
            <div className="h-6 w-14 rounded bg-slate-800/80" />
          </td>
          <td className="p-4 w-52">
            <div className="flex gap-1.5">
              <div className="h-5 w-16 rounded bg-slate-800/60" />
              <div className="h-5 w-16 rounded bg-slate-800/60" />
            </div>
          </td>
          <td className="p-4 w-12">
            <div className="h-4 w-4 rounded bg-slate-800/40 mx-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function StandaloneTableSkeleton() {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-4 animate-pulse space-y-4">
      <div className="h-8 w-1/4 rounded bg-slate-800/60" />
      <div className="h-10 w-full rounded bg-slate-800/30" />
      <div className="h-12 w-full rounded bg-slate-800/20" />
      <div className="h-12 w-full rounded bg-slate-800/20" />
      <div className="h-12 w-full rounded bg-slate-800/20" />
    </div>
  );
}
