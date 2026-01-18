import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: "I used to stress about Instagram. Now I just take photos and forget about it. Three months in and I've had to put my prices up because I've got too much work.",
    name: 'Dave',
    company: 'DAXA Construction',
    location: 'Bristol',
  },
  {
    quote: "Website looks proper professional. Customers actually comment on it when they call. The social media stuff is a bonus - I don't do anything and my Instagram's always active.",
    name: 'Mike',
    company: 'M&S Electrical',
    location: 'Manchester',
  },
  {
    quote: "Best money I spend each month. Used to pay a marketing girl £400 to post twice a week. This does 5 posts for £199 and I don't have to brief anyone.",
    name: 'Steve',
    company: 'Premier Plastering',
    location: 'London',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Builders who stopped worrying about marketing
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6">&quot;{testimonial.quote}&quot;</p>

              {/* Author */}
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">
                  {testimonial.company} · {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
