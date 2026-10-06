"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_PLATFORMS } from "@/graphql/queries";
import { Search, SlidersHorizontal, Check } from "lucide-react";

interface GetPlatformsData {
  platforms: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Local input state for smooth, un-lagged typing
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Fetch real platform filters from your GraphQL server
  const { data, loading } = useQuery<GetPlatformsData>(GET_PLATFORMS);
  const platforms = data?.platforms || [];

  // Parse active platform IDs from the URL string
  const activePlatforms = searchParams.get("platforms")?.split(",")?.filter(Boolean) || [];

  // 3. Debounced Search Effect (Fixed to prevent infinite loops)
  useEffect(() => {
    // If the input matches what is already in the URL bar, skip updating entirely
    const currentUrlSearch = searchParams.get("search") || "";
    if (searchTerm === currentUrlSearch) return;

    const handler = setTimeout(() => {
      const params = new URLSearchParams(window.location.search); // Use window directly to avoid reference loops
      
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.delete("after"); // Reset pagination position on search change
      
      // Use shallow routing natively
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, pathname, router]); // ◄ REMOVED searchParams from dependency array!

  // 4. Handle closing dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. Toggle Platform Filter in URL
  const togglePlatform = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let current = [...activePlatforms];

    if (current.includes(id)) {
      current = current.filter((pId) => pId !== id);
    } else {
      current.push(id);
    }

    if (current.length > 0) {
      params.set("platforms", current.join(","));
    } else {
      params.delete("platforms");
    }
    params.delete("after"); // Reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search games archive..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      {/* Platform Filter Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-700 transition w-full sm:w-auto justify-between"
        >
          <span className="flex items-center gap-2 text-slate-300">
            <SlidersHorizontal className="h-4 w-4" />
            Platforms
            {activePlatforms.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {activePlatforms.length}
              </span>
            )}
          </span>
        </button>

        {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                {loading ? (
                <div className="flex flex-col gap-1.5 p-1 animate-pulse">
                    {Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                        key={idx} 
                        className="w-full h-8 bg-slate-900 border border-slate-800/40 rounded-md flex items-center justify-between px-3"
                    >
                        <div 
                        className="h-2.5 bg-slate-800 rounded-sm"
                        style={{ width: `${[50, 75, 40, 65, 80, 55][idx % 6]}%` }} 
                        />
                        <div className="h-3 w-3 bg-slate-800 rounded-sm opacity-40" />
                    </div>
                    ))}
                </div>
                ) : platforms.length === 0 ? (
                <div className="text-xs text-slate-500 p-3 text-center">No platforms found.</div>
                ) : (
                platforms.map((platform: any) => {
                    const isSelected = activePlatforms.includes(platform.id);
                    return (
                    <button
                        key={platform.id}
                        onClick={() => togglePlatform(platform.id)}
                        className="flex items-center justify-between w-full text-left px-3 py-2 text-xs rounded-md text-slate-300 hover:bg-slate-900 transition mb-0.5"
                    >
                        <span>{platform.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-indigo-500" />}
                    </button>
                    );
                })
                )}
            </div>
        )}
      </div>
    </div>
  );
}
