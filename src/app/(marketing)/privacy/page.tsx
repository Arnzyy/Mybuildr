import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | ByTrade',
  description: 'Privacy policy for ByTrade services',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-xl p-8 shadow-sm space-y-6 text-gray-600">
          <p className="text-sm text-gray-500">Last updated: January 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              ByTrade (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, and safeguard your information when you
              use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-2">We collect information you provide directly to us, including:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Business name and contact information</li>
              <li>Email address and phone number</li>
              <li>Project photos and descriptions</li>
              <li>Social media account information (when you connect accounts)</li>
              <li>Payment information (processed securely via Stripe)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <p className="mb-2">We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Create and manage your website</li>
              <li>Post content to your connected social media accounts</li>
              <li>Process payments and send transaction notifications</li>
              <li>Respond to your enquiries and provide customer support</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Social Media Integration</h2>
            <p>
              When you connect your social media accounts (Instagram, Facebook, Google Business),
              we access only the permissions necessary to post content on your behalf. We store
              access tokens securely and never share your social media credentials with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. We use Supabase
              for database hosting and Cloudflare R2 for image storage. All data transfers are
              encrypted using HTTPS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Sharing</h2>
            <p className="mb-2">We do not sell your personal information. We may share your information with:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Service providers who assist in operating our platform (Stripe, Vercel, Supabase)</li>
              <li>Social media platforms when you authorise us to post on your behalf</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-2">Under GDPR, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and preferences. We do not use
              tracking cookies for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. You can request deletion of your account and data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights,
              please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> hello@bytrade.uk
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
