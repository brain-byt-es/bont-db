"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Star } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface Muscle {
  id: string
  name: string
  region_id: string
  synonyms?: string[] | null
  sort_order?: number
}

export interface MuscleRegion {
  id: string
  name: string
  sort_order?: number
}

interface MuscleSelectorProps {
  value: string
  onSelect: (value: string) => void
  muscles: Muscle[]
  regions: MuscleRegion[]
  recentMuscles?: string[]
}

export function MuscleSelector({
  value,
  onSelect,
  muscles,
  regions,
  recentMuscles = [],
}: MuscleSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [favorites, setFavorites] = React.useState<string[]>([])

  React.useEffect(() => {
    const storedFavorites = localStorage.getItem("bont_muscle_favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
  }, [])

  const toggleFavorite = (e: React.MouseEvent, muscleId: string) => {
    e.stopPropagation()
    const newFavorites = favorites.includes(muscleId)
      ? favorites.filter((f) => f !== muscleId)
      : [...favorites, muscleId]
    
    setFavorites(newFavorites)
    localStorage.setItem("bont_muscle_favorites", JSON.stringify(newFavorites))
  }

  // Group muscles by region
  const musclesByRegion = React.useMemo(() => {
    const map = new Map<string, Muscle[]>()
    regions.forEach(r => map.set(r.id, []))
    
    // Also handle muscles with unknown regions
    const unknownRegionId = "unknown"
    
    muscles.forEach(m => {
      const regionId = m.region_id || unknownRegionId
      if (!map.has(regionId)) {
        map.set(regionId, [])
      }
      map.get(regionId)?.push(m)
    })
    return map
  }, [muscles, regions])

    const getRegionName = (id: string) => {

      return regions.find(r => r.id === id)?.name || "Other"

    }

  

    const selectedMuscle = muscles.find((m) => m.id === value)

  

    const filterMuscles = (value: string, search: string, keywords: string[] = []) => {

      const extendValue = value + " " + keywords.join(" ")

      if (extendValue.toLowerCase().includes(search.toLowerCase())) return 1

      return 0

    }

  

    return (

      <Popover open={open} onOpenChange={setOpen}>

        <PopoverTrigger asChild>

          <Button

            variant="outline"

            role="combobox"

            aria-expanded={open}

            className="w-full justify-between"

          >

            {selectedMuscle

              ? selectedMuscle.name

              : "Select muscle..."}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />

          </Button>

        </PopoverTrigger>

        <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[400px] p-0" align="start">

          <Command className="h-auto" filter={filterMuscles}>

            <CommandInput placeholder="Search muscle..." />

            <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">

              <CommandEmpty>No muscle found.</CommandEmpty>

  

              

                          {/* Recent & Favorites Group */}

              

                          {(recentMuscles.length > 0 || favorites.length > 0) && (

              

                            <CommandGroup heading="Recent & Favorites">

              

                               {favorites.map((favId) => {

              

                                  const muscle = muscles.find(m => m.id === favId)

              

                                  if (!muscle) return null

              

                                  return (

              

                                  <CommandItem

              

                                    key={`fav-${muscle.id}`}

              

                                    value={`${muscle.name}-${muscle.id}-fav`} // Unique value

              

                                    keywords={[muscle.name, ...(muscle.synonyms || [])]} // Explicit keywords including name

              

                                    onSelect={() => {

              

                                      onSelect(muscle.id)

              

                                      setOpen(false)

              

                                    }}

              

                                  >

              

                                    <Check

              

                                      className={cn(

              

                                        "mr-2 h-4 w-4",

              

                                        value === muscle.id ? "opacity-100" : "opacity-0"

              

                                      )}

              

                                    />

              

                                    {muscle.name} — <span className="text-muted-foreground ml-1">{getRegionName(muscle.region_id)}</span>

              

                                    <Star className="ml-auto h-4 w-4 text-yellow-500 fill-yellow-500" onClick={(e) => toggleFavorite(e, muscle.id)} />

              

                                  </CommandItem>

              

                               )})}

              

                               {recentMuscles.filter(id => !favorites.includes(id)).map((recentId) => {

              

                                 const muscle = muscles.find(m => m.id === recentId)

              

                                 if (!muscle) return null

              

                                 return (

              

                                 <CommandItem

              

                                   key={`recent-${muscle.id}`}

              

                                   value={`${muscle.name}-${muscle.id}-recent`} // Unique value

              

                                   keywords={[muscle.name, ...(muscle.synonyms || [])]} // Explicit keywords including name

              

                                   onSelect={() => {

              

                                     onSelect(muscle.id)

              

                                     setOpen(false)

              

                                   }}

              

                                 >

              

                                   <Check

              

                                     className={cn(

              

                                       "mr-2 h-4 w-4",

              

                                       value === muscle.id ? "opacity-100" : "opacity-0"

              

                                     )}

              

                                   />

              

                                   {muscle.name} — <span className="text-muted-foreground ml-1">{getRegionName(muscle.region_id)}</span>

              

                                   <Badge variant="secondary" className="ml-auto text-xs">Recent</Badge>

              

                                   <Star className="ml-2 h-4 w-4 text-muted-foreground hover:text-yellow-500" onClick={(e) => toggleFavorite(e, muscle.id)} />

              

                                 </CommandItem>

              

                               )})}

              

                            </CommandGroup>

              

                          )}

              

                          

              

                          <CommandSeparator />

              

              

              

                          {/* Regions */}

              

                          {regions.map((region) => {

              

                              const regionMuscles = musclesByRegion.get(region.id) || []

              

                              if (regionMuscles.length === 0) return null

              

                              

              

                              return (

              

                                  <CommandGroup key={region.id} heading={region.name}>

              

                                      {regionMuscles.map((muscle) => (

              

                                          <CommandItem

              

                                              key={muscle.id}

              

                                              value={`${muscle.name}-${muscle.id}`} // Unique value

              

                                              keywords={[muscle.name, ...(muscle.synonyms || [])]} // Explicit keywords including name

              

                                              onSelect={() => {

              

                                                  onSelect(muscle.id) // Pass the ID back

              

                                                  setOpen(false)

              

                                              }}

              

                                          >

              

                                              <Check

              

                                                  className={cn(

              

                                                      "mr-2 h-4 w-4",

              

                                                      value === muscle.id ? "opacity-100" : "opacity-0"

              

                                                  )}

              

                                              />

              

                                              {muscle.name} — <span className="text-muted-foreground ml-1">{region.name}</span>

              

                                              <Star 

              

                                                className={cn(

              

                                                  "ml-auto h-4 w-4 hover:text-yellow-500 cursor-pointer", 

              

                                                  favorites.includes(muscle.id) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"

              

                                                )} 

              

                                                onClick={(e) => toggleFavorite(e, muscle.id)} 

              

                                              />

              

                                          </CommandItem>

              

                                      ))}

              

                                  </CommandGroup>

              

                              )

              

                          })}

              

              

            </CommandList>

          </Command>

        </PopoverContent>

      </Popover>

    )

  }

  
