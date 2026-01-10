"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { SCHENGEN_SET, isSupportedDestinationIso2 } from "@/lib/travelDestination";

function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}

export function DestinationCombobox({
  countries,
  value,
  onChange,
  placeholder = "Search destination (name or code)...",
}: {
  countries: Array<{ name: string; code: string }>;
  value: string;
  onChange: (iso2: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const options = React.useMemo(() => {
    const base = (countries ?? [])
      .map((c) => ({ name: c.name, code: (c.code ?? "").toUpperCase() }))
      .filter((c) => isSupportedDestinationIso2(c.code));

    // Ensure US/CA/GB present even if not in meta
    const extras = [
      { name: "United States", code: "US" },
      { name: "Canada", code: "CA" },
      { name: "United Kingdom", code: "GB" },
    ];

    const byCode = new Map<string, { name: string; code: string }>();
    for (const c of base) byCode.set(c.code, c);
    for (const e of extras) if (!byCode.has(e.code)) byCode.set(e.code, e);

    const arr = Array.from(byCode.values());

    // Sort: Schengen countries first, then others; alphabetical
    arr.sort((a, b) => {
      const aSch = SCHENGEN_SET.has(a.code) ? 1 : 0;
      const bSch = SCHENGEN_SET.has(b.code) ? 1 : 0;
      if (aSch !== bSch) return bSch - aSch;
      return a.name.localeCompare(b.name);
    });

    return arr;
  }, [countries]);

  const selected = options.find((o) => o.code === (value ?? "").toUpperCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-2">
            {selected?.code ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flagUrl(selected.code)} alt="" className="h-4 w-4 rounded-sm" />
            ) : null}
            <span>{selected ? `${selected.name} (${selected.code})` : "Choose destination…"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No destination found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const isSelected = (value ?? "").toUpperCase() === o.code;
                return (
                  <CommandItem
                    key={o.code}
                    value={`${o.name} ${o.code}`}
                    onSelect={() => {
                      onChange(o.code);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={flagUrl(o.code)} alt="" className="h-4 w-4 rounded-sm" />
                      <span>{o.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{o.code}</span>
                      {isSelected ? <Check className="h-4 w-4" /> : null}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
