"use client";

import { useQuery } from "@apollo/client/react"; // Targets /react explicitly to prevent type mismatches
import { useSearchParams } from "next/navigation";
import { GET_GAMES } from "@/graphql/queries";
import { Star, Calendar, Monitor, Users } from "lucide-react";
import { TableSkeleton } from "./table-skeleton";

// 1. TypeScript Interface Models for Network Integrity
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
    edges: {
      cursor: string;
      node: GameNode;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
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
  const searchParams = useSearchParams();
  
  // 2. Read state values straight from the URL parameters
  const search = searchParams.get("search") || "";
  const platformIds = searchParams.get("platforms")?.split(",")?.filter(Boolean) || [];
  const after = searchParams.get("after") || null;

  // 3. Execute the paginated GraphQL query
  const { data, loading, error } = useQuery<GetGamesData, GetGamesVariables>(GET_GAMES, {
    variables: {
      first: 20,
      after,
      search,
      platformIds,
    },
    notifyOnNetworkStatusChange: true, // Crucial for displaying accurate inline loading states
  });

  const gamesEdges = data?.games?.edges || [];

  // 4. Handle critical error layouts
  if (error) {
    return (
      <div className="w-full bg-red-950/20 border border-red-900 text-red-400 p-4 rounded-xl text-center text-sm">
        Failed to fetch records from the archive: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Responsive data table shell container */}
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
                    {/* Artwork Preview Column */}
                    <td className="p-4">
                      {node.coverUrlSmall ? (
                        <img 
                          src={node.coverUrlSmall} 
                          alt={node.title}
                          className="h-12 w-9 object-cover rounded shadow bg-slate-950 border border-slate-800 group-hover:scale-105 transition duration-150"
                          onError={(e) => {
                            // Fallback if the specific image hash triggers an error layout
                            (e.target as HTMLImageElement).style.display = 'none';
                            const sibling = (e.target as HTMLImageElement).nextElementSibling;
                            if (sibling) (sibling as HTMLDivElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      
                      <div 
                        className="h-12 w-9 rounded bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] text-slate-600 select-none font-bold"
                        style={{ display: node.coverUrlSmall ? 'none' : 'flex' }}
                      >
                        N/A
                      </div>
                    </td>

                    {/* Title & Developer Column */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-100 group-hover:text-indigo-400 transition duration-150">
                        {node.title}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="h-3 w-3" />
                        {developer}
                      </div>
                    </td>

                    {/* Release Year Column */}
                    <td className="p-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        {node.releaseYear || "Unknown"}
                      </div>
                    </td>

                    {/* Performance Rating Badge Column */}
                    <td className="p-4">
                      {node.rating ? (
                        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded w-fit text-xs font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400/20" />
                          {node.rating}%
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600 font-medium">Unrated</span>
                      )}
                    </td>

                    {/* Horizontal Platform Tags Column */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {node.platforms?.slice(0, 3).map((p) => (
                          <span key={p.id} className="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/50 flex items-center gap-1">
                            <Monitor className="h-2.5 w-2.5 text-slate-500" />
                            {p.name}
                          </span>
                        ))}
                        {node.platforms?.length > 3 && (
                          <span className="text-[10px] text-slate-500 font-bold px-1.5 align-middle self-center">
                            +{node.platforms.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}