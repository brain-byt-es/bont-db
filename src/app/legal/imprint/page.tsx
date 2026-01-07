import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Imprint | InjexPro',
  robots: { index: false, follow: true },
}

export default function ImprintPage() {
  return (
    <>
      <h1>Imprint</h1>
      <p className="text-sm text-muted-foreground italic">Last updated: August 24, 2025</p>

      <p>This website and the InjexPro platform are operated by:</p>
      
      <div className="not-prose my-8 p-6 rounded-xl border bg-muted/30 shadow-sm">
        <p className="font-bold text-lg mb-2 text-foreground">HR Online Consulting LLC (doing business as InjexPro)</p>
        <p className="mb-1 text-muted-foreground text-sm leading-relaxed">
          Incorporated under the laws of the Catawba Indian Nation of the Carolinas,<br />
          Catawba Digital Economic Zone, USA
        </p>
        <p className="mb-1 text-sm leading-relaxed text-foreground">
          <strong>Registered Office:</strong> 550 Kings Mountain, Kings Mountain, NC 28086
        </p>
        <p className="mb-1 text-sm leading-relaxed text-foreground">
          <strong>Authorized Representative:</strong> Henrik Rühe, Managing Member
        </p>
        <p className="mb-4 text-sm leading-relaxed text-foreground">
          <strong>Tax Identification Number (EIN):</strong> 61-2199060
        </p>
        
        <div className="space-y-1 pt-2 border-t text-sm">
          <p className="font-semibold text-foreground">Contact Information:</p>
          <p>Email: <a href="mailto:legal@injexpro.com" className="text-primary hover:underline font-medium">legal@injexpro.com</a></p>
          <p>Website: <Link href="https://injexpro.com" className="text-primary hover:underline font-medium">https://injexpro.com</Link></p>
        </div>
      </div>

      <hr />

      <h2>Responsibility for Content</h2>
      <p>
        In accordance with applicable law, the operator of this platform is responsible for its own content. We are not obliged to monitor transmitted third-party information or investigate illegal activity unless we have knowledge of a specific infringement. Upon notification, we will remove infringing content immediately.
      </p>

      <hr />

      <h2>Intellectual Property</h2>
      <p>
        All content and works created by the site operator are subject to international copyright law. Any duplication, processing, or commercialization requires prior written consent.
      </p>

      <hr />

      <h2>Dispute Resolution</h2>
      <p>
        We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
      </p>
    </>
  )
}