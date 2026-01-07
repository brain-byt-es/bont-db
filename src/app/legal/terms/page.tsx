import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | InjexPro',
  robots: { index: false, follow: true },
}

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-muted-foreground">Last updated August 23, 2025</p>

      <hr />

      <h2>Agreement to Legal Terms</h2>
      <p>
        We are <strong>HR Online Consulting LLC</strong>, doing business as <strong>InjexPro</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We provide the InjexPro clinical documentation platform and related services (collectively, the &quot;Services&quot;).
      </p>

      <p>
        These Terms of Service form a legally binding contract between you and HR Online Consulting LLC. By accessing or using the Services, you acknowledge that you have read and understood these Terms and agree to be bound by them. <strong>IF YOU DO NOT AGREE WITH THESE TERMS, YOU MUST NOT USE THE SERVICES.</strong>
      </p>

      <hr />

      <h2>1. Our Services</h2>
      <p>Because InjexPro operates in the healthcare technology sector, specific compliance rules apply:</p>
      <ul>
        <li><strong>United States:</strong> We comply with HIPAA when PHI is processed under an executed Business Associate Agreement (BAA).</li>
        <li><strong>European Union / international:</strong> We comply with GDPR when handling Special Category Health Data under a signed <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement (DPA)</Link>.</li>
        <li><strong>Data Isolation:</strong> Users may only process identifiable patient data after executing the appropriate BAA or DPA with InjexPro.</li>
      </ul>

      <hr />

      <h2>2. Intellectual Property</h2>
      <p>
        We own all intellectual property rights in the Services, including source code, databases, functionality, software, and website designs. We grant you a limited, non-exclusive, non-transferable license to access the Services strictly for your professional clinical use.
      </p>

      <hr />

      <h2>3. User Representations</h2>
      <p>By using the Services, you represent that:</p>
      <ol>
        <li>All registration details are true and accurate.</li>
        <li>You have the legal capacity to abide by these Terms.</li>
        <li>You are not a minor.</li>
        <li>Your use does not violate any applicable healthcare regulations.</li>
      </ol>

      <hr />

      <h2>4. Purchases and Payment</h2>
      <p>
        Subscriptions automatically renew unless cancelled. You authorize us to charge your payment method on a recurring basis. All purchases are non-refundable unless required by law.
      </p>

      <hr />

      <h2>5. Prohibited Activities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Systematically collect data to build a database without permission.</li>
        <li>Disable, bypass, or interfere with security features.</li>
        <li>Upload patient-identifiable data without a valid DPA/BAA.</li>
        <li>Reverse engineer or decompile Service components.</li>
      </ul>

      <hr />

      <h2>6. Term and Termination</h2>
      <p>
        These Terms remain in force while you use the Services. We reserve the right to terminate your account if you breach these Terms or applicable law.
      </p>

      <hr />

      <h2>7. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Switzerland. Both you and HR Online Consulting LLC agree to the non-exclusive jurisdiction of the courts of Zurich, Switzerland.
      </p>

      <hr />

      <h2>8. Disclaimer and Limitation of Liability</h2>
      <p>
        THE SERVICES ARE PROVIDED &quot;AS IS.&quot; OUR TOTAL LIABILITY FOR ANY CLAIM SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO US IN THE SIX (6) MONTHS PRIOR TO THE CLAIM.
      </p>

      <hr />

      <h2>9. Contact Us</h2>
      <address className="not-italic font-medium">
        HR Online Consulting LLC<br />
        550 Kings Mountain, Kings Mountain, NC 28086<br />
        Email: legal@injexpro.com
      </address>
    </>
  )
}