"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { signIn } from "next-auth/react"
import { format } from "date-fns"
import { 
  IconBrandGoogle, 
  IconBrandLinkedin, 
  IconBrandWindows,
  IconEdit,
  IconCheck,
  IconX
} from "@tabler/icons-react"
import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/app/(dashboard)/settings/profile-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProfileData {
  id: string
  name: string
  email: string
  image: string | null
  identities: {
    provider: string
    email: string | null
    linkedAt: Date
  }[]
}

export function ProfileManager({ initialData }: { initialData: ProfileData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(initialData.name)
  const [email, setEmail] = useState(initialData.email)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  const hasProvider = (p: string) => initialData.identities.some(i => i.provider === p)

  const handleConnect = (provider: string) => {
    signIn(provider, { callbackUrl: "/settings" })
  }

  const handleSave = () => {
    startTransition(async () => {
        const formData = new FormData()
        formData.append("name", name)
        formData.append("email", email)
        
        const result = await updateProfile(formData)
        
        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Profile updated")
            setIsEditing(false)
            router.refresh()
        }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Manage your personal information.</CardDescription>
          </div>
          {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <IconEdit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
          ) : (
              <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isPending}>
                      <IconX className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isPending}>
                      <IconCheck className="h-4 w-4 mr-2" /> Save
                  </Button>
              </div>
          )}
        </CardHeader>
        <CardContent>
           {!isEditing ? (
               <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={initialData.image || ""} />
                        <AvatarFallback className="text-lg">{initialData.name ? initialData.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-xl">{initialData.name}</h3>
                        <p className="text-muted-foreground">{initialData.email}</p>
                        <div className="flex gap-2 pt-2">
                            <Badge variant="outline">User ID: {initialData.id.slice(0, 8)}...</Badge>
                        </div>
                    </div>
               </div>
           ) : (
               <div className="space-y-4 max-w-md">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Your Name"
                            disabled={isPending}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="email@example.com"
                            disabled={isPending}
                        />
                        <p className="text-[10px] text-muted-foreground">Changing your email will update your contact information but won&apos;t change your identity provider login.</p>
                    </div>
               </div>
           )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>Log in with these providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Google */}
            <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full"><IconBrandGoogle className="h-5 w-5" /></div>
                    <div>
                        <div className="font-medium">Google</div>
                        {hasProvider('google') ? (
                            <div className="text-xs text-muted-foreground">Linked on {format(new Date(initialData.identities.find(i => i.provider === 'google')!.linkedAt), 'MMM d, yyyy')}</div>
                        ) : (
                            <div className="text-xs text-muted-foreground">Not connected</div>
                        )}
                    </div>
                </div>
                {hasProvider('google') ? (
                    <Button variant="outline" disabled>Connected</Button>
                ) : (
                    <Button variant="outline" onClick={() => handleConnect('google')}>Connect</Button>
                )}
            </div>

            {/* Microsoft / Azure AD */}
            <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full"><IconBrandWindows className="h-5 w-5" /></div>
                    <div>
                        <div className="font-medium">Microsoft (Entra ID)</div>
                        {hasProvider('azure_ad') ? (
                            <div className="text-xs text-muted-foreground">Linked</div>
                        ) : (
                            <div className="text-xs text-muted-foreground">Not connected</div>
                        )}
                    </div>
                </div>
                {hasProvider('azure_ad') ? (
                    <Button variant="outline" disabled>Connected</Button>
                ) : (
                    <Button variant="outline" onClick={() => handleConnect('azure-ad')}>Connect</Button>
                )}
            </div>

            {/* LinkedIn */}
            <div className="flex items-center justify-between border p-4 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full"><IconBrandLinkedin className="h-5 w-5" /></div>
                    <div>
                        <div className="font-medium">LinkedIn</div>
                        {hasProvider('linkedin') ? (
                            <div className="text-xs text-muted-foreground">Linked</div>
                        ) : (
                            <div className="text-xs text-muted-foreground">Not connected</div>
                        )}
                    </div>
                </div>
                {hasProvider('linkedin') ? (
                    <Button variant="outline" disabled>Connected</Button>
                ) : (
                    <Button variant="outline" onClick={() => handleConnect('linkedin')}>Connect</Button>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
