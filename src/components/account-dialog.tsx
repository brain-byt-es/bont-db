"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateProfile } from "@/app/settings/profile-actions"

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AccountDialog({ open, onOpenChange, user }: AccountDialogProps) {
  const [name, setName] = useState(user.name)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
        const formData = new FormData()
        formData.append("name", name)
        await updateProfile(formData)
        
        toast.success("Profile updated successfully")
        onOpenChange(false)
        router.refresh()
    } catch (error) {
        toast.error("Failed to update profile")
        console.error(error)
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {/* 
                  TODO: Implement avatar upload.
                  For now we just display the current one.
                */}
            </div>
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
                />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
            </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
