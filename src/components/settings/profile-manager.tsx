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
  IconBrandWindows 
} from "@tabler/icons-react"

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
  
  const hasProvider = (p: string) => initialData.identities.some(i => i.provider === p)

  const handleConnect = (provider: string) => {
    signIn(provider, { callbackUrl: "/settings" })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
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
