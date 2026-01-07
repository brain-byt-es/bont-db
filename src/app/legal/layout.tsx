import { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg prose-p:leading-relaxed prose-li:leading-relaxed prose-hr:my-8">
        {children}
      </article>
    </main>
  )
}
