"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Plan } from "@/generated/client/enums"
import { checkPlan } from "@/lib/permissions"
import { Lock } from "lucide-react"

interface SettingsSidebarProps {
    userPlan: Plan
    isOwner: boolean
}

export function SettingsSidebar({ userPlan, isOwner }: SettingsSidebarProps) {
    const pathname = usePathname()
    const isPro = checkPlan(userPlan, Plan.PRO)
    const isEnterprise = userPlan === Plan.ENTERPRISE

    const items = [
        { 
            category: "Clinic",
            items: [
                { title: "General", href: "/settings/general" },
                { title: "Clinical Defaults", href: "/settings/clinical-defaults" },
                { title: "Team & Roles", href: "/settings/team" },
            ]
        },
        {
            category: "Trust & Billing",
            items: [
                { title: "Billing & Plan", href: "/settings/billing" },
                { title: "Audit Logs", href: "/settings/audit", locked: !isPro },
                { title: "Integrations", href: "/settings/integrations", locked: !isEnterprise, hidden: !isEnterprise } // Hide unless Enterprise per spec
            ]
        }
    ]

    return (
        <nav className="flex flex-col space-y-8 w-64 pr-6 border-r hidden md:flex">
            {items.map((group) => (
                <div key={group.category} className="flex flex-col space-y-2">
                    <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {group.category}
                    </h4>
                    {group.items.filter(i => !i.hidden).map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between text-sm py-2 px-3 rounded-md transition-colors",
                                    isActive 
                                        ? "bg-muted font-medium text-foreground" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    item.locked && "opacity-60 cursor-not-allowed pointer-events-none"
                                )}
                            >
                                {item.title}
                                {item.locked && <Lock className="h-3 w-3 ml-2" />}
                            </Link>
                        )
                    })}
                </div>
            ))}
        </nav>
    )
}
