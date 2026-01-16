"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileManager } from "@/components/settings/profile-manager"
import { QualificationManager } from "@/components/settings/qualification-manager"
import { getUserContextAction } from "@/app/actions/user-context"
import { Loader2, UserCircle, Award, Share2, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n/i18n-context"
import { Locale } from "@/lib/i18n/dictionaries"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface AccountHubProps {
    children?: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AccountHub({ children, open, onOpenChange }: AccountHubProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = open !== undefined ? open : internalOpen
    const setIsOpen = onOpenChange || setInternalOpen
    const { locale, setLocale } = useTranslation()

    const [data, setData] = useState<{
        user: { 
            id: string
            name: string
            email: string
            image: string | null
            identities: {
                provider: string
                email: string | null
                linkedAt: Date
            }[]
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        membership: any
    } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && !data) {
            const t = setTimeout(() => setLoading(true), 0)
            getUserContextAction().then(res => {
                if (res) {
                    setData({
                        user: res.user,
                        membership: res.membership
                    })
                }
                setLoading(false)
            })
            return () => clearTimeout(t)
        }
    }, [isOpen, data])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>Account Hub</DialogTitle>
                    <DialogDescription>Manage your personal profile and professional qualifications.</DialogDescription>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : data ? (
                        <Tabs defaultValue="profile" className="h-full flex flex-col">
                            <div className="px-6 py-2 border-b bg-muted/10">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="profile">
                                        <UserCircle className="mr-2 h-4 w-4" /> Profile
                                    </TabsTrigger>
                                    {data.membership && (
                                        <TabsTrigger value="professional">
                                            <Award className="mr-2 h-4 w-4" /> Professional
                                        </TabsTrigger>
                                    )}
                                </TabsList>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
                                <TabsContent value="profile" className="mt-0 h-full space-y-6">
                                    <ProfileManager initialData={data.user} />
                                    
                                    <div className="p-4 border rounded-xl bg-background">
                                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                            <Globe className="h-4 w-4" /> Preferences
                                        </h4>
                                        <div className="grid gap-2 max-w-xs">
                                            <Label>Language / Sprache</Label>
                                            <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="en">English (US)</SelectItem>
                                                    <SelectItem value="de">Deutsch (German)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-4 border rounded-xl bg-background">
                                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                            <Share2 className="h-4 w-4" /> Connected Accounts
                                        </h4>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            Manage your sign-in methods (Google, Microsoft, LinkedIn).
                                        </p>
                                        <Button variant="outline" size="sm" disabled className="w-full">
                                            Manage Connections (Coming Soon)
                                        </Button>
                                    </div>
                                </TabsContent>
                                
                                {data.membership && (
                                    <TabsContent value="professional" className="mt-0 h-full">
                                        <QualificationManager initialData={data.membership} />
                                    </TabsContent>
                                )}
                            </div>
                        </Tabs>
                    ) : (
                        <div className="p-6 text-center text-muted-foreground">Failed to load user data.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

