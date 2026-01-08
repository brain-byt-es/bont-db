"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
import { searchDiagnosesAction } from "@/app/actions/catalogue"

interface Diagnosis {
  id: string
  code: string
  label: string
}

interface DiagnosisPickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const QUICK_PICKS = [
    { code: "G24.3", label: "Spasmodic torticollis" },
    { code: "G80.0", label: "Spastic quadriplegic cerebral palsy" },
    { code: "G43.3", label: "Chronic migraine" },
    { code: "G24.5", label: "Blepharospasm" },
    { code: "R61.9", label: "Hyperhidrosis" },
]

export function DiagnosisPicker({ value, onChange, placeholder = "Search diagnosis..." }: DiagnosisPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Diagnosis[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const data = await searchDiagnosesAction(query)
        setResults(data)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Find label for current value
  const selectedLabel = React.useMemo(() => {
      const found = [...QUICK_PICKS, ...results].find(d => d.code === value)
      return found ? `${found.code} - ${found.label}` : value
  }, [value, results])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background font-normal"
        >
          <span className="truncate">
            {value ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Type code or name..." 
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && <div className="p-4 text-xs text-muted-foreground animate-pulse">Searching catalogue...</div>}
            
            {!query && (
                <CommandGroup heading="Common Diagnostics">
                    {QUICK_PICKS.map((item) => (
                        <CommandItem
                            key={item.code}
                            value={`${item.code} ${item.label}`}
                            onSelect={() => {
                                onChange(item.code)
                                setOpen(false)
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === item.code ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.label}</span>
                                <span className="text-xs text-muted-foreground">{item.code}</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {results.length > 0 && (
                <CommandGroup heading="Results">
                    {results.map((item) => (
                        <CommandItem
                            key={item.id}
                            value={`${item.code} ${item.label}`}
                            onSelect={() => {
                                onChange(item.code)
                                setOpen(false)
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === item.code ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm">{item.label}</span>
                                <span className="text-xs text-muted-foreground">{item.code}</span>
                            </div>
                        </CommandItem>
                    ))}
                </CommandGroup>
            )}

            {query.length >= 2 && !isLoading && results.length === 0 && (
                <CommandEmpty>No diagnosis found.</CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
