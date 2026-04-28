const STATS = [
  { status: 'Wishlist',     color: 'text-gray-300',   bg: 'bg-gray-700/50'      },
  { status: 'Applied',      color: 'text-blue-300',   bg: 'bg-blue-900/30'      },
  { status: 'Interviewing', color: 'text-amber-300',  bg: 'bg-amber-900/30'     },
  { status: 'Offer',        color: 'text-green-300',  bg: 'bg-green-900/30'     },
  { status: 'Rejected',     color: 'text-red-300',    bg: 'bg-red-900/30'       },
]

export default function StatsBar({ jobs }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {STATS.map(({ status, color, bg }) => {
        const count = jobs.filter(j => j.status === status).length
        return (
          <div key={status} className={`${bg} rounded-xl p-4 border border-white/5`}>
            <div className={`text-3xl font-bold ${color}`}>{count}</div>
            <div className="text-gray-400 text-sm mt-1">{status}</div>
          </div>
        )
      })}
    </div>
  )
}
