"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_GAMES } from "@/graphql/queries";
import { FilterBar } from "./filter-bar";
import { TableSkeleton } from "./table-skeleton";
import { Star, Calendar, Monitor, Users, ChevronLeft, ChevronRight } from "lucide-react";

interface GameNode {
  id: string;
  title: string;
  releaseYear: number | null;
  summary: string;
  coverUrlSmall: string | null;
  coverUrlBig: string | null;
  rating: number | null;
  platforms: { id: string; name: string }[];
  companies: { id: string; name: string; role: string }[];
}

interface GetGamesData {
  games: {
    edges: { cursor: string; node: GameNode }[];
    pageInfo: { 
      hasNextPage: boolean; 
      hasPreviousPage: boolean; 
      startCursor: string | null; 
      endCursor: string | null;
      offset: number;
    };
    totalCount: number;
  };
}

interface GetGamesVariables {
  first: number;
  after: string | null;
  search: string;
  platformIds: string[];
}

export function DataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [activeCursor, setActiveCursor] = useState<string | null>(null);

  const { data, loading, error } = useQuery<GetGamesData, GetGamesVariables>(GET_GAMES, {
    variables: {
      first: 20,
      after: activeCursor,
      search: searchQuery,
      platformIds: selectedPlatforms.length > 0 ? selectedPlatforms : (undefined as any),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  const gamesEdges = data?.games?.edges || [];
  const pageInfo = data?.games?.pageInfo; // ◄ Grab pagination indicators

  if (error) {
    return (
      <div className="w-full bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-xl text-center text-sm">
        Failed to fetch records from the archive: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <FilterBar 
        onSearchSubmit={(value) => {
          setSearchQuery(value); 
          setActiveCursor(null);
        }}
        onPlatformToggle={(ids) => {
          setSelectedPlatforms(ids);
          setActiveCursor(null);
        }}
        activePlatformIds={selectedPlatforms}
      />

      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-xs font-semibold tracking-wider uppercase">
              <th className="p-4 w-16">Cover</th>
              <th className="p-4">Title & Studio</th>
              <th className="p-4 w-32">Release Year</th>
              <th className="p-4 w-36">Rating</th>
              <th className="p-4">Platforms</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
            {loading && gamesEdges.length === 0 ? (
              <TableSkeleton />
            ) : gamesEdges.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-medium">
                  No archive entries match the active filter configurations.
                </td>
              </tr>
            ) : (
              gamesEdges.map(({ node }) => {
                const developer = node.companies?.find((c) => c.role === "Developer")?.name || "Unknown Dev";
                
                return (
                  <tr key={node.id} className="hover:bg-slate-950/50 group transition duration-150">
                    <td className="p-4">
                      {node.coverUrlSmall ? (
                        <img src={node.coverUrlSmall} alt={node.title} className="h-12 w-9 object-cover rounded shadow bg-slate-950 border border-slate-800" />
                      ) : (
                        <div className="h-12 w-9 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600 select-none">N/A</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition duration-150">{node.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Users className="h-3 w-3" />{developer}</div>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" />{node.releaseYear || "Unknown"}</div>
                    </td>
                    <td className="p-4">
                      {node.rating ? (
                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded w-fit text-xs font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400/20" />{node.rating}%
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium">Unrated</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {node.platforms?.slice(0, 3).map((p) => (
                          <span key={p.id} className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/50 flex items-center gap-1">
                            <Monitor className="h-2.5 w-2.5 text-slate-500" />{p.name}
                          </span>
                        ))}
                        {node.platforms?.length > 3 && <span className="text-[10px] text-slate-500 font-bold px-1.5 align-middle self-center">+{node.platforms.length - 3} more</span>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── NUMBERED PAGINATION FOOTER CONTROLS ─── */}
      {gamesEdges.length > 0 && pageInfo && (() => {
        // Calculate the human-readable page positions dynamically using our server offset numbers
        const currentStart = pageInfo.offset + 1;
        const currentEnd = pageInfo.offset + gamesEdges.length;
        
        return (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl shadow-lg mt-2 gap-3 w-full">
            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-200 font-bold font-mono">{currentStart}–{currentEnd}</span> of{" "}
              <span className="text-slate-200 font-bold font-mono">
                {searchQuery || selectedPlatforms.length > 0 ? (
                  // 🚨 THE RESOLUTION: If another page exists ahead, add a '+' to indicate an open boundary
                  pageInfo.hasNextPage ? `${currentEnd}+` : `${data?.games?.totalCount || currentEnd}`
                ) : (
                  "5,000+"
                )}
              </span>{" "}
              results
            </div>
            
            {/* Navigational Trigger Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const prevOffset = Math.max(0, pageInfo.offset - 20);
                  setActiveCursor(prevOffset === 0 ? null : Buffer.from(prevOffset.toString()).toString("base64"));
                }}
                disabled={!pageInfo.hasPreviousPage || loading}
                className="flex items-center gap-1 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              
              {/* Quick Page Indicator Badge */}
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-400 font-mono select-none">
                Page {Math.floor(pageInfo.offset / 20) + 1}
              </div>

              <button
                onClick={() => {
                  if (pageInfo.endCursor) {
                    setActiveCursor(pageInfo.endCursor);
                  }
                }}
                disabled={!pageInfo.hasNextPage || loading}
                className="flex items-center gap-1 bg-slate-950 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
