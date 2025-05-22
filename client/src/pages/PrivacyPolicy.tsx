import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect } from "react";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="lead text-xl mb-8">
              At Potential.com, we take the privacy, security, and data protection of our users and clients seriously. 
              This Privacy Policy describes how we collect, use, store, and protect information across our suite of 
              AI Tools, including AI Chatbots and AI Voice Agents (collectively referred to as "AI Tools"). 
              By using our services, you agree to the practices described in this policy.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">1. Who We Are</h2>
            <p>
              Potential.com is a technology company that provides AI-powered empowerment tools hosted on 
              enterprise-grade infrastructure. We are committed to upholding the highest standards of privacy and 
              security in compliance with international regulations, including the General Data Protection Regulation (GDPR).
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">2. Hosting and Infrastructure</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All AI Tools are hosted on Amazon Web Services (AWS) servers located in Europe, benefiting from 
                AWS's robust compliance with ISO 27001, SOC 1/2/3, and other industry-leading certifications.
              </li>
              <li>
                Our infrastructure is designed with enterprise-grade security in mind, including data encryption 
                in transit and at rest.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">3. Data Collection and Use</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">a. Types of Data Collected</h3>
            <p>
              We do not collect or store personally identifiable information (PII) by default. However, in the 
              course of using our AI Tools, users may voluntarily share:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Names</li>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Business inquiries or support issues</li>
            </ul>
            <p className="mt-4">
              In some cases, if our clients explicitly request to collect additional personal data through the AI Tools, 
              we may support this upon mutual agreement and subject to appropriate safeguards, data processing terms, 
              and full compliance with relevant privacy regulations, including GDPR.
            </p>
            <p className="mt-4">
              <strong>Note:</strong> All information is anonymized where possible, and only the minimum necessary 
              non-personal data is processed for each interaction.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">b. Purpose of Data Use</h3>
            <p>
              Data exchanged within our AI Tools is used solely for the purpose of delivering and improving the 
              conversation flow and functionality of the specific conversation session the user is engaged in. 
              It is not used across multiple conversations or retained for purposes beyond the current interaction. 
              It is not used for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>AI model training</li>
              <li>Marketing purposes (unless explicitly requested to)</li>
              <li>Profiling or behavioral tracking (unless explicitly requested to)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">4. Use of Third-Party Large Language Models (LLMs)</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All communication with LLMs is mediated through Potential.com's servers, which include customizable 
                safeguards to control what data is shared.
              </li>
              <li>
                By default, we do not share any personal information with third-party LLM providers unless a client 
                has explicitly requested such sharing and provided informed consent.
              </li>
              <li>Clients may configure their data-sharing preferences at the enterprise level.</li>
              <li>
                All conversations are strictly used to serve end-user interactions and are not retained or used for 
                training by third-party providers.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">5. Data Retention and Deletion</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Data and conversation logs are retained for a maximum of 7 days on our servers, after which they are 
                automatically deleted.
              </li>
              <li>
                Clients can opt-in to longer retention periods by written request and through specific data processing 
                agreements (DPAs).
              </li>
              <li>
                Upon client request, we provide data access, export, and deletion in accordance with GDPR.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">6. Legal Basis for Processing</h2>
            <p>We process personal data based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The legitimate interest of providing and maintaining the service.</li>
              <li>User consent, where applicable (e.g., when inputting personal data).</li>
              <li>Compliance with legal obligations, if required.</li>
              <li>Performance of a contract, when data is necessary for delivering our services.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">7. Your Rights</h2>
            <p>Under GDPR and other applicable laws, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request rectification or deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Withdraw consent at any time (where applicable)</li>
              <li>Data portability in a commonly used, machine-readable format</li>
              <li>File a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at: info@potential.com
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Single Sign-On (SSO)</h3>
            <p>
              Potential.com and its subdomains provide Single Sign-On (SSO) functionality to streamline your login experience. 
              When you use SSO, you will be directed to a third-party authentication service such as Google, Facebook, 
              or another SSO provider, which will authenticate your identity and provide you with access to our sites. 
              These third-party providers may collect and process your personal information according to their own privacy policies.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Use of Google User Data</h3>
            <p>
              Our use of Google user data is limited to the practices disclosed in this Privacy Policy and conforms with 
              Google's Limited Use requirements. When you use Google SSO to access our platform, we collect and use Google 
              user data such as display name, email, and first name to create your user account on our platform. 
              We only use Google user data for the purposes explicitly stated in this policy and do not share this data 
              with unauthorized third parties.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">8. Data Security Measures</h2>
            <p>We apply a layered approach to securing client data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>End-to-end encryption (TLS 1.2+)</li>
              <li>Strict access controls and role-based permissions</li>
              <li>Real-time monitoring and automated incident detection</li>
              <li>Secure APIs with audit logs and rate limiting</li>
              <li>Frequent vulnerability assessments and security audits</li>
              <li>Security training and awareness programs for staff</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4">9. Third-Party Sharing and Cookies</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>We do not sell or rent your personal data to third parties.</li>
              <li>
                We only share data with trusted subprocessors as necessary to provide our services, governed by 
                data processing agreements that ensure GDPR compliance.
              </li>
              <li>
                We may use cookies and similar tracking technologies on our web interfaces, including our domains 
                and subdomains, but NOT when our AI tools are added to clients' websites and applications to improve 
                user experience. Users are prompted to consent to cookie usage, and cookie preferences can be managed anytime.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">Cookies and Web Beacons</h3>
            <p>
              We do use cookies to store information, such as your personal preferences when you visit our sites. 
              This could include only showing you a popup once in your visit or the ability to log in to some of our features, 
              such as forums. We also use third-party advertisements on Potential.com and its subdomains to support our sites.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated 
              revision date. In case of significant changes, we will notify users via email or a notice on our website.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">11. Contact Us</h2>
            <p>
              For any questions or concerns related to this Privacy Policy or data protection practices, please contact:
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

export default PrivacyPolicy;