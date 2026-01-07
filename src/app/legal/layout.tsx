import { ReactNode } from "react"

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="
        max-w-none 
        text-foreground
        [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mt-10 [&_h1]:mb-6 
        [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-2 [&_h2]:border-b [&_h2]:border-border [&_h2:first-child]:mt-0
        [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-4 
        [&_p]:leading-7 [&_p]:mb-4 [&_p]:text-muted-foreground [&_p:not(:first-child)]:mt-6
        [&_ul]:my-6 [&_ul]:ml-6 [&_ul]:list-disc [&_ul>li]:mt-2 [&_ul]:text-muted-foreground
        [&_ol]:my-6 [&_ol]:ml-6 [&_ol]:list-decimal [&_ol>li]:mt-2 [&_ol]:text-muted-foreground
        [&_li]:leading-7
        [&_strong]:font-bold [&_strong]:text-foreground
        [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary/80
        [&_blockquote]:mt-6 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
        [&_hr]:my-8 [&_hr]:border-border
      ">
        {children}
      </article>
    </main>
  )
}
