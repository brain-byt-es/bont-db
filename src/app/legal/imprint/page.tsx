import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function Imprint() {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">Imprint</h1>
        <p className="text-sm text-muted-foreground mb-8 italic">Last updated: August 24, 2025</p>

        <p className="mb-4 leading-relaxed">This website is operated by:</p>
        
        <div className="mb-8 p-6 rounded-lg border bg-muted/30">
          <p className="font-bold text-lg mb-2">HR Online Consulting LLC (doing business as InjexPro)</p>
          <p className="mb-1 text-muted-foreground leading-relaxed">
            Incorporated under the laws of the Catawba Indian Nation of the Carolinas,<br />
            Catawba Digital Economic Zone, USA
          </p>
          <p className="mb-1 leading-relaxed">
            <strong>Registered Office:</strong> 550 Kings Mountain, Kings Mountain, NC 28086
          </p>
          <p className="mb-1 leading-relaxed">
            <strong>Authorized Representative:</strong> Henrik Rühe, Managing Member
          </p>
          <p className="mb-4 leading-relaxed">
            <strong>Tax Identification Number (EIN):</strong> 61-2199060
          </p>
          
          <div className="space-y-1">
            <p className="font-semibold">Contact Information:</p>
            <p>Email: <a href="mailto:legal@injexpro.com" className="text-primary hover:underline font-medium">legal@injexpro.com</a></p>
            <p>Website: <Link href="https://injexpro.com" className="text-primary hover:underline font-medium">https://injexpro.com</Link></p>
          </div>
        </div>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">Responsibility for Content</h2>
        <p className="mb-8 leading-relaxed">
          In accordance with § 5 TMG (Germany) and § 25 ECG (Austria), the operator of this website is responsible for its own content. We are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general law remain unaffected. Liability is only possible from the time of knowledge of a specific infringement. Upon notification of such violations, we will remove the content immediately.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">External Links</h2>
        <p className="mb-8 leading-relaxed">
          This website may contain links to external websites of third parties, on whose contents we have no influence. Therefore, we cannot assume any liability for such external content. The respective provider or operator of the linked sites is always responsible for their content. The linked pages were checked for possible legal violations at the time of linking; illegal content was not recognizable at that time. Permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of a violation of the law. Upon notification of violations, such links will be removed immediately.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Intellectual Property</h2>
        <p className="mb-8 leading-relaxed">
          All content and works created by the site operator on these pages are subject to copyright law. Any duplication, processing, distribution, or commercialization beyond what is permitted under copyright law requires prior written consent of the respective author or creator. Downloads and copies of this site are permitted for private, non-commercial use only.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Dispute Resolution</h2>
        <p className="mb-8 leading-relaxed">
          We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
        </p>
      </article>
    </main>
  );
}
