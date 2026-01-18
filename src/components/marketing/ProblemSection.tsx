export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Here's what's happening while you're on site
          </h2>
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Competitor */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h3 className="font-bold text-gray-900">Your Competitor</h3>
              <p className="text-sm text-gray-600">@smithbuilders</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">Posted today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">312 followers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">8 enquiries this week</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">First on Google</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-green-700 font-medium">Getting the calls ✓</p>
              </div>
            </div>
          </div>

          {/* You */}
          <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="font-bold text-gray-900">You</h3>
              <p className="text-sm text-gray-600">No online presence</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Last post: 3 months ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">No website</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Word of mouth only</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Invisible on Google</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-red-600 font-medium">Wondering why it's quiet ✗</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-lg text-gray-600">
            <span className="font-bold text-gray-900">78% of customers</span> look you up online before calling.
            <br />No website? No Instagram? <span className="font-bold">No job.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
