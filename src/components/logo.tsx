/* eslint-disable @next/next/no-img-element */
import { cn } from '@/lib/utils'

export function Logo({ className, logoUrl }: { className?: string, logoUrl?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-bold", className)}>
      
      {logoUrl ? (
          <img 
            src={logoUrl} 
            alt="Clinic Logo" 
            className="h-6 w-auto object-contain max-w-[120px]" 
          />
      ) : (
          <svg
            className="h-6 w-auto" // Adjusted height for proper UI scaling
            viewBox="0 0 64 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>InjexPro Logomark</title>
            {/* The "I" element with theme mode switch */}
            <path 
              d="M0 8C0 3.58172 3.58172 0 8 0H24V80H8C3.58172 80 0 76.4183 0 72V8Z" 
              className="fill-gray-900 dark:fill-gray-50" 
            />
            {/* The "P" element */}
            <rect x="32" width="32" height="32" fill="#3b82f6"/>
          </svg>
      )}
      
      {!logoUrl && (
          <span className="text-2xl">
            <span className="font-normal">Injex</span>
            <span className="font-bold">Pro</span>
            <span className="font-normal"> | Docu</span>
          </span>
      )}
    </div>
  )
}