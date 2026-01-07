import Link from "next/link"

export function AuthFooter() {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-4 py-6 md:flex-row md:gap-0">
      <span className="text-xs text-muted-foreground md:text-sm">
        © 2025 InjexPro | All rights reserved
      </span>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6">
        <Link href="/legal/privacy" className="text-xs text-muted-foreground hover:underline md:text-sm">
          Privacy
        </Link>
        <Link href="/legal/terms" className="text-xs text-muted-foreground hover:underline md:text-sm">
          Terms
        </Link>
        <Link href="/legal/disclaimer" className="text-xs text-muted-foreground hover:underline md:text-sm">
          Disclaimer
        </Link>
        <Link href="/legal/imprint" className="text-xs text-muted-foreground hover:underline md:text-sm">
          Imprint
        </Link>
      </div>
    </footer>
  )
}
