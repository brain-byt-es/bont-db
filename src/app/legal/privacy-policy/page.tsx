import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">PRIVACY POLICY</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated August 23, 2025</p>

        <p className="mb-4 leading-relaxed">
          This Privacy Notice for <strong>HR Online Consulting LLC</strong> (doing business as <strong>InjexPro</strong>) (&quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; or &quot;<strong>our</strong>&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
        </p>

        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Visit our website at <Link href="https://injexpro.com" className="text-primary hover:underline">https://injexpro.com</Link> or any website of ours that links to this Privacy Notice</li>
          <li>Download and use our mobile application ([PLACEHOLDER]), or any other application of ours that links to this Privacy Notice</li>
          <li>Engage with us in other related ways, including any sales, marketing, or events</li>
        </ul>

        <p className="mb-8 leading-relaxed">
          <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <strong>legal@mail.com</strong>.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">SUMMARY OF KEY POINTS</h2>
        <p className="mb-4 leading-relaxed">
          This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics in the sections below.
        </p>

        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>What personal information do we process?</strong> We may process personal information depending on how you interact with us and the Services, the choices you make, and the features you use.</li>
          <li><strong>Do we process sensitive personal information?</strong> We do not process sensitive personal information.</li>
          <li><strong>Do we collect from third parties?</strong> No, we do not collect from third parties.</li>
          <li><strong>How do we process your information?</strong> To provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</li>
          <li><strong>Do we share your personal information?</strong> Yes, in specific cases and with categories of third parties outlined below.</li>
          <li><strong>How do we keep your data safe?</strong> We have organizational and technical safeguards, but no method is 100% secure.</li>
          <li><strong>What are your rights?</strong> Depending on your location, you may have rights to access, correct, delete, or restrict how we process your data.</li>
          <li><strong>How do you exercise them?</strong> By contacting us at <strong>legal@injexpro.com</strong>.</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">TABLE OF CONTENTS</h2>
        <ol className="list-decimal pl-6 mb-8 space-y-1">
          <li>WHAT INFORMATION DO WE COLLECT?</li>
          <li>HOW DO WE PROCESS YOUR INFORMATION?</li>
          <li>WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</li>
          <li>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</li>
          <li>DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</li>
          <li>DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</li>
          <li>HOW DO WE HANDLE YOUR SOCIAL LOGINS?</li>
          <li>IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</li>
          <li>HOW LONG DO WE KEEP YOUR INFORMATION?</li>
          <li>HOW DO WE KEEP YOUR INFORMATION SAFE?</li>
          <li>DO WE COLLECT INFORMATION FROM MINORS?</li>
          <li>WHAT ARE YOUR PRIVACY RIGHTS?</li>
          <li>CONTROLS FOR DO-NOT-TRACK FEATURES</li>
          <li>DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</li>
          <li>DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</li>
          <li>DO WE MAKE UPDATES TO THIS NOTICE?</li>
          <li>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</li>
          <li>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</li>
        </ol>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>

        <h3 className="text-lg font-medium mt-6 mb-2">Personal information you disclose to us.</h3>
        <p className="mb-4 leading-relaxed">
          We collect personal information you provide directly when registering, expressing interest, using features, or contacting us.
        </p>

        <p className="mb-2 font-medium">Examples:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Names, emails, phone numbers, usernames, passwords</li>
          <li>Billing addresses, debit/credit card numbers</li>
          <li>Job titles, authentication data, contact preferences</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-2">Sensitive information.</h3>
        <p className="mb-4 leading-relaxed">
          We do not process sensitive information.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Payment data.</h3>
        <p className="mb-4 leading-relaxed">
          Payments are processed by third-party vendors (e.g., Stripe). We do not store full payment card details. See: <Link href="https://stripe.com/privacy" className="text-primary hover:underline">https://stripe.com/privacy</Link>.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Application data.</h3>
        <p className="mb-2 leading-relaxed">
          If you use our mobile apps, we may collect:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li>Device data (model, OS, identifiers, carrier, IP address)</li>
          <li>Usage diagnostics, crash reports, performance logs</li>
          <li>Push notification preferences</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
        <p className="mb-2 leading-relaxed">We process personal data to:</p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li>Facilitate account creation, login, and authentication</li>
          <li>Deliver and manage Services</li>
          <li>Respond to inquiries and support requests</li>
          <li>Send administrative notices</li>
          <li>Fulfill and manage orders, billing, and payments</li>
          <li>Request feedback and improve Services</li>
          <li>Send marketing (if opted-in) and promotional content</li>
          <li>Deliver targeted ads (see Cookie Policy)</li>
          <li>Monitor fraud and protect security</li>
          <li>Analyze usage trends and improve features</li>
          <li>Verify professional credentials and eligibility (for medical use)</li>
          <li>Ensure compliance with legal and healthcare obligations (e.g., HIPAA, GDPR, FADP, via executed agreements)</li>
          <li>Improve platform stability and reliability with error/crash diagnostics</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">3. WHAT LEGAL BASES DO WE RELY ON?</h2>
        <p className="mb-2 leading-relaxed">Depending on your jurisdiction:</p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li><strong>Consent</strong> (you may withdraw anytime)</li>
          <li><strong>Performance of a contract</strong> (to provide Services you requested)</li>
          <li><strong>Legitimate interests</strong> (improving services, preventing fraud, analytics, verifying eligibility)</li>
          <li><strong>Legal obligations</strong> (complying with laws, regulators, or court orders)</li>
          <li><strong>Vital interests</strong> (to protect safety or prevent harm)</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">4. WHEN AND WITH WHOM DO WE SHARE INFORMATION?</h2>
        <p className="mb-2 leading-relaxed">We may share with:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>AI platforms</li>
          <li>Cloud hosting providers</li>
          <li>Analytics tools</li>
          <li>Payment processors</li>
          <li>Performance monitoring tools</li>
          <li>Authentication providers</li>
          <li>Marketing and communication tools</li>
        </ul>

        <p className="mb-8 leading-relaxed">
          <strong>Business transfers:</strong> We may disclose information in case of mergers, acquisitions, or financing.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
        <p className="mb-8 leading-relaxed">
          Yes. We may use cookies, pixels, and beacons to maintain Services, analyze usage, and personalize ads. See our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
        <p className="mb-2 leading-relaxed">
          Yes. We may use third-party AI providers (e.g., OpenAI, Anthropic, Microsoft Azure).
        </p>
        <p className="mb-8 leading-relaxed">
          Functions include: NLP, bots, text analysis, automation, and AI document generation.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
        <p className="mb-8 leading-relaxed">
          If you sign up via social login (Facebook, Google, X), we may access public profile data, including name, email, and photo, depending on your settings.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">8. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?</h2>
        <p className="mb-2 leading-relaxed">
          Our servers are located in <strong>Germany</strong>. Data may also be processed in the US, UK, Switzerland, or other countries by third-party providers.
        </p>
        <p className="mb-8 leading-relaxed">
          We rely on <strong>Standard Contractual Clauses (SCCs)</strong> to safeguard transfers outside the EEA/UK.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">9. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
        <p className="mb-8 leading-relaxed">
          We keep your information <strong>as long as you have an account</strong> or as required for legal, tax, or compliance purposes. Once no longer needed, data is securely deleted or anonymized.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">10. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
        <p className="mb-8 leading-relaxed">
          We use technical and organizational measures to protect data (encryption, access controls, monitoring). No method is 100% secure.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">11. DO WE COLLECT INFORMATION FROM MINORS?</h2>
        <p className="mb-8 leading-relaxed">
          We do not knowingly collect or market to individuals under <strong>18 years old</strong> (or age of majority in your region). If such data is found, we will delete it.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">12. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
        <p className="mb-2 leading-relaxed">
          Depending on where you live (EEA, UK, Switzerland, US states, Canada, Australia, NZ), you may have rights to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Access or receive a copy of your data</li>
          <li>Correct, erase, or restrict processing</li>
          <li>Object to marketing</li>
          <li>Withdraw consent</li>
          <li>Request portability</li>
        </ul>
        <p className="mb-8 leading-relaxed">
          Contact us at <strong>legal@injexpro.com</strong> to exercise your rights.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">13. CONTROLS FOR DO-NOT-TRACK</h2>
        <p className="mb-8 leading-relaxed">
          We do not respond to browser DNT signals at this time.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">14. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
        <p className="mb-2 leading-relaxed">
          Yes. Depending on your state (California, Colorado, Texas, Virginia, etc.), you may have rights under state privacy laws (e.g., CCPA).
        </p>
        <p className="mb-8 leading-relaxed">
          This includes rights to access, delete, correct, and opt-out of data sale/sharing.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">15. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li><strong>Australia/New Zealand:</strong> Privacy Act compliance</li>
          <li><strong>South Africa:</strong> POPIA compliance</li>
          <li><strong>Canada:</strong> express/implied consent rules under PIPEDA</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">16. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
        <p className="mb-8 leading-relaxed">
          Yes. Updated versions will have a revised &quot;Last updated&quot; date at the top. Significant changes may be notified via email or website notices.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">17. HOW CAN YOU CONTACT US?</h2>
        <p className="mb-2 leading-relaxed">
          If you have questions about this notice, you may email us at <strong>legal@mail.com</strong> or write to:
        </p>
        <address className="not-italic mb-8 font-medium">
          HR Online Consulting LCC<br />
          550 Kings Mountain<br />
          Kings Mountain, NC 28086, United States
        </address>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">18. HOW CAN YOU REVIEW, UPDATE, OR DELETE DATA?</h2>
        <p className="mb-8 leading-relaxed">
          You may request review, update, or deletion of your data by emailing <strong>legal@injexpro.com</strong>. Depending on your jurisdiction, you may also file complaints with your data protection authority.
        </p>
      </article>
    </main>
  );
}
