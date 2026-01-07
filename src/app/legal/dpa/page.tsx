import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Processing Agreement (DPA) | InjexPro',
  robots: { index: false, follow: true },
}

export default function DPAPage() {
  return (
    <>
      <h1>Data Processing Agreement (DPA)</h1>
      <p className="text-sm text-muted-foreground">
        Version: 1.0<br />
        Effective Date: October 1, 2025
      </p>

      <p>
        This Data Processing Agreement (&quot;<strong>DPA</strong>&quot;) forms part of the agreement between:
      </p>

      <ul>
        <li><strong>The Customer</strong> (&quot;<strong>Controller</strong>&quot;), and</li>
        <li><strong>HR Online Consulting LLC</strong> (&quot;<strong>Processor</strong>&quot;)</li>
      </ul>

      <p>
        and applies to the use of the InjexPro platform and related services (the &quot;<strong>Services</strong>&quot;).
      </p>

      <p>
        This DPA is entered into electronically and becomes legally binding <strong>upon acceptance by the Controller via click-acceptance</strong> during account creation, organization setup, or subscription activation.
      </p>

      <hr />

      <h2>1. Scope and Applicability</h2>
      <p>
        1.1 This DPA applies to the processing of Personal Data by the Processor on behalf of the Controller in accordance with Article 28 of Regulation (EU) 2016/679 (&quot;GDPR&quot;).
      </p>
      <p>
        1.2 This DPA applies to all customers <strong>outside the United States</strong>. U.S. customers are governed by a separate Business Associate Agreement (BAA) where applicable.
      </p>

      <hr />

      <h2>2. Subject Matter and Duration</h2>
      <p>
        2.1 The subject matter of the processing is the provision of secure, audit-safe clinical documentation software.
      </p>
      <p>
        2.2 The duration of processing corresponds to the term of the underlying service agreement, unless otherwise required by applicable law.
      </p>

      <hr />

      <h2>3. Nature and Purpose of Processing</h2>
      <p>
        3.1 The Processor processes Personal Data solely for the purpose of providing the Services in accordance with the Controller’s documented instructions.
      </p>
      <p>
        3.2 Processing activities include hosting, storage, access control, audit logging, and transmission of clinical documentation data.
      </p>

      <hr />

      <h2>4. Categories of Data Subjects and Personal Data</h2>
      <p>
        4.1 Categories of Data Subjects include: Patients, Healthcare professionals, Authorized clinical staff.
      </p>
      <p>
        4.2 Categories of Personal Data include: Patient identifiers (processed in logically isolated systems), Clinical treatment records, User account and access data, Audit and activity logs.
      </p>
      <p>
        4.3 Special categories of data pursuant to Article 9 GDPR (health data) are processed.
      </p>

      <hr />

      <h2>5. Roles of the Parties</h2>
      <p>
        5.1 The Controller acts as the data controller within the meaning of the GDPR.
      </p>
      <p>
        5.2 The Processor acts as a data processor and processes Personal Data <strong>only on documented instructions</strong> from the Controller.
      </p>

      <hr />

      <h2>6. Processor Obligations</h2>
      <p>The Processor shall:</p>
      <ol>
        <li>Process Personal Data only in accordance with documented instructions from the Controller.</li>
        <li>Ensure that persons authorized to process Personal Data are subject to confidentiality obligations.</li>
        <li>Implement appropriate technical and organizational measures (&quot;TOMs&quot;) pursuant to Article 32 GDPR.</li>
        <li>Assist the Controller in responding to data subject rights requests.</li>
        <li>Assist the Controller with compliance obligations relating to security, breach notification, and data protection impact assessments.</li>
        <li>Delete or return Personal Data upon termination of the Services, unless retention is required by law.</li>
      </ol>

      <hr />

      <h2>7. Technical and Organizational Measures (TOMs)</h2>
      <p>
        7.1 The Processor implements security measures appropriate to the risk, including but not limited to RBAC, Encryption, Logical separation, and Audit logging.
      </p>
      <p>
        7.2 A detailed description of the TOMs is provided in the <Link href="/legal/toms" className="text-primary hover:underline font-bold text-lg">Technical and Organizational Measures (TOMs)</Link> document.
      </p>

      <hr />

      <h2>8. Subprocessors</h2>
      <p>
        8.1 The Controller authorizes the Processor to engage subprocessors as necessary to provide the Services.
      </p>
      <p>
        8.2 Current list of subprocessors: <Link href="/legal/subprocessors" className="text-primary hover:underline font-bold text-lg">List of Subprocessors</Link>.
      </p>

      <hr />

      <h2>9. International Data Transfers</h2>
      <p>
        9.1 Personal Data is processed and stored within the European Union unless otherwise agreed.
      </p>

      <hr />

      <h2>10. Data Subject Rights</h2>
      <p>
        10.1 The Processor assists the Controller in fulfilling obligations relating to data subject rights under Articles 12–22 GDPR.
      </p>

      <hr />

      <h2>11. Personal Data Breach Notification</h2>
      <p>
        11.1 The Processor shall notify the Controller <strong>without undue delay</strong> upon becoming aware of a personal data breach.
      </p>

      <hr />

      <h2>12. Audits and Compliance</h2>
      <p>
        12.1 The Processor shall make available information reasonably necessary to demonstrate compliance with this DPA.
      </p>

      <hr />

      <h2>13. Liability</h2>
      <p>
        Each Party shall be liable for damages caused by its own breach of this DPA or applicable data protection law.
      </p>

      <hr />

      <h2>14. Governing Law</h2>
      <p>
        This DPA shall be governed by the laws of the European Union and, where applicable, the laws of the Processor’s principal place of business within the EU.
      </p>

      <hr />

      <h2>15. Acceptance and Updates</h2>
      <p>
        15.1 This DPA is accepted electronically and does not require a handwritten or electronic signature.
      </p>
      <p>
        15.2 Continued use of the Services after publication of an updated version constitutes acceptance of the updated DPA.
      </p>
    </>
  )
}
