"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client/react";
import { GET_GAMES } from "@/graphql/queries";
import { FilterBar } from "./filter-bar";
import { TableSkeleton } from "./table-skeleton";
import { 
  Star, 
  Calendar, 
  Monitor, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  Bookmark,
  ShieldCheck,
  Landmark
} from "lucide-react";

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
    edges: { node: GameNode }[];
    totalCount: number;
  };
}

interface GetGamesVariables {
  search: string;
  platformIds: string[];
  sortBy: string;
  sortOrder: string;
}

// ─── INTERNAL DATA TABLE INTERFACE ENGINE ───
function DataTableComponent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [activeSortBy, setActiveSortBy] = useState("rating");
  const [activeSortOrder, setActiveSortOrder] = useState("desc");

  const { data, loading, error } = useQuery<GetGamesData, GetGamesVariables>(GET_GAMES, {
    variables: {
      search: searchQuery,
      platformIds: selectedPlatforms.length > 0 ? selectedPlatforms : (undefined as any),
      sortBy: activeSortBy,
      sortOrder: activeSortOrder
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
  });

  const gamesEdges = data?.games?.edges || [];
  
  const PAGE_SIZE = 20;
  const startOffset = pageIndex * PAGE_SIZE;
  const endOffset = startOffset + PAGE_SIZE;
  const visibleEdges = gamesEdges.slice(startOffset, endOffset);

  const hasNextPage = gamesEdges.length > endOffset;
  const hasPreviousPage = pageIndex > 0;

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleSortChange = (field: string) => {
    setPageIndex(0);
    setExpandedRowId(null);
    if (activeSortBy === field) {
      setActiveSortOrder(activeSortOrder === "desc" ? "asc" : "desc");
    } else {
      setActiveSortBy(field);
      setActiveSortOrder("desc");
    }
  };

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
        activePlatformIds={selectedPlatforms}
        initialSortBy={activeSortBy}
        initialSortOrder={activeSortOrder}
        onSearchSubmit={(searchText, platformIds, sortBy, sortOrder) => {
          setPageIndex(0);
          setExpandedRowId(null);
          setSearchQuery(searchText);
          setSelectedPlatforms(platformIds);
          setActiveSortBy(sortBy);
          setActiveSortOrder(sortOrder);
        }}
      />

      <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-2xl">
        <table className="w-full text-left border-collapse min-w-[700px] table-fixed">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 text-xs font-semibold tracking-wider uppercase select-none">
              <th className="p-4 w-20">Cover</th>
              <th className="p-4 w-auto cursor-pointer hover:bg-slate-900/60 transition text-slate-300" onClick={() => handleSortChange("title")}>
                <div className="flex items-center gap-1.5">
                  Title & Studio
                  <ArrowUpDown className={`h-3 w-3 ${activeSortBy === "title" ? "text-indigo-400" : "text-slate-600"}`} />
                </div>
              </th>
              <th className="p-4 w-36 cursor-pointer hover:bg-slate-900/60 transition text-slate-300" onClick={() => handleSortChange("releaseYear")}>
                <div className="flex items-center gap-1.5">
                  Release Year
                  <ArrowUpDown className={`h-3 w-3 ${activeSortBy === "releaseYear" ? "text-indigo-400" : "text-slate-600"}`} />
                </div>
              </th>
              <th className="p-4 w-32 cursor-pointer hover:bg-slate-900/60 transition text-slate-300" onClick={() => handleSortChange("rating")}>
                <div className="flex items-center gap-1.5">
                  Rating
                  <ArrowUpDown className={`h-3 w-3 ${activeSortBy === "rating" ? "text-indigo-400" : "text-slate-600"}`} />
                </div>
              </th>
              <th className="p-4 w-52">Platforms</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
            {loading && visibleEdges.length === 0 ? (
              <TableSkeleton />
            ) : visibleEdges.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  No archive entries match the active filter configurations.
                </td>
              </tr>
            ) : (
              visibleEdges.map(({ node }) => {
                const developer = node.companies?.find((c) => c.role === "Developer")?.name || "Unknown Dev";
                const publisher = node.companies?.find((c) => c.role === "Publisher")?.name || "Unknown Pub";
                const isExpanded = expandedRowId === node.id;
                
                return (
                  <React.Fragment key={node.id}>
                    <tr 
                      className={`hover:bg-slate-950/40 group transition duration-150 cursor-pointer ${isExpanded ? 'bg-slate-950/20' : ''}`}
                      onClick={() => toggleRow(node.id)}
                    >
                      <td className="p-4">
                        {node.coverUrlSmall ? (
                          <img src={node.coverUrlSmall} alt={node.title} className="h-12 w-9 object-cover rounded shadow bg-slate-950 border border-slate-800" />
                        ) : (
                          <div className="h-12 w-9 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600 select-none">N/A</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition duration-150 truncate max-w-full" title={node.title}>
                          {node.title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-full">
                          <Users className="h-3 w-3 shrink-0" />
                          <span className="truncate">{developer}</span>
                        </div>
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
                      <td className="p-4 text-center">
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-950/50 border-y border-slate-800/80">
                        <td colSpan={6} className="p-6 md:p-8 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                          
                          <div className="flex flex-col md:flex-row gap-8 items-start pl-2">
                            <div className="w-40 h-56 flex-shrink-0 group relative rounded-xl overflow-hidden border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-slate-900 transition duration-300 hover:border-slate-500/80">
                              {node.coverUrlBig ? (
                                <img src={node.coverUrlBig} alt={node.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-slate-500 gap-2 bg-slate-950">
                                  <Bookmark className="h-6 w-6 text-slate-700" />No Cover
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-100" />
                            </div>

                            <div className="flex-1 flex flex-col gap-4">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase font-mono">Archive Entry Node</span>
                                <h3 className="text-xl font-bold text-slate-50 tracking-tight leading-none">{node.title}</h3>
                              </div>

                              <div className="flex flex-wrap gap-2.5 items-center mt-1">
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 font-mono shadow-sm">
                                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                  <span className="text-slate-500">Released:</span>
                                  <span className="text-slate-300 font-bold">{node.releaseYear || "Unknown"}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 shadow-sm">
                                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400/80" />
                                  <span className="text-slate-500 font-mono">Dev:</span>
                                  <span className="text-slate-200 font-semibold truncate max-w-[140px]" title={developer}>{developer}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 shadow-sm">
                                  <Landmark className="h-3.5 w-3.5 text-emerald-400/80" />
                                  <span className="text-slate-500 font-mono">Pub:</span>
                                  <span className="text-slate-200 font-semibold truncate max-w-[140px]" title={publisher}>{publisher}</span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">System Synopsis</h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-normal text-justify max-w-4xl bg-slate-950/20 border border-slate-800/40 p-4 rounded-xl shadow-inner">
                                  {node.summary || "No secondary narrative summary records matches this system index node."}
                                </p>
                              </div>

                              <div className="flex flex-col gap-2 mt-1">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Target Platform Deployment</h4>
                                <div className="flex flex-wrap gap-1.5 max-w-2xl">
                                  {node.platforms?.map((p: any) => (
                                    <span key={p.id} className="text-[11px] font-medium bg-slate-900 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800/60 shadow-sm flex items-center gap-1.5 hover:border-slate-700 transition">
                                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {gamesEdges.length > 0 && (() => {
        const currentStart = startOffset + 1;
        const currentEnd = Math.min(gamesEdges.length, endOffset);
        
        let totalCountLabel = "5,000+";
        if (searchQuery || selectedPlatforms.length > 0) {
          totalCountLabel = gamesEdges.length.toString();
        }

        return (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl shadow-lg mt-2 gap-3 w-full">
            <div className="text-xs text-slate-400 font-medium font-mono">
              Showing {currentStart}–{currentEnd} of {totalCountLabel} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setPageIndex(Math.max(0, pageIndex - 1));
                  setExpandedRowId(null);
                }}
                disabled={!hasPreviousPage || loading}
                className="flex items-center gap-1 bg-slate-950 border border-slate-200 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              
              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-400 font-mono select-none">
                Page {pageIndex + 1}
              </div>

              <button
                onClick={() => {
                  setPageIndex(pageIndex + 1);
                  setExpandedRowId(null);
                }}
                disabled={!hasNextPage || loading}
                className="flex items-center gap-1 bg-slate-950 border border-slate-200 hover:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
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

// ─── DYNAMIC EXPORT WRAPPER ───
import { StandaloneTableSkeleton } from "./table-skeleton";

export const DataTable = dynamic(() => Promise.resolve(DataTableComponent), {
  ssr: false,
  loading: () => <StandaloneTableSkeleton /> // ✅ Uses divs instead of <tr> tags!
});