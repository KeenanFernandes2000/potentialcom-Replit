import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const TermsOfUse = () => {
  // Refresh AOS animations on route change
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.refresh();
    }
  }, []);

  return (
    <div className="font-inter min-h-screen">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mb-8">
              <p className="font-semibold text-xl mb-2">ATTENTION:</p>
              <p>
                BY USING THIS WEBSITE ("SITE"), YOU AGREE AND AFFIRM THAT YOU HAVE READ AND ACCEPT THESE TERMS OF USE. 
                IF YOU DO NOT ACCEPT THESE TERMS OF USE, YOU ARE NOT AUTHORIZED TO USE THIS SITE. THESE TERMS OF USE 
                GOVERN YOUR USE OF THE SITE, ANY CONTENT (SUCH AS TEXT, DATA, INFORMATION, SOFTWARE, GRAPHICS, OR 
                PHOTOGRAPHS) THAT POTENTIAL FZ-LLC, ("POTENTIAL FZ-LLC WEBSITE") MAY MAKE AVAILABLE THROUGH THE SITE 
                (COLLECTIVELY, "MATERIALS") AND ANY SERVICES THAT POTENTIAL FZ-LLC MAY MAKE AVAILABLE THROUGH THE SITE 
                (COLLECTIVELY, "SERVICES").
              </p>
            </div>

            <p className="lead">
              Your use of the "Potential FZ-LLC" Website forms a legal agreement between you and "Potential FZ-LLC" 
              and is subject to the terms of that agreement as stated in these Terms of Use. You acknowledge and agree 
              that "Potential FZ-LLC" may stop (permanently or temporarily) providing the "Potential FZ-LLC" Website 
              to you or to users generally, at "Potential FZ-LLC's" sole discretion, without prior notice to you. 
              You may stop using the "Potential FZ-LLC" Website at any time. You do not need to specifically inform 
              "Potential FZ-LLC" when you stop using the "Potential FZ-LLC" Website.
            </p>

            <p>
              Content of, and/or opinions expressed on, the "Potential FZ-LLC" Website and in any corresponding 
              comments are the personal opinions of the original authors, not of "Potential FZ-LLC". The content is 
              provided for informational purposes only and is not meant to be an endorsement or representation by 
              "Potential FZ-LLC" or any other party.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Use of Potential FZ-LLC</h2>
            <p>
              Potential FZ-LLC authorizes you to use the Potential FZ-LLC Website only for your own personal, 
              non-commercial purposes. The use of "Potential FZ-LLC" Website for any public or commercial purpose 
              (including, without limitation, on another site or through a networked computer environment) without 
              an express written agreement with POTENTIAL FZ-LLC WEBSITE is strictly prohibited. If you make copies 
              of any of the Materials, you must retain on any such copies all copyright and other proprietary notices 
              contained in the original Materials.
            </p>

            <p>
              You agree to use Potential FZ-LLC only for purposes that are permitted by (a) the Terms of Use and 
              (b) any applicable law, regulation or generally accepted practices or guidelines in the relevant 
              jurisdictions. You agree not to access (or attempt to access) any of the Potential FZ-LLC Website 
              by any means other than through the interface that is provided by Potential FZ-LLC, unless you have 
              been specifically allowed to do so in a separate agreement with Potential FZ-LLC.
            </p>

            <p>
              POTENTIAL FZ-LLC WEBSITE reserves the right (but shall have no obligation) to pre-screen, review, 
              flag, filter, modify, refuse or remove any or all content from the Potential FZ-LLC Website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Access</h2>
            <p>
              You are responsible for obtaining and maintaining all equipment and services needed for access to 
              and use of the Potential FZ-LLC Website. You are responsible for maintaining the confidentiality 
              of your Potential FZ-LLC Website password and you are solely responsible for all activities that 
              occur under your password. You agree to notify Potential FZ-LLC immediately of any unauthorized 
              use of your password or any other breach of security related to the Potential FZ-LLC Website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Prohibited uses</h2>
            <p>
              You agree not to use the Potential FZ-LLC Website (a) in a manner that violates any local, state, 
              national, foreign, or international statute, regulation, rule, order, treaty, or other law; 
              (b) to stalk, harass, or harm another individual; (c) to impersonate any person or entity or 
              otherwise misrepresent your affiliation with a person or entity; or (d) to interfere with or 
              disrupt the Potential FZ-LLC Website or servers or networks connected to the Potential FZ-LLC Website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Termination</h2>
            <p>
              Potential FZ-LLC may terminate, suspend, or modify your registration with, or access to, all or part 
              of the Potential FZ-LLC Website, without notice, at any time and for any reason. You may discontinue 
              your participation in and access to the Potential FZ-LLC Website at any time. If you breach any of 
              these Terms of Use, your authorization to use the Potential FZ-LLC Website automatically terminates 
              and you agree to immediately destroy any downloaded or printed content obtained from the Potential FZ-LLC Website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Disclaimers</h2>
            <p>
              THE Potential FZ-LLC Website ARE PROVIDED "AS IS" AND "WITH ALL FAULTS" AND THE ENTIRE RISK AS TO 
              THE QUALITY AND PERFORMANCE OF THE POTENTIAL FZ-LLC WEBSITE IS WITH YOU, INCLUDING, WITHOUT LIMITATION, 
              RISKS ASSOCIATED WITH THE PRESENCE OF ADWARE, VIRUSES, SPYWARE, AND/OR WORMS, ETC. SHOULD THE MATERIALS 
              OR SERVICES PROVE DEFECTIVE, YOU, AND NOT POTENTIAL FZ-LLC WEBSITE, ASSUME THE ENTIRE COST OF ALL 
              NECESSARY SERVICING AND REPAIR.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Limitation of Liability</h2>
            <p>
              IN NO EVENT WILL ANY OF THE POTENTIAL FZ-LLC WEBSITE PARTIES BE LIABLE FOR (A) ANY INDIRECT, SPECIAL, 
              CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES OR (B) ANY DAMAGES WHATSOEVER IN EXCESS OF ONE HUNDRED 
              UNITED STATES (US$100.00) DOLLARS (INCLUDING, WITHOUT LIMITATION, THOSE RESULTING FROM LOSS OF REVENUES, 
              LOST PROFITS, LOSS OF GOODWILL, LOSS OF USE, BUSINESS INTERRUPTION, OR OTHER INTANGIBLE LOSSES), 
              ARISING OUT OF OR IN CONNECTION WITH THE POTENTIAL FZ-LLC WEBSITE.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">User submissions</h2>
            <p>
              Certain areas of the Potential FZ-LLC Website may permit you to submit feedback, information, data, 
              text, software, music, sound, photographs, graphics, video, messages, or other materials (each, a 
              "User Submission"). By submitting a User Submission; whether blog posts contributed via RSS, blog 
              posts written directly on the site, or comments, the contributor agrees to give Potential FZ-LLC 
              Website a perpetual, non-exclusive license to the content that Potential FZ-LLC Website can use across 
              its sites and other locations.
            </p>

            <p>By submitting any User Submission, you represent and warrant that:</p>

            <ul className="list-disc pl-6 space-y-2">
              <li>You are at least 18 years old;</li>
              <li>
                You own all rights in your user submissions (including, without limitation, all rights to the audio, 
                video, or digital recording and the performance contained in your user submissions) or, alternatively, 
                you have acquired all necessary rights in your user submissions to enable you to grant to Potential 
                FZ-LLC website the rights in your user submissions described herein;
              </li>
              <li>
                You have paid and will pay in full all license fees, clearance fees, and other financial obligations, 
                of any kind, arising from any use or commercial exploitation of your user submissions;
              </li>
              <li>
                You are the individual pictured and/or heard in your user submissions or, alternatively, you have 
                obtained permission from each person (including consent from parents or guardians for any individual 
                under the age of eighteen (18)) who appears and/or is heard in your user submissions to grant the 
                rights to Potential FZ-LLC website described herein;
              </li>
              <li>
                Your user submissions do not infringe the copyright, trademark, patent, trade secret, or other 
                intellectual property rights, privacy rights, or any other legal or moral rights of any third party;
              </li>
              <li>You voluntarily agree to waive all "moral rights" that you may have in your user submission;</li>
              <li>Any information contained in your user submission is not known by you to be false, inaccurate, or misleading;</li>
              <li>
                Your user submission does not violate any law (including, but not limited to, those governing 
                export control, consumer protection, unfair competition, anti-discrimination, or false advertising);
              </li>
              <li>
                Your user submission is not, and may not reasonably be considered to be, defamatory, libelous, 
                hateful, racially, ethnically, religiously, or otherwise biased or offensive, unlawfully threatening, 
                or unlawfully harassing to any individual, partnership, or corporation, vulgar, pornographic, 
                obscene, or invasive of another's privacy;
              </li>
              <li>You were not and will not be compensated or granted any consideration by any third party for submitting your user submission;</li>
              <li>
                Your user submission does not incorporate materials from a third party web site, or addresses, 
                email addresses, contact information, or phone numbers (other than your own);
              </li>
              <li>Your user submission does not contain any viruses, worms, spyware, adware, or other potentially damaging programs or files;</li>
              <li>Your user submission does not contain or constitute any unsolicited or unauthorized advertising, promotional materials, junk mail, spam, chain letters, pyramid schemes, or any other form of solicitation;</li>
              <li>You are solely responsible for the content of all information you contribute, link to, or otherwise upload to Potential FZ-LLC website;</li>
              <li>You release and indemnify Potential FZ-LLC and sponsors of Potential FZ-LLC from any claims and/or liability related to your use of those website.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Modifications to Terms of Use</h2>
            <p>
              Potential FZ-LLC reserves the right to modify these Terms of Use at any time and without prior notice. 
              You should visit this page periodically to review the current Terms of Use. Your continued use of the 
              Potential FZ-LLC Website following the posting of any changes to the Terms of Use constitutes acceptance 
              of those changes.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Use, please contact:
            </p>
            <p className="mt-4">
              Potential.com<br />
              Email: info@potential.com<br />
              Website: https://www.potential.com
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUse;