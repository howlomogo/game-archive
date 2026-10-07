"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_PLATFORMS } from "@/graphql/queries";
import { Search, SlidersHorizontal, Check, ArrowUpDown } from "lucide-react";

interface GetPlatformsData {
  platforms: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface FilterBarProps {
  activePlatformIds: string[];
  initialSortBy: string;
  initialSortOrder: string;
  onSearchSubmit: (searchText: string, platformIds: string[], sortBy: string, sortOrder: string) => void;
}

export function FilterBar({ activePlatformIds, initialSortBy, initialSortOrder, onSearchSubmit }: FilterBarProps) {
  const searchParams = useSearchParams();

  // 🚨 FIXED INPUT INITIALIZATION: Read directly from active URL params on mount
  const [inputValue, setInputValue] = useState(searchParams.get("search") || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(activePlatformIds);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const [isPlatformOpen, setIsPlatformOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const platformRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const { data, loading } = useQuery<GetPlatformsData>(GET_PLATFORMS);
  const platforms = data?.platforms || [];

  // 🚨 SYNC CONTROL LOOP: Keeps internal UI states synchronized with URL path adjustments
  useEffect(() => {
    setInputValue(searchParams.get("search") || "");
    setSelectedPlatforms(activePlatformIds);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [searchParams, activePlatformIds, initialSortBy, initialSortOrder]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (platformRef.current && !platformRef.current.contains(event.target as Node)) {
        setIsPlatformOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(inputValue, selectedPlatforms, sortBy, sortOrder);
  };

  const togglePlatform = (id: string) => {
    const updated = selectedPlatforms.includes(id)
      ? selectedPlatforms.filter((pId) => pId !== id)
      : [...selectedPlatforms, id];
    setSelectedPlatforms(updated);
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full">
        
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search game titles..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Platforms Selector Panel */}
          <div className="relative" ref={platformRef}>
            <button
              type="button"
              onClick={() => {
                setIsPlatformOpen(!isPlatformOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-700 text-slate-300 transition"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Platforms
              {selectedPlatforms.length > 0 && (
                <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {selectedPlatforms.length}
                </span>
              )}
            </button>

            {isPlatformOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-xs text-slate-500 p-3 text-center">Loading filters...</div>
                ) : (
                  platforms.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <button
                        key={platform.id}
                        type="button"
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

          {/* Sorting Dropdown Control Panel */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsPlatformOpen(false);
              }}
              className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-700 text-slate-300 transition"
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </button>

            {isSortOpen && (
              <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-50 p-2 text-xs text-slate-300">
                <div className="px-2 py-1.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Sort By</div>
                <button
                  type="button"
                  onClick={() => setSortBy("rating")}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md mb-1 hover:bg-slate-900 ${sortBy === "rating" ? "text-indigo-400 font-medium" : ""}`}
                >
                  <span>Top Rated</span>
                  {sortBy === "rating" && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("title")}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md mb-1 hover:bg-slate-900 ${sortBy === "title" ? "text-indigo-400 font-medium" : ""}`}
                >
                  <span>Game Title</span>
                  {sortBy === "title" && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("releaseYear")}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md mb-2 hover:bg-slate-900 ${sortBy === "releaseYear" ? "text-indigo-400 font-medium" : ""}`}
                >
                  <span>Release Year</span>
                  {sortBy === "releaseYear" && <Check className="h-3.5 w-3.5" />}
                </button>

                <div className="border-t border-slate-800 my-1" />

                <div className="px-2 py-1.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Order</div>
                <button
                  type="button"
                  onClick={() => setSortOrder("desc")}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md mb-1 hover:bg-slate-900 ${sortOrder === "desc" ? "text-indigo-400 font-medium" : ""}`}
                >
                  <span>Descending</span>
                  {sortOrder === "desc" && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder("asc")}
                  className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-md hover:bg-slate-900 ${sortOrder === "asc" ? "text-indigo-400 font-medium" : ""}`}
                >
                  <span>Ascending</span>
                  {sortOrder === "asc" && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Master Submission Action Trigger */}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}
