import { ClipboardList, CheckCircle2 } from "lucide-react"

const EmptyState = ({ filter }) => {
  let message = "You don't have any tasks yet. Add your first task to get started!"
  let icon = ClipboardList

  if (filter === "completed") {
    message = "You don't have any completed tasks yet."
    icon = CheckCircle2
  } else if (filter === "active") {
    message = "You don't have any active tasks. Great job!"
    icon = CheckCircle2
  }

  const Icon = icon

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 p-16 text-center my-6">
      <div className="rounded-full bg-primary/20 p-5 mb-5">
        <Icon className="h-14 w-14 text-primary" />
      </div>
      <h3 className="mb-3 text-xl font-semibold">No tasks found</h3>
      <p className="max-w-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export default EmptyState

