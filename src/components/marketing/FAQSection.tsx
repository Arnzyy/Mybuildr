'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How long until my site is live?',
    answer: '7 days or less. Usually 5. We\'ll send you a link to review before it goes live.',
  },
  {
    question: 'What if I\'m not on Instagram or Facebook?',
    answer: 'No problem. We\'ll help you set them up - takes 5 minutes. Or just start with a website and add socials later.',
  },
  {
    question: 'Do I need to write captions and hashtags?',
    answer: 'Nope. Our AI writes them for you based on your trade and location. You literally just upload a photo.',
  },
  {
    question: 'What if I want to change something on my site?',
    answer: 'On Pro and Full Package, you can edit anytime in the admin panel. Or just email us and we\'ll do it - usually same day.',
  },
  {
    question: 'Can I use my own domain name?',
    answer: 'Yes. We\'ll set it up for you at no extra cost. Or you can use a free subdomain like yourname.trade-sites.co.uk.',
  },
  {
    question: 'What if I already have a website?',
    answer: 'We can migrate it or rebuild it. Same price. Your old site stays live until the new one\'s ready.',
  },
  {
    question: 'Is there a contract?',
    answer: 'No. Month to month. Cancel anytime with one email. No cancellation fees, no hassle.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions builders ask
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
