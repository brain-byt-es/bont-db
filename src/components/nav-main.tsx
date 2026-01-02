"use client"

import { useState } from "react"
import { IconCirclePlusFilled, IconUserPlus, IconVaccine, type Icon } from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PatientCreateDialog } from "@/components/patient-create-dialog"
import { TreatmentDialog } from "@/components/treatment-create-dialog"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const [patientDialogOpen, setPatientDialogOpen] = useState(false)
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false)
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        <PatientCreateDialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen} />
        <TreatmentDialog open={treatmentDialogOpen} onOpenChange={setTreatmentDialogOpen} />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Quick Create"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/95 active:text-primary-foreground shadow-sm transition-all"
                >
                  <IconCirclePlusFilled className="size-5" />
                  <span className="font-semibold">Quick Create</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56" sideOffset={8}>
                <DropdownMenuItem onClick={() => setPatientDialogOpen(true)} className="cursor-pointer py-2.5">
                  <IconUserPlus className="mr-2 size-4 text-muted-foreground" />
                  <span>New Patient</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTreatmentDialogOpen(true)} className="cursor-pointer py-2.5">
                  <IconVaccine className="mr-2 size-4 text-muted-foreground" />
                  <span>New Treatment</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title} 
                  asChild 
                  isActive={isActive}
                  className={cn(
                    "transition-colors",
                    isActive && "font-medium"
                  )}
                >
                   <Link href={item.url}>
                      {item.icon && <item.icon className={cn("size-4", isActive && "text-primary")} />}
                      <span>{item.title}</span>
                   </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}