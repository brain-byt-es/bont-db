"use client"

import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <div className="fixed bottom-8 right-8 print:hidden">
      <button 
          onClick={() => window.print()}
          className="bg-black text-white shadow-lg hover:bg-gray-800 h-12 px-6 rounded-full font-medium flex items-center gap-2 transition-transform active:scale-95"
      >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
      </button>
    </div>
  )
}
