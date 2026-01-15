"use client";

function flagUrl(code: string) {
  return `/flags/${code.toLowerCase()}.png`;
}

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type Country = {
  code: string; // "FR"
  name: string; // "France"
};

export function PassportCountryCombobox({
  countries,
  value,
  onChange,
  placeholder = "Choose a country…",
  triggerClassName,
}: {
  countries: Country[];
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;

  triggerClassName?: string;}) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    if (!value) return null;
    return countries.find((c) => c.code === value) ?? null;
  }, [value, countries]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("w-full h-10 rounded-xl border px-3 justify-between min-w-0", triggerClassName)}>
          {selected ? (
            <span className="flex min-w-0 items-center gap-2">
              <img
                src={flagUrl(selected.code)}
                alt={selected.code}
                width={20}
                height={14}
                className="rounded-sm"
              />
              <span className="truncate">{selected.name}</span>
              <span className="shrink-0 whitespace-nowrap text-muted-foreground">({selected.code})</span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country (name or code)..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.code}`}
                  onSelect={() => {
                    onChange(c.code);
                    setOpen(false);
                  }}
                >
                  <img
                    src={flagUrl(c.code)}
                    alt={c.code}
                    width={20}
                    height={14}
                    className="mr-2 rounded-sm"
                  />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground mr-2">{c.code}</span>
                  <Check className={cn("h-4 w-4", value === c.code ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
