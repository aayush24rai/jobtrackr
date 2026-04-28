import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import JobCard from './JobCard'

const COLUMNS = [
  { status: 'Wishlist',     headerColor: 'text-gray-400',  borderColor: 'border-gray-600'  },
  { status: 'Applied',      headerColor: 'text-blue-400',  borderColor: 'border-blue-800'  },
  { status: 'Interviewing', headerColor: 'text-amber-400', borderColor: 'border-amber-700' },
  { status: 'Offer',        headerColor: 'text-green-400', borderColor: 'border-green-700' },
  { status: 'Rejected',     headerColor: 'text-red-400',   borderColor: 'border-red-900'   },
]

function DraggableCard({ job, onDelete, onCardClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: job.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing touch-none ${isDragging ? 'opacity-0' : ''}`}
    >
      <JobCard job={job} onDelete={onDelete} onClick={() => onCardClick(job)} />
    </div>
  )
}

function Column({ status, headerColor, borderColor, jobs, onDelete, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex-none w-64">
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-xs font-semibold uppercase tracking-wider ${headerColor}`}>
          {status}
        </span>
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full tabular-nums">
          {jobs.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-40 rounded-xl border-2 p-2 space-y-2 transition-colors duration-150
          ${borderColor}
          ${isOver ? 'bg-indigo-900/20 border-indigo-500' : 'bg-gray-800/40'}`}
      >
        {jobs.map(job => (
          <DraggableCard key={job.id} job={job} onDelete={onDelete} onCardClick={onCardClick} />
        ))}

        {jobs.length === 0 && (
          <div className="flex items-center justify-center h-20 text-gray-700 text-xs">
            {isOver ? 'Drop here' : 'Empty'}
          </div>
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ jobs, onStatusChange, onDelete, onCardClick }) {
  const [activeJob, setActiveJob] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require 5px of movement before a drag starts.
      // This lets clicks on buttons/links inside cards work normally.
      activationConstraint: { distance: 5 },
    })
  )

  function handleDragStart({ active }) {
    setActiveJob(jobs.find(j => j.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveJob(null)
    if (!over) return
    const newStatus = over.id // column id === status string
    const job = jobs.find(j => j.id === active.id)
    if (job && job.status !== newStatus) {
      onStatusChange(job.id, newStatus)
    }
  }

  function handleDragCancel() {
    setActiveJob(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <Column
            key={col.status}
            status={col.status}
            headerColor={col.headerColor}
            borderColor={col.borderColor}
            jobs={jobs.filter(j => j.status === col.status)}
            onDelete={onDelete}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      {/* DragOverlay renders outside the normal DOM flow, always on top.
          The slight rotation makes it visually obvious something is being dragged. */}
      <DragOverlay dropAnimation={null}>
        {activeJob && (
          <div className="rotate-1 opacity-95 w-64">
            <JobCard job={activeJob} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
