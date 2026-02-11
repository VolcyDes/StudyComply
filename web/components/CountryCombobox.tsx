"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

function normalizeIso2(code: string) {
  return (code || "").trim().toUpperCase().slice(0, 2);
}

function getCountryName(iso2: string) {
  const c = normalizeIso2(iso2);
  if (!c) return "";
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(c) ?? c;
  } catch {
    return c;
  }
}

function flagSrc(iso2: string) {
  const c = normalizeIso2(iso2).toLowerCase();
  return `/flags/${c}.png`;
}

type Country = { iso2: string; name: string };

function defaultIso2List(): string[] {
  return [
    "FR","US","GB","CA","DE","ES","IT","NL","BE","CH","SE","NO","DK","IE","PT","PL","AT","FI","GR","CZ","HU","RO","BG","HR",
    "MA","DZ","TN","TR","EG","ZA","NG","KE",
    "CN","HK","JP","KR","SG","MY","TH","VN","ID","PH",
    "AU","NZ",
    "BR","AR","MX","CL","CO","PE",
    "IN","AE","SA","QA"
  ];
}

export function CountryCombobox({
  value,
  onChange,
  placeholder = "Select a country…",
  disabled = false,
}: {
  value?: string;
  onChange: (iso2: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  const countries: Country[] = React.useMemo(() => {
    const set = new Set(defaultIso2List().map((x) => normalizeIso2(x)).filter(Boolean));
    const arr = Array.from(set).map((iso2) => ({ iso2, name: getCountryName(iso2) }));
    arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, []);

  const selectedIso2 = normalizeIso2(value || "");
  const selectedName = selectedIso2 ? getCountryName(selectedIso2) : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between rounded-xl"
        >
          <span className="flex min-w-0 items-center gap-2">
            {selectedIso2 ? (
              <>
                <img
                  src={flagSrc(selectedIso2)}
                  alt=""
                  className="h-4 w-4 rounded-sm object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="truncate">
                  {selectedName} ({selectedIso2})
                </span>
              </>
            ) : (
              <span className="truncate text-gray-500">{placeholder}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[360px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search a country…" />
          <CommandEmpty>No country found.</CommandEmpty>
          <CommandGroup className="max-h-[320px] overflow-auto">
            {countries.map((c) => {
              const isSelected = c.iso2 === selectedIso2;
              return (
                <CommandItem
                  key={c.iso2}
                  value={`${c.name} ${c.iso2}`}
                  onSelect={() => {
                    onChange(c.iso2);
                    setOpen(false);
                  }}
                >
                  <img
                    src={flagSrc(c.iso2)}
                    alt=""
                    className="mr-2 h-4 w-4 rounded-sm object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="mr-2 text-xs text-gray-500">{c.iso2}</span>
                  <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
