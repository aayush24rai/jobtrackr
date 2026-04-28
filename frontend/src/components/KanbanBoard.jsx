import { useState } from 'react'
import {
  DndContext, DragOverlay, closestCenter,
  PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable,
} from '@dnd-kit/core'
import JobCard from './JobCard'

const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
)
const MoreIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
  </svg>
)

const COLUMNS = [
  { id: 'Wishlist',  title: 'Wishlist',  accent: 'var(--c-wishlist)'  },
  { id: 'Applied',   title: 'Applied',   accent: 'var(--c-applied)'   },
  { id: 'Interview', title: 'Interview', accent: 'var(--c-interview)' },
  { id: 'Offer',     title: 'Offer',     accent: 'var(--c-offer)'     },
  { id: 'Rejected',  title: 'Rejected',  accent: 'var(--c-rejected)'  },
]

function DraggableCard({ job, onCardClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // touch-none prevents scroll conflict on mobile; cursor managed by .card CSS
      style={{ touchAction: 'none' }}
    >
      <JobCard
        job={job}
        isDragging={isDragging}
        onClick={() => onCardClick(job)}
      />
    </div>
  )
}

function Column({ col, jobs, onCardClick, onAddTo }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div className={`col${isOver ? ' drag-over' : ''}`}>
      <div className="col-header">
        <span className="accent" style={{ background: col.accent }}/>
        <span className="col-title">{col.title}</span>
        <span className="col-count">{jobs.length}</span>
        <span className="spacer" style={{ flex: 1 }}/>
        <span className="col-actions">
          <span title="Add job" onClick={() => onAddTo(col.id)}><PlusIcon/></span>
          <span title="More"><MoreIcon/></span>
        </span>
      </div>

      <div className="col-body" ref={setNodeRef}>
        {jobs.map(job => (
          <DraggableCard key={job.id} job={job} onCardClick={onCardClick} />
        ))}
        {jobs.length === 0 && (
          <div className="col-empty">Drop a card here</div>
        )}
      </div>

      <div className="col-add" onClick={() => onAddTo(col.id)}>
        <PlusIcon/> New job
      </div>
    </div>
  )
}

export default function KanbanBoard({ jobs, onStatusChange, onCardClick, onAddTo }) {
  const [activeJob, setActiveJob] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart({ active }) {
    setActiveJob(jobs.find(j => j.id === active.id) ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveJob(null)
    if (!over) return
    const job = jobs.find(j => j.id === active.id)
    if (job && job.status !== over.id) {
      onStatusChange(job.id, over.id)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveJob(null)}
    >
      <div className="board">
        {COLUMNS.map(col => (
          <Column
            key={col.id}
            col={col}
            jobs={jobs.filter(j => j.status === col.id)}
            onCardClick={onCardClick}
            onAddTo={onAddTo}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeJob && (
          <div style={{ width: 240, transform: 'rotate(1.5deg)', opacity: 0.95 }}>
            <JobCard job={activeJob} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
