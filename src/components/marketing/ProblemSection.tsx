import { TrendingUp, TrendingDown, Phone, Search, Instagram, Globe, Clock, Users } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="py-20 md:py-32 bg-gray-900 text-white overflow-hidden">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className="text-orange-500 font-semibold mb-4 tracking-wide uppercase text-sm">The Reality Check</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Right now, someone's searching<br />
            <span className="text-gray-400">"builders near me"</span>
          </h2>
          <p className="text-xl text-gray-400">
            They'll call whoever shows up first. Is that you?
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Competitor Card - Success */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Your Competitor</h3>
                    <p className="text-gray-400 text-sm">@smithbuilders</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">WINNING</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Instagram className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Posted today</p>
                    <p className="text-xs text-gray-500">Kitchen refit in Bromley</p>
                  </div>
                  <span className="text-green-400 text-sm font-medium">+23 likes</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Search className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Page 1 on Google</p>
                    <p className="text-xs text-gray-500">"builders bromley"</p>
                  </div>
                  <span className="text-green-400 text-sm font-medium">#3</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Enquiries this week</p>
                    <p className="text-xs text-gray-500">From website & socials</p>
                  </div>
                  <span className="text-green-400 text-sm font-medium">8 calls</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Users className="w-5 h-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Following</p>
                    <p className="text-xs text-gray-500">Growing every week</p>
                  </div>
                  <span className="text-green-400 text-sm font-medium">847</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-green-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Booked solid for 6 weeks
                </p>
              </div>
            </div>
          </div>

          {/* You Card - Struggling */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">You</h3>
                    <p className="text-gray-400 text-sm">No online presence</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">INVISIBLE</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Instagram className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Last post</p>
                    <p className="text-xs text-gray-500">Can't remember when</p>
                  </div>
                  <span className="text-red-400 text-sm font-medium">3 months</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Globe className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Website</p>
                    <p className="text-xs text-gray-500">Customers can't find you</p>
                  </div>
                  <span className="text-red-400 text-sm font-medium">None</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Search className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">Google ranking</p>
                    <p className="text-xs text-gray-500">"builders [your area]"</p>
                  </div>
                  <span className="text-red-400 text-sm font-medium">Nowhere</span>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-xl">
                  <Clock className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">New enquiries</p>
                    <p className="text-xs text-gray-500">Relying on word of mouth</p>
                  </div>
                  <span className="text-red-400 text-sm font-medium">Quiet</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-red-400 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full" />
                  Waiting for the phone to ring
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-orange-500/10 rounded-2xl p-8 border border-orange-500/20 text-center">
            <p className="text-5xl md:text-6xl font-bold text-white mb-2">78%</p>
            <p className="text-xl text-gray-300 mb-4">of customers look you up online before calling</p>
            <p className="text-gray-400">
              No website? No Instagram? <span className="text-orange-500 font-semibold">They're calling someone else.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
