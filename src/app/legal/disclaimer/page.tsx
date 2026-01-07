import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer | InjexPro',
  robots: { index: false, follow: true },
}

export default function DisclaimerPage() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p className="text-sm text-muted-foreground">Last updated August 23, 2025</p>

      <hr />

      <h2>Website Disclaimer</h2>
      <p>
        The information provided by <strong>HR Online Consulting LLC</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on https://injexpro.com and within our clinical platform is intended for general informational purposes only. All content is published in good faith; however, we make no representation or warranty of any kind regarding the accuracy, validity, or completeness of any information presented.
      </p>
      <p className="font-medium">
        UNDER NO CIRCUMSTANCES SHALL WE BE LIABLE TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND RESULTING FROM YOUR USE OF THE SERVICES OR RELIANCE ON ANY INFORMATION PROVIDED THEREIN. YOUR USE OF THE SERVICES IS SOLELY AT YOUR OWN RISK.
      </p>

      <hr />

      <h2>Medical Disclaimer</h2>
      <p>
        The content provided via InjexPro is <strong>for informational and educational purposes only</strong>. It does not constitute medical advice, diagnosis, or treatment, nor is it a substitute for professional judgment by qualified healthcare providers.
      </p>
      <ul>
        <li><strong>No doctor-patient relationship is created.</strong> Use of the InjexPro platform does not establish a physician-patient relationship between us and any individual patients.</li>
        <li><strong>Professional responsibility remains with the clinician.</strong> All decisions regarding patient care, treatment protocols, and clinical outcomes are the sole responsibility of the licensed medical professional.</li>
        <li><strong>Regulatory compliance.</strong> Users are responsible for ensuring that their use of InjexPro complies with all applicable laws and institutional requirements.</li>
      </ul>
      <p className="font-bold">
        USE OF THE INJEXPRO PLATFORM IS AT YOUR OWN RISK. WE EXPRESSLY DISCLAIM ALL LIABILITY FOR ANY CLINICAL DECISION OR PATIENT OUTCOME RESULTING FROM THE USE OF OUR SERVICES.
      </p>

      <hr />

      <h2>External Links Disclaimer</h2>
      <p>
        The platform may contain links to external websites or resources. These external sites are not monitored or checked by us for accuracy or reliability. WE DO NOT WARRANT, ENDORSE, OR GUARANTEE ANY INFORMATION PROVIDED BY THIRD-PARTY WEBSITES.
      </p>
    </>
  )
}
