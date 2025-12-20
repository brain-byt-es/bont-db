"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function DensityToggle() {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    // Check initial state from class or localStorage
    const isCompactMode = document.documentElement.classList.contains("density-compact") || 
                          localStorage.getItem("density-mode") === "compact"
    
    if (isCompactMode) {
        document.documentElement.classList.add("density-compact")
        setIsCompact(true)
    }
  }, [])

  const handleToggle = (checked: boolean) => {
    setIsCompact(checked)
    if (checked) {
      document.documentElement.classList.add("density-compact")
      localStorage.setItem("density-mode", "compact")
    } else {
      document.documentElement.classList.remove("density-compact")
      localStorage.removeItem("density-mode")
    }
  }

  return (
    <div className="flex items-center justify-between space-x-2">
      <div className="space-y-0.5">
        <Label htmlFor="density-mode">Compact Mode</Label>
        <p className="text-sm text-muted-foreground">
          Increase information density for power users.
        </p>
      </div>
      <Switch
        id="density-mode"
        checked={isCompact}
        onCheckedChange={handleToggle}
      />
    </div>
  )
}
