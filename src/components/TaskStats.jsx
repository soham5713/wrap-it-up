import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

const TaskStats = ({ tasks }) => {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && !task.completed,
  ).length

  const dueSoonTasks = tasks.filter((task) => {
    if (!task.dueDate || task.completed) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const timeDiff = dueDate.getTime() - today.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    return daysDiff >= 0 && daysDiff <= 2
  }).length

  const highPriorityTasks = tasks.filter((task) => task.priority === "high" && !task.completed).length

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="mb-4 font-semibold text-lg">Task Progress</h3>
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            {completedTasks} of {totalTasks} tasks completed
          </span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center rounded-md border bg-card/60 p-4 transition-colors hover:bg-accent/20">
          <div className="mr-3 rounded-full bg-error/20 p-2">
            <AlertCircle className="h-5 w-5 text-error/90" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="font-medium text-lg">{overdueTasks}</p>
          </div>
        </div>

        <div className="flex items-center rounded-md border bg-card/60 p-4 transition-colors hover:bg-accent/20">
          <div className="mr-3 rounded-full bg-warning/20 p-2">
            <Clock className="h-5 w-5 text-warning/90" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Due soon</p>
            <p className="font-medium text-lg">{dueSoonTasks}</p>
          </div>
        </div>

        <div className="flex items-center rounded-md border bg-card/60 p-4 transition-colors hover:bg-accent/20">
          <div className="mr-3 rounded-full bg-success/20 p-2">
            <CheckCircle2 className="h-5 w-5 text-success/90" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">High priority</p>
            <p className="font-medium text-lg">{highPriorityTasks}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskStats

