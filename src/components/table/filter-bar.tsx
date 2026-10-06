"use client";

import React, { useState, useRef, useEffect } from "react";
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

interface FilterBarProps {
  onSearchSubmit: (searchText: string, platformIds: string[]) => void;
  activePlatformIds: string[];
}

export function FilterBar({ onSearchSubmit, activePlatformIds }: FilterBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🚨 STAGED STATE: Holds the chosen systems locally without firing network events
  const [stagedPlatforms, setStagedPlatforms] = useState<string[]>(activePlatformIds);

  const { data, loading } = useQuery<GetPlatformsData>(GET_PLATFORMS);
  const platforms = data?.platforms || [];

  // Reset local checkboxes if the master table parameters update independently
  useEffect(() => {
    setStagedPlatforms(activePlatformIds);
  }, [activePlatformIds]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚨 FORM SUBMISSION HANDLER: Bundles both variables up to the parent layout
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(inputValue.trim(), stagedPlatforms);
  };

  const togglePlatform = (id: string) => {
    let updated = [...stagedPlatforms];
    if (updated.includes(id)) {
      updated = updated.filter((pId) => pId !== id);
    } else {
      updated.push(id);
    }
    setStagedPlatforms(updated); // Updates checkboxes instantly on screen without hitting the API
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xl">
      
      {/* Primary Input Box Form Container */}
      <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search games archive (e.g., Zelda, Mario)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>
        
        {/* The single operational action anchor for both inputs */}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-md transition cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Platform Filter Dropdown Panel Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:border-slate-700 transition w-full sm:w-auto justify-between h-full"
        >
          <span className="flex items-center gap-2 text-slate-300">
            <SlidersHorizontal className="h-4 w-4" />
            Platforms
            {stagedPlatforms.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {stagedPlatforms.length}
              </span>
            )}
          </span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
            {loading ? (
              <div className="text-xs text-slate-500 p-3 text-center">Loading filters...</div>
            ) : platforms.length === 0 ? (
              <div className="text-xs text-slate-500 p-3 text-center">No platforms found.</div>
            ) : (
              platforms.map((platform) => {
                const isSelected = stagedPlatforms.includes(platform.id);
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
