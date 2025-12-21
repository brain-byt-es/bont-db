import { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: true,
  },
};

export default function TermsOfService() {
  return (
    <main className="container mx-auto px-6 py-24 max-w-4xl text-left">
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-2">TERMS OF SERVICE</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated August 23, 2025</p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">AGREEMENT TO OUR LEGAL TERMS</h2>
        <p className="mb-4 leading-relaxed">
          We are <strong>HR Online Consulting LLC</strong>, doing business as <strong>InjexPro</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), registered in <strong>Catawba Digital Economic Zone</strong> with a principal office at <strong>550 Kings Mountain, Kings Mountain, NC 28086</strong>.
        </p>

        <p className="mb-4 leading-relaxed">
          We provide the website (the &quot;Site&quot;), the InjexPro mobile application (the &quot;App&quot;), and any other related services, products, or features that reference these legal terms (collectively, the &quot;Services&quot;).
        </p>

        <p className="mb-4 leading-relaxed">
          You may contact us by email at <strong>legal@injexpro.com</strong> or by mail at <strong>550 Kings Mountain, Kings Mountain, NC 28086</strong>.
        </p>

        <p className="mb-4 leading-relaxed">
          These Terms of Service form a legally binding contract between you, whether personally or on behalf of an entity (&quot;you&quot;), and <strong>HR Online Consulting LLC</strong>, concerning your access to and use of the Services. By accessing or using the Services, you acknowledge that you have read and understood these Terms and agree to be bound by them. <strong>IF YOU DO NOT AGREE WITH THESE TERMS, YOU MUST NOT USE THE SERVICES.</strong>
        </p>

        <p className="mb-4 leading-relaxed">
          We will notify you in advance of any material changes to the Services. Updates to these Terms will take effect upon posting to the Site or upon notice to you via email at <strong>legal@injexpro.com</strong>. Continued use of the Services after changes become effective means you accept the revised Terms.
        </p>

        <p className="mb-4 leading-relaxed">
          The Services are intended for users at least 18 years of age. Persons under 18 may not register for or use the Services.
        </p>

        <p className="mb-8 leading-relaxed">
          We recommend printing or saving a copy of these Terms for future reference.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">1. OUR SERVICES</h2>
        <p className="mb-4 leading-relaxed">
          The Services are not meant for distribution or use in jurisdictions where such access would be unlawful or subject us to registration requirements. If you choose to access the Services from outside our main operating regions, you do so on your own initiative and are solely responsible for compliance with local laws that may apply.
        </p>

        <p className="mb-2 leading-relaxed">
          Because InjexPro operates in the healthcare technology sector, specific compliance rules apply:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-2">
          <li><strong>United States:</strong> We comply with the Health Insurance Portability and Accountability Act of 1996 (HIPAA) when Protected Health Information (PHI) is processed under an executed Business Associate Agreement (BAA).</li>
          <li><strong>European Union, United Kingdom, Switzerland:</strong> We comply with the GDPR, UK GDPR, and the Swiss Federal Act on Data Protection (FADP) when handling Special Category Health Data under a signed Data Processing Agreement (DPA).</li>
          <li><strong>Standard Tier:</strong> Users are expressly forbidden from uploading or entering identifiable patient information.</li>
          <li><strong>Plus Tier:</strong> Users may only process identifiable patient data after executing the appropriate BAA or DPA with InjexPro.</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">2. INTELLECTUAL PROPERTY RIGHTS</h2>

        <h3 className="text-lg font-medium mt-6 mb-2">Our Intellectual Property</h3>
        <p className="mb-4 leading-relaxed">
          We own, or are the licensee of, all intellectual property rights in the Services, including but not limited to: source code, databases, functionality, software, website designs, audio, video, text, images, graphics, and other materials (collectively, the &quot;Content&quot;), as well as all trademarks, service marks, and logos displayed in the Services (the &quot;Marks&quot;).
        </p>
        <p className="mb-4 leading-relaxed">
          The Content and Marks are protected by copyright, trademark, and other intellectual property and unfair competition laws in the United States and internationally.
        </p>
        <p className="mb-4 leading-relaxed">
          The Services, Content, and Marks are provided &quot;AS IS&quot; for your internal business use or personal professional reference only.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Your Use of the Services</h3>
        <p className="mb-2 leading-relaxed">
          Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>access the Services; and</li>
          <li>download or print portions of the Content you are permitted to access,</li>
        </ul>
        <p className="mb-4 leading-relaxed">
          strictly for your own internal business use or professional reference.
        </p>
        <p className="mb-4 leading-relaxed">
          Except as expressly permitted in these Terms, you may not copy, reproduce, republish, upload, transmit, publicly display, sell, license, or otherwise exploit any part of the Services, Content, or Marks without prior written consent from us.
        </p>
        <p className="mb-4 leading-relaxed">
          If you seek permission for uses beyond what is explicitly allowed here, please contact: <strong>legal@injexpro.com</strong>.
        </p>
        <p className="mb-4 leading-relaxed">
          We reserve all rights not expressly granted in and to the Services, Content, and Marks. Any unauthorized use will be treated as a material breach of these Terms and may result in termination of your access rights.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Submissions and Contributions</h3>
        <p className="mb-4 leading-relaxed">
          If you send us feedback, questions, ideas, or suggestions (&quot;Submissions&quot;), you agree that all intellectual property rights in such Submissions are transferred to us. We may use them for any lawful purpose without compensation or acknowledgment.
        </p>
        <p className="mb-4 leading-relaxed">
          If you provide or post any content via the Services (&quot;Contributions&quot;), you grant us a worldwide, perpetual, irrevocable, royalty-free license to use, reproduce, distribute, display, and adapt those Contributions in any media or format, for any lawful purpose.
        </p>
        <p className="mb-4 leading-relaxed">
          We reserve the right to remove or alter any Contributions if we believe they violate these Terms or applicable law.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Copyright Infringement</h3>
        <p className="mb-8 leading-relaxed">
          We respect the intellectual property rights of others. If you believe any material on or through the Services infringes your copyright, please refer to the &quot;COPYRIGHT INFRINGEMENTS&quot; section below.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">3. USER REPRESENTATIONS</h2>
        <p className="mb-2 leading-relaxed">By using the Services, you represent and warrant that:</p>
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          <li>All registration details you provide are true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of this information and update it as necessary.</li>
          <li>You have the legal capacity and agree to abide by these Terms.</li>
          <li>You are not a minor in your place of residence.</li>
          <li>You will not access the Services through automated or non-human means (such as bots or scripts).</li>
          <li>You will not use the Services for any unlawful or unauthorized purpose.</li>
          <li>Your use of the Services does not violate any applicable laws or regulations.</li>
        </ol>
        <p className="mb-8 leading-relaxed">
          If any information you provide is untrue, inaccurate, not current, or incomplete, we may suspend or terminate your account and refuse any current or future access to the Services.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">4. USER REGISTRATION</h2>
        <p className="mb-4 leading-relaxed">
          You may need to register for an account to use parts of the Services. You agree to keep your login credentials confidential and are responsible for all activities under your account.
        </p>
        <p className="mb-8 leading-relaxed">
          We reserve the right to remove, reclaim, or change any username if we determine, in our sole discretion, that it is inappropriate, obscene, or otherwise objectionable.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">5. PURCHASES AND PAYMENT</h2>
        <p className="mb-2 leading-relaxed">We accept the following forms of payment:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Visa</li>
          <li>Mastercard</li>
          <li>American Express</li>
          <li>Discover</li>
          <li>PayPal</li>
        </ul>
        <p className="mb-4 leading-relaxed">
          You agree to provide accurate, current, and complete purchase and account information for all transactions. You also agree to promptly update this information, including email address, payment method, and card expiration dates, so we can process transactions and contact you as necessary.
        </p>
        <p className="mb-4 leading-relaxed">
          Sales tax will be added to purchases where applicable. Prices may change at any time. All payments are in U.S. dollars unless otherwise stated.
        </p>
        <p className="mb-4 leading-relaxed">
          You authorize us to charge your chosen payment method for all applicable fees. We reserve the right to correct errors in pricing, even if payment has already been requested or received.
        </p>
        <p className="mb-8 leading-relaxed">
          We may reject or cancel orders at our discretion. This includes limiting or cancelling quantities purchased per account, payment method, or billing/shipping address. Orders that appear to be placed by dealers, resellers, or distributors may also be refused.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">6. SUBSCRIPTIONS</h2>
        <p className="mb-4 leading-relaxed">
          <strong>Billing and Renewal</strong><br />
          Subscriptions automatically renew unless cancelled. You authorize us to charge your payment method on a recurring basis until cancellation. The billing cycle depends on your chosen subscription plan.
        </p>
        <p className="mb-4 leading-relaxed">
          <strong>Free Trial</strong><br />
          We may offer a 14-day free trial for new users. At the end of the trial, your selected plan will begin, and fees will be charged accordingly.
        </p>
        <p className="mb-4 leading-relaxed">
          <strong>Cancellation</strong><br />
          All purchases are non-refundable. You may cancel your subscription at any time in your account settings. Cancellation will apply at the end of the current paid term. For questions or concerns, contact us at <strong>legal@injexpro.com</strong>.
        </p>
        <p className="mb-8 leading-relaxed">
          <strong>Fee Changes</strong><br />
          We may adjust subscription prices from time to time, with notice provided as required by law.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">7. SOFTWARE</h2>
        <p className="mb-4 leading-relaxed">
          The Services may include software for use with our platform. If accompanied by an end user license agreement (EULA), that document governs use of the software. If not, then we grant you a limited, personal, non-exclusive, non-transferable, revocable license to use such software solely in connection with the Services and under these Terms.
        </p>
        <p className="mb-8 leading-relaxed">
          The software and any related documentation are provided &quot;AS IS,&quot; without warranties of any kind. You assume all risks from its use or performance. You may not reproduce, redistribute, reverse engineer, decompile, or disassemble the software except as permitted by applicable law.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">8. PROHIBITED ACTIVITIES</h2>
        <p className="mb-4 leading-relaxed">
          You may not use the Services for any purpose other than those we make available. The Services must not be used for commercial endeavors unless specifically approved by us.
        </p>
        <p className="mb-2 leading-relaxed">By using the Services, you agree not to:</p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li>Systematically collect data or other content to build a database without written permission.</li>
          <li>Mislead, trick, or defraud us or other users, particularly to obtain sensitive account details.</li>
          <li>Disable, bypass, or interfere with security features of the Services.</li>
          <li>Harm or disparage us, in our opinion.</li>
          <li>Use data from the Services to harass, abuse, or harm another person.</li>
          <li>Misuse our support services or submit false abuse reports.</li>
          <li>Use the Services in violation of applicable laws.</li>
          <li>Engage in unauthorized framing or linking.</li>
          <li>Upload or transmit viruses, malware, spam, or other disruptive content.</li>
          <li>Employ automated scripts, bots, or scraping tools to access the Services.</li>
          <li>Delete copyright or proprietary notices.</li>
          <li>Impersonate another person or use another persons username.</li>
          <li>Collect or transmit passive data collection tools (spyware, pixels, cookies, etc.).</li>
          <li>Interfere with or burden our infrastructure.</li>
          <li>Harass or threaten our staff.</li>
          <li>Attempt to bypass access restrictions.</li>
          <li>Copy or adapt Service software or code.</li>
          <li>Reverse engineer or decompile Service components (except as allowed by law).</li>
          <li>Launch or distribute unauthorized automated systems.</li>
          <li>Use a purchasing agent or reseller to make orders.</li>
          <li>Create accounts by automated means or false pretenses.</li>
          <li>Compete with us by using our Services for your own revenue-generating activities.</li>
          <li>Sell or transfer your profile.</li>
          <li>Advertise or offer goods/services without authorization.</li>
          <li>Upload patient-identifiable data in the <strong>Standard Tier</strong>.</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">9. USER GENERATED CONTRIBUTIONS</h2>
        <p className="mb-4 leading-relaxed">
          The Services may allow you to post or share content, such as text, images, video, audio, reviews, or other materials (&quot;Contributions&quot;). Contributions may be visible to other users and possibly through third-party sites. Any Contributions you provide may be treated as non-confidential and non-proprietary.
        </p>
        <p className="mb-2 leading-relaxed">You represent and warrant that:</p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li>You own or have rights to your Contributions.</li>
          <li>Contributions do not infringe third-party intellectual property rights.</li>
          <li>You have consent from identifiable individuals appearing in your Contributions.</li>
          <li>Contributions are not false, misleading, illegal, or abusive.</li>
          <li>Contributions are not spam, pyramid schemes, or unauthorized advertising.</li>
          <li>Contributions are not obscene, harassing, defamatory, hateful, or otherwise objectionable.</li>
          <li>Contributions do not ridicule, intimidate, or abuse others.</li>
          <li>Contributions comply with applicable law, including child protection laws.</li>
          <li>Contributions do not violate privacy or publicity rights of others.</li>
          <li>Contributions do not include offensive comments targeting race, gender, religion, nationality, disability, or sexual orientation.</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">10. CONTRIBUTION LICENSE</h2>
        <p className="mb-4 leading-relaxed">
          By posting Contributions, you grant us a worldwide, perpetual, irrevocable, non-exclusive, transferable, royalty-free license to use, reproduce, distribute, display, perform, and adapt your Contributions in any media or format, for any lawful purpose.
        </p>
        <p className="mb-4 leading-relaxed">
          This license includes our right to use your name, trademarks, or likeness in connection with the Contributions. You waive any moral rights to the extent permitted by law.
        </p>
        <p className="mb-4 leading-relaxed">
          You retain ownership of your Contributions, but we are not responsible for statements or representations contained in them. You are solely liable for your Contributions, and you agree not to hold us accountable for them.
        </p>
        <p className="mb-8 leading-relaxed">
          We reserve the right, at our discretion, to edit, reclassify, or remove Contributions at any time without notice. We are not obligated to monitor user Contributions.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">11. GUIDELINES FOR REVIEWS</h2>
        <p className="mb-2 leading-relaxed">
          We may provide areas within the Services where users can post reviews or ratings. When submitting a review, you agree that:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          <li>You have firsthand experience with the subject of the review.</li>
          <li>Your review does not include offensive language, hate speech, or profanity.</li>
          <li>Your review does not contain discriminatory content related to race, religion, gender, age, sexual orientation, disability, or similar categories.</li>
          <li>Your review does not reference illegal activity.</li>
          <li>You are not affiliated with competitors if posting negative reviews.</li>
          <li>You will not make conclusions regarding the legality of conduct.</li>
          <li>You will not post false or misleading statements.</li>
          <li>You will not organize campaigns to encourage others to post positive or negative reviews.</li>
        </ol>
        <p className="mb-4 leading-relaxed">
          We reserve the right to accept, reject, or remove reviews at our discretion. We are not obligated to screen or delete reviews, even if considered inappropriate. Reviews do not represent our opinions and are not endorsed by us. We disclaim responsibility for any reviews and resulting claims, damages, or liabilities.
        </p>
        <p className="mb-8 leading-relaxed">
          By posting a review, you grant us a perpetual, worldwide, royalty-free, sublicensable license to use, reproduce, modify, translate, transmit, display, and distribute your review content.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">12. MOBILE APPLICATION LICENSE</h2>

        <h3 className="text-lg font-medium mt-6 mb-2">Use License</h3>
        <p className="mb-2 leading-relaxed">
          If you access the Services through our mobile application, we grant you a limited, revocable, non-exclusive, non-transferable license to install and use the App on your devices, and to access the App strictly in line with these Terms.
        </p>
        <p className="mb-2 leading-relaxed">You may not:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Reverse engineer, decompile, or decrypt the App except as allowed by law.</li>
          <li>Modify, translate, or create derivative works based on the App.</li>
          <li>Use the App in violation of applicable laws.</li>
          <li>Remove or obscure copyright or proprietary notices.</li>
          <li>Use the App for unauthorized commercial purposes.</li>
          <li>Make the App available over a network for multiple users.</li>
          <li>Develop competing products using our App or intellectual property.</li>
          <li>Use the App for unsolicited commercial email or spam.</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-2">Apple and Android Devices</h3>
        <p className="mb-2 leading-relaxed">
          If you obtained the App from Apple App Store or Google Play, the following applies:
        </p>
        <ul className="list-disc pl-6 mb-8 space-y-1">
          <li>The license is limited to use on devices running iOS or Android, subject to the App Distributor terms.</li>
          <li>We are responsible for maintenance and support of the App; App Distributors are not.</li>
          <li>Warranty claims must be addressed to us, not the App Distributor.</li>
          <li>You represent that you are not in a U.S. embargoed country and not listed as a prohibited party.</li>
          <li>You must comply with any applicable third-party agreements.</li>
          <li>App Distributors are third-party beneficiaries of these Terms and may enforce them.</li>
        </ul>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">13. SOCIAL MEDIA</h2>
        <p className="mb-4 leading-relaxed">
          You may connect your account with third-party services (&quot;Third-Party Accounts&quot;). By doing so, you authorize us to access and store content from those accounts in line with the settings of the Third-Party provider.
        </p>
        <p className="mb-2 leading-relaxed">You confirm that:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>You are entitled to disclose your Third-Party Account information to us.</li>
          <li>Sharing this information does not breach any agreements with the third-party provider.</li>
          <li>We are not responsible for content accuracy, legality, or non-infringement of Social Network Content.</li>
        </ul>
        <p className="mb-4 leading-relaxed">
          Your relationship with any Third-Party provider is governed solely by your agreement with them.
        </p>
        <p className="mb-8 leading-relaxed">
          You may disable connections to Third-Party Accounts at any time. We will attempt to delete any associated data stored on our servers, except for basic account identifiers.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">14. THIRD-PARTY WEBSITES AND CONTENT</h2>
        <p className="mb-4 leading-relaxed">
          The Services may include links to third-party websites or display third-party content (&quot;Third-Party Content&quot;). These are not monitored or verified by us, and we are not responsible for their content, accuracy, or practices.
        </p>
        <p className="mb-4 leading-relaxed">
          Accessing Third-Party Content or websites is at your own risk, and these Terms no longer apply once you leave our Services. You should review the terms and policies of any third-party sites you use.
        </p>
        <p className="mb-8 leading-relaxed">
          We disclaim endorsement of third-party products or services, and you agree to hold us harmless from any harm or loss related to such third-party interactions.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">15. ADVERTISERS</h2>
        <p className="mb-8 leading-relaxed">
          We may allow third-party advertisements within the Services. Advertisers are solely responsible for the content of their ads, and our role is limited to providing advertising space. We do not have further obligations or endorsements of advertised products or services.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">16. SERVICES MANAGEMENT</h2>
        <p className="mb-2 leading-relaxed">We reserve the right, but not the obligation, to:</p>
        <ol className="list-decimal pl-6 mb-8 space-y-1">
          <li>Monitor the Services for violations of these Terms.</li>
          <li>Take legal action against violators, including reporting to authorities.</li>
          <li>Refuse, restrict, or disable access to any Contributions we consider harmful or unlawful.</li>
          <li>Remove content that is excessive in size or otherwise burdensome.</li>
          <li>Manage the Services in a way that protects our rights and ensures proper functioning.</li>
        </ol>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">17. PRIVACY POLICY</h2>
        <p className="mb-4 leading-relaxed">
          We value your privacy and security. Please review our Privacy Policy: <strong>https://injexpro.com/privacy-policy</strong>.
        </p>
        <p className="mb-4 leading-relaxed">
          By using the Services, you agree to the terms of our Privacy Policy, which is incorporated by reference into these Terms.
        </p>
        <p className="mb-8 leading-relaxed">
          Please note: the Services are hosted in <strong>Germany</strong>. If you access the Services from another jurisdiction with different data laws, you consent to transferring your data to that hosting location and to its processing in line with our Privacy Policy.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">18. COPYRIGHT INFRINGEMENTS</h2>
        <p className="mb-2 leading-relaxed">We respect intellectual property rights. If you believe that material on the Services infringes your copyright, notify us immediately with details including:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Your signature (physical or electronic).</li>
          <li>Identification of the copyrighted work.</li>
          <li>Identification of the infringing material and its location.</li>
          <li>Your contact information.</li>
          <li>A statement of good faith belief that use is unauthorized.</li>
          <li>A statement under penalty of perjury that the information provided is accurate and that you are authorized to act.</li>
        </ul>
        <p className="mb-8 leading-relaxed">
          A copy of your notification may be sent to the user responsible for the material. Please note you may be liable for damages if misrepresenting an infringement.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">19. TERM AND TERMINATION</h2>
        <p className="mb-2 leading-relaxed">These Terms remain in force while you use the Services.</p>
        <p className="mb-2 leading-relaxed">We reserve the right, at our sole discretion and without notice, to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Deny access to the Services to any person for any reason.</li>
          <li>Terminate your account if you breach these Terms or applicable law.</li>
          <li>Remove or disable any content you provide.</li>
        </ul>
        <p className="mb-8 leading-relaxed">
          If your account is terminated, you may not create a new account under your own or another name. We also reserve the right to take legal action, including civil, criminal, and injunctive remedies.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">20. MODIFICATIONS AND INTERRUPTIONS</h2>
        <p className="mb-4 leading-relaxed">
          We may modify, suspend, or discontinue the Services at any time, without obligation to update or maintain them.
        </p>
        <p className="mb-4 leading-relaxed">
          We cannot guarantee continuous availability of the Services. Interruptions may occur due to maintenance, upgrades, hardware or software issues, or other factors.
        </p>
        <p className="mb-8 leading-relaxed">
          You agree that we are not liable for any loss, damage, or inconvenience caused by interruptions or discontinuance of the Services.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">21. GOVERNING LAW</h2>
        <p className="mb-4 leading-relaxed">
          These Terms are governed by and interpreted in accordance with the laws of Switzerland. The United Nations Convention on Contracts for the International Sale of Goods does not apply.
        </p>
        <p className="mb-4 leading-relaxed">
          If you reside in the EU as a consumer, you also retain the protections granted by the mandatory laws of your home country.
        </p>
        <p className="mb-8 leading-relaxed">
          Both you and <strong>HR Online Consulting LLC</strong> agree to submit to the non-exclusive jurisdiction of the courts of Zurich, Switzerland. This means you may bring a claim in Zurich or in the EU country where you live.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">22. DISPUTE RESOLUTION</h2>

        <h3 className="text-lg font-medium mt-6 mb-2">Informal Negotiations</h3>
        <p className="mb-4 leading-relaxed">
          To reduce disputes and costs, the parties agree to attempt to resolve any disagreement informally for at least thirty (30) days before starting arbitration. Negotiations begin once written notice is given by one party to the other.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-2">Binding Arbitration</h3>
        <p className="mb-2 leading-relaxed">
          Any dispute arising from or related to these Terms shall be finally resolved by arbitration before a single arbitrator, appointed under the rules of the European Court of Arbitration, part of the European Centre of Arbitration in Strasbourg, effective at the time of filing.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Seat of arbitration: Zurich, Switzerland</li>
          <li>Language: English</li>
          <li>Governing law: Switzerland</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-2">Restrictions</h3>
        <p className="mb-2 leading-relaxed">
          Arbitration will only address disputes between you and us individually. To the extent permitted by law:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>No arbitration will be combined with other proceedings.</li>
          <li>No class actions or representative actions are permitted.</li>
          <li>No arbitration may be brought on behalf of the general public.</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-2">Exceptions</h3>
        <p className="mb-2 leading-relaxed">
          The following disputes are excluded from informal negotiations and arbitration:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          <li>Disputes involving enforcement or validity of intellectual property rights.</li>
          <li>Disputes related to theft, piracy, invasion of privacy, or unauthorized use.</li>
          <li>Claims for injunctive relief.</li>
        </ol>
        <p className="mb-8 leading-relaxed">
          If any part of this arbitration clause is found unenforceable, such disputes will be decided by the courts identified under <strong>Governing Law</strong>.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">23. CORRECTIONS</h2>
        <p className="mb-8 leading-relaxed">
          The Services may include information containing typographical errors, inaccuracies, or omissions (e.g., descriptions, pricing, availability). We reserve the right to correct errors and update information at any time without prior notice.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">24. DISCLAIMER</h2>
        <p className="mb-4 leading-relaxed">
          THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE.&quot; YOU AGREE THAT USE OF THE SERVICES IS AT YOUR SOLE RISK. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
        <p className="mb-2 leading-relaxed">
          We do not guarantee that the Services will be error-free, uninterrupted, secure, or accurate. We assume no responsibility for:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          <li>Errors, mistakes, or inaccuracies of content.</li>
          <li>Personal injury or property damage resulting from use of the Services.</li>
          <li>Unauthorized access to or use of our servers or your data.</li>
          <li>Interruptions or cessation of transmissions.</li>
          <li>Bugs, viruses, or malware transmitted by third parties.</li>
          <li>Errors or omissions in content, or loss or damage caused by using any content available through the Services.</li>
        </ol>
        <p className="mb-8 leading-relaxed">
          We do not endorse or guarantee products or services advertised by third parties via the Services. Any dealings with third-party providers are at your own risk.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">25. LIMITATIONS OF LIABILITY</h2>
        <p className="mb-4 leading-relaxed">
          IN NO EVENT SHALL WE, OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES, EVEN IF WE WERE ADVISED OF THE POSSIBILITY.
        </p>
        <p className="mb-4 leading-relaxed">
          OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM, REGARDLESS OF FORM OR THEORY, SHALL BE LIMITED TO THE AMOUNT PAID BY YOU TO US IN THE SIX (6) MONTHS PRIOR TO THE CLAIM.
        </p>
        <p className="mb-8 leading-relaxed">
          Some jurisdictions do not allow limitations on certain liabilities. In such cases, some of the above limitations may not apply to you.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">26. INDEMNIFICATION</h2>
        <p className="mb-2 leading-relaxed">
          You agree to defend, indemnify, and hold harmless <strong>HR Online Consulting LLC</strong>, its affiliates, and their respective officers, agents, partners, and employees from and against any loss, damage, liability, claim, or demand (including reasonable attorney fees) made by a third party due to:
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-1">
          <li>Your Contributions.</li>
          <li>Use of the Services.</li>
          <li>Breach of these Terms.</li>
          <li>Violation of your representations or warranties.</li>
          <li>Infringement of third-party rights, including IP rights.</li>
          <li>Harmful acts toward other users.</li>
        </ol>
        <p className="mb-8 leading-relaxed">
          We may assume exclusive defense at your expense, and you agree to cooperate with us in such defense.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">27. USER DATA</h2>
        <p className="mb-8 leading-relaxed">
          We retain certain data you provide for managing the Services, as well as data about your usage. Although we perform regular backups, you are solely responsible for all data you transmit. We are not liable for any loss or corruption of data, and you waive any claims related to such loss.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">28. ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</h2>
        <p className="mb-4 leading-relaxed">
          By visiting the Services, sending emails, or completing online forms, you consent to receive electronic communications. You agree that all electronic communications—agreements, notices, disclosures—satisfy any legal requirement that such communications be in writing.
        </p>
        <p className="mb-8 leading-relaxed">
          YOU CONSENT TO THE USE OF ELECTRONIC SIGNATURES, CONTRACTS, ORDERS, AND RECORDS, AND TO ELECTRONIC DELIVERY OF DOCUMENTS AND TRANSACTIONS. You waive any rights under laws requiring original signatures or non-electronic records.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">29. CALIFORNIA USERS AND RESIDENTS</h2>
        <p className="mb-8 leading-relaxed">
          If you are a California resident and a complaint with us is not resolved, you may contact the Complaint Assistance Unit of the Division of Consumer Services of the California Department of Consumer Affairs at:<br />
          1625 North Market Blvd., Suite N 112, Sacramento, CA 95834<br />
          Phone: (800) 952-5210 or (916) 445-1254
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">30. MISCELLANEOUS</h2>
        <p className="mb-4 leading-relaxed">
          These Terms and any policies posted on the Services constitute the full agreement between you and us.
        </p>
        <p className="mb-4 leading-relaxed">
          Failure to enforce any provision shall not be considered a waiver. We are not liable for delays or failures due to causes beyond our reasonable control.
        </p>
        <p className="mb-4 leading-relaxed">
          If any provision is found unlawful or unenforceable, the remainder of the Terms will still apply.
        </p>
        <p className="mb-4 leading-relaxed">
          These Terms do not create any joint venture, partnership, employment, or agency relationship. You agree that these Terms will not be construed against us simply because we drafted them.
        </p>
        <p className="mb-8 leading-relaxed">
          You waive any defenses based on the electronic form of these Terms and lack of physical signatures.
        </p>

        <hr className="my-8 border-t" />

        <h2 className="text-xl font-semibold mt-8 mb-4">31. CONTACT US</h2>
        <p className="mb-4 leading-relaxed">
          For questions, complaints, or further information regarding the Services, please contact us at:
        </p>
        <address className="not-italic mb-8 font-medium">
          HR Online Consulting LLC<br />
          550 Kings Mountain, Kings Mountain, NC 28086<br />
          Email: legal@injexpro.com
        </address>
      </article>
    </main>
  );
}
