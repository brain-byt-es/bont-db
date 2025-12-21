import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface ActionItem {
  id: string
  label: string
  count: number
  href: string
  type: 'warning' | 'info' | 'success'
}

interface NextActionsProps {
  actions: ActionItem[]
}

export function NextActions({ actions }: NextActionsProps) {
  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Next Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>You're all caught up! Great job.</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
           Next Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {actions.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50 border">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${
                action.type === 'warning' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                action.type === 'info' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{action.count} {action.label}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
              <Link href={action.href}>
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Go</span>
              </Link>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
