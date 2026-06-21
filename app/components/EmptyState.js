'use client'
import { Inbox, Calendar, BarChart3, Settings } from 'lucide-react'

const illustrations = {
  givings: Inbox,
  services: Calendar,
  report: BarChart3,
  settings: Settings,
}

export default function EmptyState({ type = 'givings', title, description }) {
  const Icon = illustrations[type] || Inbox
  
  const defaults = {
    givings: {
      title: 'No givings recorded yet',
      description: 'Start by recording your first giving to see it appear here.',
    },
    services: {
      title: 'No services recorded yet',
      description: 'Create a service to begin recording givings.',
    },
    report: {
      title: 'No data recorded',
      description: 'Records from services will appear here.',
    },
    settings: {
      title: 'No settings',
      description: 'Configure your allocations and settings.',
    },
  }

  const config = defaults[type] || defaults.givings
  const finalTitle = title || config.title
  const finalDescription = description || config.description

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
        <Icon size={32} className="text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-content mb-2">{finalTitle}</h3>
      <p className="text-sm text-muted text-center max-w-xs">{finalDescription}</p>
    </div>
  )
}
