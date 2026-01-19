import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import BillingPortalButton from '@/components/admin/BillingPortalButton'
import { PRICING } from '@/lib/constants'
import { Check } from 'lucide-react'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const currentPlan = PRICING[company.tier as keyof typeof PRICING]
  const allPlans = [PRICING.starter, PRICING.pro, PRICING.full]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Billing
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">{currentPlan.name}</p>
            <p className="text-gray-600">&pound;{currentPlan.price}/month</p>
          </div>

          {company.stripe_customer_id && (
            <BillingPortalButton customerId={company.stripe_customer_id} />
          )}
        </div>
      </div>

      {/* All plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isCurrent = plan.id === company.tier

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                isCurrent ? 'border-orange-500' : 'border-gray-200'
              }`}
            >
              {isCurrent && (
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded mb-4">
                  CURRENT PLAN
                </span>
              )}

              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 my-4">
                &pound;{plan.price}<span className="text-base font-normal text-gray-500">/mo</span>
              </p>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && company.stripe_customer_id && (
                <BillingPortalButton
                  customerId={company.stripe_customer_id}
                  label={plan.price > currentPlan.price ? 'Upgrade' : 'Change Plan'}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Help */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
        <p className="text-gray-600 text-sm">
          Contact us at <a href="mailto:hello@bytrade.co.uk" className="text-orange-500">hello@bytrade.co.uk</a> for
          any billing questions or to request a change to your subscription.
        </p>
      </div>
    </div>
  )
}
