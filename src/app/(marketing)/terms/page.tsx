import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | ByTrade',
  description: 'Terms of service for ByTrade',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Last updated: January 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using ByTrade&apos;s services, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              ByTrade provides website creation, hosting, and social media management services
              for tradespeople and construction businesses. Our services include website building,
              automated social media posting, and lead management tools.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p className="mb-2">You are responsible for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorised access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Content Ownership</h2>
            <p>
              You retain ownership of all content you upload to our platform, including photos,
              text, and business information. By using our services, you grant us a licence to
              use this content to provide our services, including posting to your social media accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Upload illegal, offensive, or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Use our services to spam or harass others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Payment Terms</h2>
            <p>
              Subscription fees are billed in advance on a monthly or annual basis. Payments are
              processed securely through Stripe. You may cancel your subscription at any time,
              but refunds are provided at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Social Media Integration</h2>
            <p>
              When you connect social media accounts, you authorise us to post content on your behalf.
              You are responsible for ensuring you have the right to post all content and that it
              complies with each platform&apos;s terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ByTrade shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting from your use of
              our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time for violation
              of these terms or for any other reason at our discretion. Upon termination, your
              right to use our services will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>
              We may modify these terms at any time. Continued use of our services after changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
            <p>
              These terms are governed by the laws of England and Wales. Any disputes shall be
              resolved in the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>
              For questions about these Terms of Service, please contact us at hello@bytrade.uk
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
