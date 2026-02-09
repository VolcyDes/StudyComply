"use client";

import * as React from "react";
import { searchUniversities, type PublicUniversity } from "@/lib/universitiesApi";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

type Props = {
  value?: string; // slug
  onChange: (slug: string) => void;
  placeholder?: string;
};

export function UniversityCombobox({ value, onChange, placeholder = "Search a university…" }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState<PublicUniversity[]>([]);
  const [loading, setLoading] = React.useState(false);

  async function load(q: string) {
    setLoading(true);
    try {
      const res = await searchUniversities(q);
      setItems(res);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const q = query.trim();
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [query]);

  const selected = items.find((u) => u.slug === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selected ? `${selected.name} (${selected.city ?? ""} ${selected.countryCode})` : placeholder}
          <span className="opacity-60">⌄</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[420px] p-0" align="start">
        <Command>
          <CommandInput value={query} onValueChange={setQuery} placeholder="Type: ucsd, ucsb, uci…" />
          <CommandEmpty>{loading ? "Loading…" : "No results."}</CommandEmpty>

          <CommandGroup>
            {items.map((u) => (
              <CommandItem
                key={u.slug}
                value={u.slug}
                onSelect={() => {
                  onChange(u.slug);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{u.name}</span>
                  <span className="text-xs opacity-70">
                    {u.slug} • {u.city ?? "—"} • {u.countryCode}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
