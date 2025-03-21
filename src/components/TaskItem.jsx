"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Clock, Trash, Edit, X, AlertCircle, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { format, isValid } from "date-fns" // Import isValid to check date validity
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const TaskItem = ({ task, onToggleComplete, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(task.text)
  const [editedNotes, setEditedNotes] = useState(task.notes || "")
  const [editedPriority, setEditedPriority] = useState(task.priority || "medium")
  const [editedDueDate, setEditedDueDate] = useState(task.dueDate ? new Date(task.dueDate) : null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return null

    const date = new Date(dateString)
    return isValid(date) ? format(date, "PP") : "Invalid date"
  }

  // Check if a date is overdue
  const isOverdue = () => {
    if (!task.dueDate || task.completed) return false

    const dueDate = new Date(task.dueDate)
    return isValid(dueDate) && dueDate < new Date()
  }

  const handleSave = async () => {
    if (!editedText.trim() || isSaving) return

    setIsSaving(true)
    try {
      await onUpdate(task.id, {
        text: editedText,
        notes: editedNotes,
        priority: editedPriority,
        dueDate: editedDueDate,
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving task", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedText(task.text)
    setEditedNotes(task.notes || "")
    setEditedPriority(task.priority || "medium")
    setEditedDueDate(task.dueDate ? new Date(task.dueDate) : null)
    setIsEditing(false)
  }

  // Update the priorityClasses to use more visually distinct colors
  const priorityClasses = {
    high: "bg-destructive/10 border-destructive/30 hover:bg-destructive/20",
    medium: "bg-warning/10 border-warning/30 hover:bg-warning/20",
    low: "bg-success/10 border-success/30 hover:bg-success/20",
  }

  // Update the component return to use the new priority classes
  return (
    <div
      className={`group relative rounded-lg border p-4 transition-all hover:shadow-md ${
        task.completed
          ? "bg-muted/30 border-muted/50"
          : isOverdue()
            ? "bg-destructive/10 border-destructive/30 hover:bg-destructive/20"
            : `${priorityClasses[task.priority] || "bg-card hover:bg-accent/20"}`
      }`}
    >
      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full rounded-md border p-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              autoFocus
            />
          </div>

          <Textarea
            placeholder="Add notes (optional)"
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className="h-24 text-sm bg-background"
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Priority:</span>
              <Select value={editedPriority} onValueChange={setEditedPriority}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Due:</span>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-sm">
                    {editedDueDate && isValid(editedDueDate) ? format(editedDueDate, "PP") : "Set date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={editedDueDate}
                    onSelect={(date) => {
                      setEditedDueDate(date)
                      setCalendarOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {editedDueDate && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditedDueDate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!editedText.trim() || isSaving}
              className="flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggleComplete(task.id, task.completed)}
                id={`task-${task.id}`}
                className={`mt-1 ${task.completed ? "" : task.priority === "high" ? "text-destructive border-destructive" : task.priority === "medium" ? "text-warning border-warning" : "text-success border-success"}`}
              />
              <div className="space-y-1.5">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`font-medium transition-colors text-base ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.text}
                </label>

                {task.notes && (
                  <p className={`text-sm text-muted-foreground ${task.completed ? "line-through" : ""}`}>
                    {task.notes}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  {task.priority && (
                    <Badge
                      variant="outline"
                      className={`
                        ${
                          task.priority === "high"
                            ? "border-destructive/50 text-destructive bg-destructive/10"
                            : task.priority === "medium"
                              ? "border-warning/50 text-warning bg-warning/10"
                              : "border-success/50 text-success bg-success/10"
                        }
                        ${task.completed ? "opacity-50" : ""}
                      `}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3.5 w-3.5" />
                      <span className={isOverdue() && !task.completed ? "text-destructive font-medium" : ""}>
                        {formatDate(task.dueDate)}
                      </span>
                      {isOverdue() && !task.completed && <AlertCircle className="ml-1 h-3.5 w-3.5 text-destructive" />}
                    </div>
                  )}

                  {task.createdAt && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3.5 w-3.5" />
                      <span>Added {formatDate(task.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-1 opacity-0 transition-all duration-200 group-hover:opacity-100 md:translate-x-2 md:group-hover:translate-x-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                onClick={() => onDelete(task.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TaskItem

