import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Technical and Organizational Measures (TOMs) | InjexPro',
  robots: { index: false, follow: true },
}

export default function TOMsPage() {
  return (
    <>
      <h1>Technical and Organizational Measures (TOMs)</h1>
      <p className="text-sm text-muted-foreground">
        Version: 1.0<br />
        Effective Date: October 1, 2025
      </p>

      <p>
        This document describes the technical and organizational measures implemented by <strong>HR Online Consulting LLC</strong> (&quot;Processor&quot;) to ensure the security of Personal Data processed on behalf of customers (&quot;Controllers&quot;) in accordance with Article 32 GDPR.
      </p>

      <hr />

      <h2>1. Information Security Governance</h2>
      <h3>1.1 Responsibility</h3>
      <ul>
        <li>Overall responsibility for data protection and information security lies with the Processor.</li>
        <li>Access to Personal Data is restricted to authorized personnel on a need-to-know basis.</li>
      </ul>

      <h3>1.2 Policies and Training</h3>
      <ul>
        <li>Internal policies define secure data handling, access control, and incident response.</li>
        <li>Personnel with access to Personal Data are subject to confidentiality obligations.</li>
      </ul>

      <hr />

      <h2>2. Access Control</h2>
      <h3>2.1 User Authentication</h3>
      <ul>
        <li>Secure authentication mechanisms are enforced for all users.</li>
        <li>Authentication is handled via trusted identity providers.</li>
        <li>Session management prevents unauthorized reuse of credentials.</li>
      </ul>

      <h3>2.2 Role-Based Access Control (RBAC)</h3>
      <ul>
        <li>Access rights are granted based on predefined roles.</li>
        <li>Users can only access data required for their assigned role.</li>
        <li>Administrative privileges are restricted and logged.</li>
      </ul>

      <hr />

      <h2>3. Data Access and Authorization</h2>
      <h3>3.1 Logical Data Separation</h3>
      <ul>
        <li>Customer data is logically isolated by organization.</li>
        <li>Sensitive patient identifiers are processed in isolated system components.</li>
      </ul>

      <h3>3.2 Least Privilege Principle</h3>
      <ul>
        <li>Database and application access follow the principle of least privilege.</li>
        <li>Runtime systems operate with restricted permissions.</li>
      </ul>

      <hr />

      <h2>4. Encryption and Data Security</h2>
      <h3>4.1 Encryption in Transit</h3>
      <ul>
        <li>All data transmitted between clients and servers is encrypted using industry-standard transport encryption (TLS).</li>
      </ul>

      <h3>4.2 Encryption at Rest</h3>
      <ul>
        <li>Stored data is protected using encryption mechanisms provided by the hosting infrastructure.</li>
      </ul>

      <hr />

      <h2>5. Logging and Auditability</h2>
      <h3>5.1 Audit Logs</h3>
      <ul>
        <li>Access to sensitive data and critical system actions are logged.</li>
        <li>Audit logs include timestamp, user reference, and action type.</li>
      </ul>

      <h3>5.2 Integrity</h3>
      <ul>
        <li>Audit logs are protected against unauthorized modification.</li>
        <li>Logs are retained in accordance with operational and legal requirements.</li>
      </ul>

      <hr />

      <h2>6. Data Integrity and Availability</h2>
      <h3>6.1 Data Integrity</h3>
      <ul>
        <li>System constraints and validation mechanisms prevent unauthorized data modification.</li>
        <li>Critical relationships are enforced at the database level.</li>
      </ul>

      <h3>6.2 Backup and Recovery</h3>
      <ul>
        <li>Regular backups are performed to prevent data loss.</li>
        <li>Recovery procedures are tested to ensure data availability.</li>
      </ul>

      <hr />

      <h2>7. Incident Management</h2>
      <h3>7.1 Incident Detection</h3>
      <ul>
        <li>Monitoring mechanisms detect unauthorized access and system anomalies.</li>
      </ul>

      <h3>7.2 Incident Response</h3>
      <ul>
        <li>Documented procedures define actions in the event of a security incident.</li>
        <li>Incidents involving Personal Data are assessed without undue delay.</li>
      </ul>

      <h3>7.3 Breach Notification</h3>
      <ul>
        <li>Personal Data breaches are reported to the Controller without undue delay in accordance with GDPR requirements.</li>
      </ul>

      <hr />

      <h2>8. Physical Security</h2>
      <h3>8.1 Data Centers</h3>
      <ul>
        <li>Data is hosted in secure data centers operated by reputable cloud service providers.</li>
        <li>Physical access controls are managed by the hosting provider.</li>
      </ul>

      <hr />

      <h2>9. Subprocessors</h2>
      <h3>9.1 Use of Subprocessors</h3>
      <ul>
        <li>Subprocessors are engaged only where necessary for service provision.</li>
        <li>All subprocessors are contractually bound to appropriate data protection obligations.</li>
      </ul>

      <h3>9.2 Oversight</h3>
      <ul>
        <li>Subprocessor compliance is reviewed as part of vendor management.</li>
      </ul>

      <hr />

      <h2>10. Data Minimization and Retention</h2>
      <h3>10.1 Data Minimization</h3>
      <ul>
        <li>Only Personal Data necessary for the provision of the Services is processed.</li>
      </ul>

      <h3>10.2 Data Retention</h3>
      <ul>
        <li>Personal Data is retained only for the duration required to fulfill contractual and legal obligations.</li>
        <li>Upon termination, data is deleted or returned as instructed by the Controller.</li>
      </ul>

      <hr />

      <h2>11. Data Subject Rights Support</h2>
      <ul>
        <li>Processes are in place to assist Controllers in responding to requests for access, rectification, or deletion of Personal Data.</li>
        <li>The Processor does not act independently on such requests.</li>
      </ul>

      <hr />

      <h2>12. Continuous Improvement</h2>
      <ul>
        <li>Security measures are reviewed periodically.</li>
        <li>TOMs may be updated to reflect changes in technology, risk, or regulatory requirements.</li>
      </ul>

      <hr />

      <h2>13. Applicability</h2>
      <p>
        These TOMs apply to all Non-US customers and form an integral part of the Data Processing Agreement (DPA).
      </p>
    </>
  )
}
