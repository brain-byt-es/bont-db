"use client"

import * as React from "react"
import {
  IconDashboard,
  IconUsers,
  IconVaccine,
  IconSettings,
  IconPlus,
  IconMoon,
  IconSun,
  IconDeviceLaptop,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { getPatients } from "@/app/(dashboard)/patients/actions"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [patients, setPatients] = React.useState<{id: string, patient_code: string}[]>([])
  const router = useRouter()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (open) {
      getPatients()
        .then((data) => setPatients(data))
        .catch((err) => console.error("Failed to fetch patients for command menu", err))
    }
  }, [open])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search for a patient..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <IconDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/patients"))}>
            <IconUsers className="mr-2 h-4 w-4" />
            <span>Patients</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/treatments"))}>
            <IconVaccine className="mr-2 h-4 w-4" />
            <span>Treatments</span>
          </CommandItem>
        </CommandGroup>
        
        {patients.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Patients">
              {patients.map((patient) => (
                <CommandItem 
                  key={patient.id} 
                  onSelect={() => runCommand(() => router.push(`/patients/${patient.id}`))}
                  value={patient.patient_code}
                >
                  <IconUsers className="mr-2 h-4 w-4" />
                  <span>{patient.patient_code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/patients?action=new"))}>
            <IconPlus className="mr-2 h-4 w-4" />
            <span>New Patient</span>
            <CommandShortcut>NP</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/treatments/new"))}>
            <IconPlus className="mr-2 h-4 w-4" />
            <span>New Treatment</span>
            <CommandShortcut>NT</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <IconSettings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <IconSun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <IconMoon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <IconDeviceLaptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
