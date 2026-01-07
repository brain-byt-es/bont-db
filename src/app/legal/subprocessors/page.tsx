import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Subprocessor List | InjexPro',
  robots: { index: false, follow: true },
}

export default function SubprocessorsPage() {
  return (
    <>
      <h1>Subprocessor List</h1>
      <p className="text-sm text-muted-foreground">
        Version: 1.0<br />
        Last Updated: October 1, 2025
      </p>

      <p>
        This document provides a list of subprocessors engaged by <strong>HR Online Consulting LLC</strong> (&quot;Processor&quot;) in connection with the provision of the InjexPro platform and related services.
      </p>

      <p>
        This list applies to all <strong>Non-US customers</strong> and is referenced by the Data Processing Agreement (DPA).
      </p>

      <hr />

      <h2>1. Purpose</h2>
      <p>
        Subprocessors are third parties engaged by the Processor to support service delivery where such processing is necessary.
        All subprocessors are contractually bound to data protection obligations consistent with applicable data protection laws.
      </p>

      <hr />

      <h2>2. Authorized Subprocessors</h2>

      <h3>2.1 Cloud Infrastructure & Hosting</h3>
      <p><strong>Microsoft Azure</strong></p>
      <ul>
        <li><strong>Service:</strong> Cloud infrastructure, compute, storage, managed databases</li>
        <li><strong>Purpose:</strong> Hosting and operation of the InjexPro application and databases</li>
        <li><strong>Data Location:</strong> European Union</li>
        <li><strong>Access to Personal Data:</strong> Yes (infrastructure level)</li>
      </ul>

      <hr />

      <h3>2.2 Authentication & Identity Providers</h3>
      <p><strong>Microsoft Entra ID</strong></p>
      <ul>
        <li><strong>Service:</strong> Authentication and identity management</li>
        <li><strong>Purpose:</strong> Secure user authentication</li>
        <li><strong>Access to Personal Data:</strong> User identity data only</li>
      </ul>

      <p><strong>Google Identity Services</strong></p>
      <ul>
        <li><strong>Service:</strong> Authentication</li>
        <li><strong>Purpose:</strong> User login via Google accounts</li>
        <li><strong>Access to Personal Data:</strong> User identity data only</li>
      </ul>

      <p><strong>LinkedIn OAuth</strong></p>
      <ul>
        <li><strong>Service:</strong> Authentication</li>
        <li><strong>Purpose:</strong> User login via LinkedIn accounts</li>
        <li><strong>Access to Personal Data:</strong> User identity data only</li>
      </ul>

      <hr />

      <h3>2.3 Payment Processing</h3>
      <p><strong>Stripe, Inc.</strong></p>
      <ul>
        <li><strong>Service:</strong> Payment processing and billing</li>
        <li><strong>Purpose:</strong> Subscription management and invoicing</li>
        <li><strong>Access to Personal Data:</strong> Limited (billing and payment-related data)</li>
        <li><strong>PHI Access:</strong> No</li>
      </ul>

      <hr />

      <h3>2.4 Email & Communications</h3>
      <p><strong>Resend</strong></p>
      <ul>
        <li><strong>Service:</strong> Transactional email delivery</li>
        <li><strong>Purpose:</strong> Account notifications, billing communications</li>
        <li><strong>Access to Personal Data:</strong> Limited (email address, message metadata)</li>
        <li><strong>PHI Access:</strong> No</li>
      </ul>

      <hr />

      <h2>3. Subprocessor Management</h2>
      <ul>
        <li>Subprocessors are selected based on security, reliability, and compliance standards.</li>
        <li>Data processing agreements are in place with all subprocessors where required.</li>
        <li>Access to Personal Data is limited to what is strictly necessary.</li>
      </ul>

      <hr />

      <h2>4. Updates to Subprocessors</h2>
      <p>
        The Processor may update this Subprocessor List from time to time.
      </p>
      <p>
        If we add a new subprocessor, we will notify organization owners at least 14 days in advance via email. Continued use of the Services after such updates constitutes acknowledgment of the updated list.
      </p>

      <hr />

      <h2>5. Contact</h2>
      <p>
        Questions regarding subprocessors may be directed to: <strong>legal@injexpro.com</strong>
      </p>
    </>
  )
}
