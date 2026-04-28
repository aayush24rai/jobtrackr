export default function JobCard({ job, onDelete, onClick, isDragging = false }) {
  const salary =
    job.salary_min || job.salary_max
      ? `$${job.salary_min ? job.salary_min.toLocaleString() : '?'} – $${job.salary_max ? job.salary_max.toLocaleString() : '?'}`
      : null

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-lg p-3.5 border select-none
        ${isDragging ? 'border-indigo-500 shadow-xl' : 'border-gray-700 hover:border-gray-500'}
        ${onClick ? 'cursor-pointer' : ''}
        transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm leading-snug truncate">
            {job.company}
          </div>
          <div className="text-gray-400 text-xs mt-0.5 truncate">{job.role}</div>
        </div>

        {onDelete && (
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); onDelete(job.id) }}
            className="text-gray-600 hover:text-red-400 transition-colors shrink-0 text-xs mt-0.5 leading-none"
            aria-label="Delete job"
          >
            ✕
          </button>
        )}
      </div>

      {salary && (
        <div className="text-xs text-green-400 mt-2 font-medium">{salary}</div>
      )}

      {job.deadline && (
        <div className="text-xs text-gray-500 mt-1.5">
          Due {new Date(job.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}

      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onPointerDown={e => e.stopPropagation()}
          className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 block truncate transition-colors"
        >
          {job.url.replace(/^https?:\/\//, '')}
        </a>
      )}
    </div>
  )
}
