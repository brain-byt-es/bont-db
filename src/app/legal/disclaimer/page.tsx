import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function Disclaimer() {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">DISCLAIMER</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated August 23, 2025</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">WEBSITE DISCLAIMER</h2>
        <p className="mb-4 leading-relaxed">
          The information provided by <strong>HR Online Consulting LLC</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) on https://injexpro.com (the &quot;Site&quot;) and within our mobile application is intended for general informational purposes only. All content on the Site and our mobile application is published in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information presented.
        </p>
        <p className="mb-8 leading-relaxed font-medium">
          UNDER NO CIRCUMSTANCES SHALL WE BE LIABLE TO YOU FOR ANY LOSS OR DAMAGE OF ANY KIND RESULTING FROM YOUR USE OF THE SITE OR OUR MOBILE APPLICATION OR RELIANCE ON ANY INFORMATION PROVIDED THEREIN. YOUR ACCESS AND USE OF THE SITE AND OUR MOBILE APPLICATION IS SOLELY AT YOUR OWN RISK.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">EXTERNAL LINKS DISCLAIMER</h2>
        <p className="mb-4 leading-relaxed">
          The Site and our mobile application may contain (or you may be directed through them to) links to external websites, content, or resources originating from third parties, including banners or advertisements. These external sites are not monitored, investigated, or checked by us for accuracy, adequacy, validity, reliability, or completeness.
        </p>
        <p className="mb-8 leading-relaxed font-medium">
          WE DO NOT WARRANT, ENDORSE, GUARANTEE, OR TAKE RESPONSIBILITY FOR THE ACCURACY OR RELIABILITY OF ANY INFORMATION PROVIDED BY THIRD-PARTY WEBSITES LINKED THROUGH THE SITE OR ANY FEATURES IN BANNERS OR ADVERTISING. WE ARE NOT A PARTY TO, NOR SHALL WE BE RESPONSIBLE FOR, ANY TRANSACTIONS BETWEEN YOU AND THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">MEDICAL DISCLAIMER</h2>
        <p className="mb-4 leading-relaxed">
          The content, including but not limited to clinical illustrations, generated guidance, educational modules, and workflow tools, is provided <strong>for informational and educational purposes only</strong>. It does not constitute medical advice, diagnosis, or treatment, nor is it a substitute for professional judgment by qualified healthcare providers.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>No doctor patient relationship is created.</strong> Use of the InjexPro platform does not establish a physician patient relationship between us, our platform, and any individual patients.</li>
          <li><strong>Professional responsibility remains with the clinician.</strong> All decisions regarding patient care, treatment protocols, and clinical outcomes are the sole responsibility of the licensed medical professional using the platform.</li>
          <li><strong>Regulatory compliance.</strong> Users are responsible for ensuring that their use of InjexPro complies with all applicable laws, regulations, institutional requirements, and professional standards in their jurisdiction.</li>
          <li><strong>Tier restrictions.</strong> Users of the <em>Standard Tier</em> are expressly prohibited from entering or uploading identifiable patient information. Users of the <em>Plus Tier</em> may process such information only under a valid Business Associate Agreement (BAA), Data Processing Agreement (DPA), or equivalent legal arrangement.</li>
        </ul>
        <p className="mb-8 leading-relaxed font-bold">
          USE OF THE INJEXPRO PLATFORM IS AT YOUR OWN RISK. WE EXPRESSLY DISCLAIM ALL LIABILITY FOR ANY CLINICAL DECISION OR PATIENT OUTCOME RESULTING FROM THE USE OF OUR SERVICES.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">TESTIMONIALS DISCLAIMER</h2>
        <p className="mb-4 leading-relaxed">
          The Site may include testimonials from users of our products and/or services. These testimonials reflect the actual experiences and opinions of individual users. However, such experiences are personal to those users and may not represent the results of all users.
        </p>
        <p className="mb-4 leading-relaxed font-medium">
          WE DO NOT CLAIM, AND YOU SHOULD NOT ASSUME, THAT ALL USERS WILL HAVE THE SAME EXPERIENCES. YOUR INDIVIDUAL RESULTS MAY DIFFER.
        </p>
        <p className="mb-4 leading-relaxed">
          Testimonials may appear in multiple forms (e.g., text, audio, video) and are reviewed by us prior to publication. They are presented on the Site exactly as submitted by users, apart from minor edits for grammar or clarity. In some cases, testimonials may be shortened to exclude extraneous details not relevant to the general public.
        </p>
        <p className="mb-4 leading-relaxed">
          The views and opinions expressed in testimonials are solely those of the individuals providing them and do not necessarily reflect our views or opinions. We are not affiliated with users who submit testimonials, and such users are not compensated in any way for their feedback.
        </p>
        <p className="mb-8 leading-relaxed">
          Testimonials are not intended, and should not be interpreted, as claims that our products and/or services diagnose, treat, cure, prevent, or mitigate any disease or medical condition. No testimonials have been clinically validated or reviewed by regulatory authorities.
        </p>
      </article>
    </main>
  );
}