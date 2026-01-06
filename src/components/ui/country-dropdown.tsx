"use client"

import * as React from "react"
import { Check, ChevronDown, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { COUNTRIES } from "@/lib/countries"

interface CountryDropdownProps {
  value?: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CountryDropdown({
  value,
  onChange,
  disabled = false,
  placeholder = "Select country...",
}: CountryDropdownProps) {
  const [open, setOpen] = React.useState(false)

  const selectedCountry = COUNTRIES.find((c) => c.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 px-3 font-normal bg-background"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            {selectedCountry ? (
              <span className="truncate text-foreground font-medium">
                {selectedCountry.name}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.code)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2"
                >
                  <Globe className={cn(
                    "h-4 w-4 shrink-0",
                    value === country.code ? "text-primary" : "text-muted-foreground/50"
                  )} />
                  <span className="flex-1 truncate">{country.name}</span>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      value === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
