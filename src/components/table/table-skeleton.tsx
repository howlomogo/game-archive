"use client";

export function TableSkeleton() {
  // Generate a loop of 5 fake rows to simulate the table loading state
  return (
    <>
      {Array.from({ length: 5 }).map((_, idx) => (
        <tr key={idx} className="border-b border-slate-800/50 bg-slate-900/20 animate-pulse">
          {/* 1. Cover Art Thumbnail Box */}
          <td className="p-4">
            <div className="h-12 w-9 rounded bg-slate-800/80 border border-slate-700/30" />
          </td>

          {/* 2. Title & Studio Text Bars */}
          <td className="p-4">
            <div className="h-3.5 bg-slate-800 rounded-sm w-48 mb-2" />
            <div className="h-2.5 bg-slate-800 rounded-sm w-24 opacity-60" />
          </td>

          {/* 3. Release Year Badge */}
          <td className="p-4">
            <div className="h-4 bg-slate-800 rounded-sm w-16" />
          </td>

          {/* 4. Score Rating Pill */}
          <td className="p-4">
            <div className="h-6 bg-slate-800 rounded-md w-14" />
          </td>

          {/* 5. Horizontal Platform Badges */}
          <td className="p-4">
            <div className="flex gap-1">
              <div className="h-5 bg-slate-800 rounded px-6" />
              <div className="h-5 bg-slate-800 rounded px-6 opacity-80" />
              <div className="h-5 bg-slate-800 rounded px-4 opacity-40" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}