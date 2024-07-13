"use client";

import { useState } from "react";

import { create } from "zustand";

import Icon from "@/components/ui/Icons";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";

interface SearchStore {
  search: string;
  setSearch: (search: string) => void;
}

export const searchStore = create<SearchStore>((set) => ({
  search: "",
  setSearch: (search: string) => set({ search }),
}));

function Searcher() {
  const [iconClick, setIconClick] = useState(false);
  const { search, setSearch } = searchStore((state) => state);

  function toggleSearcher() {
    setIconClick(!iconClick);
  }

  return (
    <Stack classes="my-2 min-h-9 w-full overflow-hidden" alignItems="center" justifyContent="end">
      {iconClick ? (
        <Input
          role="search"
          name="search"
          type="search"
          aria-label="Search taxes"
          variant="underline"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          classes="min-h-5 w-full animate-grow-in rounded-md p-1 shadow-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
        />
      ) : null}
      <div
        className="z-10 flex size-8 cursor-pointer items-center justify-center self-end rounded-full bg-gradient-to-tr from-slate-100 to-slate-200 p-1 transition-all"
        onClick={() => toggleSearcher()}
      >
        {iconClick ? (
          <Icon.cancel width={15} height={15} viewBox="0 0 20 18" className="animate-fade-in" />
        ) : (
          <Icon.magnifier width={15} height={15} className="animate-fade-in" />
        )}
      </div>
    </Stack>
  );
}

export default Searcher;
