import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | InjexPro',
  robots: { index: false, follow: true },
}

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">Last updated August 23, 2025</p>

      <p>
        This Privacy Notice for <strong>HR Online Consulting LLC</strong> (doing business as <strong>InjexPro</strong>) (&quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; or &quot;<strong>our</strong>&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;).
      </p>

      <ul>
        <li>Visit our website at <Link href="https://injexpro.com" className="text-primary hover:underline">https://injexpro.com</Link></li>
        <li>Use the InjexPro clinical documentation platform</li>
        <li>Engage with us in other related ways, including any sales, marketing, or events</li>
      </ul>

      <p>
        <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <strong>legal@injexpro.com</strong>.
      </p>

      <hr />

      <h2>Summary of Key Points</h2>
      <ul>
        <li><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with us and the Services.</li>
        <li><strong>Special categories of data?</strong> We process special categories of data (health data) only under a signed <Link href="/legal/dpa" className="text-primary hover:underline">Data Processing Agreement (DPA)</Link>.</li>
        <li><strong>How do we process your information?</strong> To provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</li>
        <li><strong>Do we share your personal information?</strong> Yes, with authorized <Link href="/legal/subprocessors" className="text-primary hover:underline">Subprocessors</Link>.</li>
        <li><strong>How do we keep your data safe?</strong> We have organizational and technical safeguards (TOMs).</li>
      </ul>

      <hr />

      <h2>1. What information do we collect?</h2>
      <p>We collect personal information you provide directly when registering, expressing interest, using features, or contacting us.</p>
      <ul>
        <li>Names, emails, phone numbers, usernames, passwords</li>
        <li>Billing addresses, debit/credit card numbers</li>
        <li>Job titles, authentication data, contact preferences</li>
      </ul>

      <hr />

      <h2>2. How do we process your information?</h2>
      <ul>
        <li>Facilitate account creation and authentication</li>
        <li>Deliver and manage Services</li>
        <li>Respond to inquiries and support requests</li>
        <li>Monitor fraud and protect security</li>
        <li>Verify professional credentials and eligibility</li>
        <li>Ensure compliance with HIPAA, GDPR, via executed agreements</li>
      </ul>

      <hr />

      <h2>3. International Data Transfers</h2>
      <p>
        Our primary servers are located in <strong>France (European Union)</strong>. Data may also be processed in other countries by third-party providers. We ensure appropriate safeguards (SCCs) are in place.
      </p>

      <hr />

      <h2>4. Data Subject Rights</h2>
      <p>
        Depending on your location, you have rights to access, correct, delete, or restrict how we process your data. Contact us at <strong>legal@injexpro.com</strong> to exercise your rights.
      </p>

      <hr />

      <h2>5. Contact Us</h2>
      <address className="not-italic font-medium">
        HR Online Consulting LLC<br />
        550 Kings Mountain, Kings Mountain, NC 28086, United States
      </address>
    </>
  )
}