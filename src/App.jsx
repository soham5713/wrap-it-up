"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Plus, Trash2, CheckCircle2, AlertTriangle } from "lucide-react"
import { toast, Toaster } from "sonner"
import { useAuth } from "./contexts/AuthContext"
import { useTheme } from "./contexts/ThemeContext"
import Login from "./components/Login"
import ThemeToggle from "./components/ThemeToggle"
import TaskItem from "./components/TaskItem"
import EmptyState from "./components/EmptyState"
import UserProfile from "./components/UserProfile"
import TaskStats from "./components/TaskStats"
import {
  addTask as addTaskToFirestore,
  getUserTasks,
  updateTaskStatus,
  updateTask as updateTaskInFirestore,
  deleteTask as deleteTaskFromFirestore,
  deleteCompletedTasks,
  logOut,
} from "./firebase"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const App = () => {
  const { currentUser } = useAuth()
  const { theme } = useTheme()

  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [indexError, setIndexError] = useState(false)
  const [indexUrl, setIndexUrl] = useState("")

  // New task form state
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskNotes, setNewTaskNotes] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState("medium")
  const [newTaskDueDate, setNewTaskDueDate] = useState(null)
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simplified filter state
  const [filter, setFilter] = useState("all")

  // Stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const activeTasks = totalTasks - completedTasks

  useEffect(() => {
    const fetchTasks = async () => {
      if (currentUser) {
        try {
          setLoading(true)
          setError(null)
          setIndexError(false)
          const userTasks = await getUserTasks(currentUser.uid)
          setTasks(userTasks)
        } catch (error) {
          console.error("Error fetching tasks", error)

          // Check if it's a Firestore index error
          if (error.message && error.message.includes("requires an index")) {
            setIndexError(true)
            // Extract the URL from the error message
            const urlMatch = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]+/)
            if (urlMatch) {
              setIndexUrl(urlMatch[0])
            }
          } else {
            setError("Failed to load tasks. Please try again.")
          }

          toast.error("Error fetching tasks. Please try again later.")
        } finally {
          setLoading(false)
        }
      } else {
        setTasks([])
        setLoading(false)
      }
    }

    fetchTasks()
  }, [currentUser])

  useEffect(() => {
    // Apply simplified filtering
    let result = [...tasks]

    // Filter by status
    if (filter === "active") {
      result = result.filter((task) => !task.completed)
    } else if (filter === "completed") {
      result = result.filter((task) => task.completed)
    }

    // Sort tasks by newest first
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    setFilteredTasks(result)
  }, [tasks, filter])

  const addTask = async (e) => {
    e?.preventDefault()

    if (newTaskText.trim() === "" || isSubmitting) return

    try {
      setIsSubmitting(true)

      const taskData = {
        text: newTaskText,
        notes: newTaskNotes,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
      }

      const newTask = await addTaskToFirestore(currentUser.uid, taskData)

      setTasks((prevTasks) => [newTask, ...prevTasks])

      // Reset form
      setNewTaskText("")
      setNewTaskNotes("")
      setNewTaskPriority("medium")
      setNewTaskDueDate(null)

      toast.success("Task added successfully")
    } catch (error) {
      console.error("Error adding task", error)
      toast.error("Error adding task. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTaskCompletion = async (taskId, completed) => {
    const newStatus = !completed
    const message = newStatus ? "Task completed" : "Task marked as active"

    try {
      await updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: newStatus } : task)))
      toast.success(message)
    } catch (error) {
      console.error("Error updating task status", error)
      toast.error("Failed to update task")
    }
  }

  const updateTask = async (taskId, updatedData) => {
    try {
      await updateTaskInFirestore(taskId, updatedData)
      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, ...updatedData } : task)))
      toast.success("Task updated successfully")
    } catch (error) {
      console.error("Error updating task", error)
      toast.error("Failed to update task")
    }
  }

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskFromFirestore(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
      toast.success("Task deleted successfully")
    } catch (error) {
      console.error("Error deleting task", error)
      toast.error("Failed to delete task")
    }
  }

  const handleClearCompleted = async () => {
    try {
      const deletedCount = await deleteCompletedTasks(currentUser.uid)
      setTasks(tasks.filter((task) => !task.completed))
      toast.success(`${deletedCount} completed ${deletedCount === 1 ? "task has" : "tasks have"} been removed`)
    } catch (error) {
      console.error("Error clearing completed tasks", error)
      toast.error("Failed to clear completed tasks")
    }
  }

  const handleLogout = async () => {
    try {
      await logOut()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Error logging out", error)
      toast.error("Failed to log out")
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <Toaster position="top-center" richColors closeButton theme={theme} />
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Login />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors closeButton theme={theme} />
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary-foreground"
              >
                <path d="M12 22a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
                <path d="M9 9h.01"></path>
                <path d="M15 9h.01"></path>
                <path d="M8 6h8"></path>
                <path d="M9 3h6"></path>
              </svg>
            </div>
            <h1 className="text-xl font-bold">Wrap It Up</h1>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <div className="h-6 w-px bg-border"></div>
            <UserProfile user={currentUser} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 md:px-6 max-w-5xl">
        <div className="space-y-8">
          {indexError && (
            <div className="mb-8 p-4 border border-warning/30 bg-warning/5 dark:bg-warning/10 dark:border-warning/20 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4">
              <AlertTriangle className="h-6 w-6 text-warning flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Firestore Index Required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your tasks are loaded but for optimal performance, you need to create an index in Firestore.
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-warning/10 hover:bg-warning/20 text-foreground border-warning/30 dark:bg-warning/20 dark:hover:bg-warning/30"
                onClick={() => window.open(indexUrl, "_blank")}
              >
                Create Index
              </Button>
            </div>
          )}

          <Card className="border shadow-sm overflow-hidden">
            <form onSubmit={addTask}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add New Task
                </CardTitle>
                <CardDescription>Create a new task with details</CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Input
                      placeholder="What needs to be done?"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="text-base"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Textarea
                      placeholder="Add notes (optional)"
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="h-20"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Due Date (Optional)</label>
                      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal" type="button">
                            {newTaskDueDate ? format(newTaskDueDate, "PPP") : "Select a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={newTaskDueDate}
                            onSelect={(date) => {
                              setNewTaskDueDate(date)
                              setCalendarOpen(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setNewTaskText("")
                    setNewTaskNotes("")
                    setNewTaskPriority("medium")
                    setNewTaskDueDate(null)
                  }}
                >
                  Clear
                </Button>
                <Button type="submit" disabled={!newTaskText.trim() || isSubmitting} className="px-6">
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Adding...
                    </span>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Task Stats Card */}
          <TaskStats tasks={tasks} />

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Your Tasks</CardTitle>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive" disabled={completedTasks === 0}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all completed tasks. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearCompleted}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="mt-4">
                <Tabs
                  defaultValue={filter}
                  value={filter}
                  onValueChange={(value) => setFilter(value)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All ({totalTasks})</TabsTrigger>
                    <TabsTrigger value="active">Active ({activeTasks})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedTasks})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground mt-4">Loading your tasks...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-destructive">
                  <p>{error}</p>
                  <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : filteredTasks.length === 0 ? (
                <EmptyState filter={filter} searchQuery="" />
              ) : (
                <div className="grid gap-4 pt-2">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={toggleTaskCompletion}
                      onDelete={deleteTask}
                      onUpdate={updateTask}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default App

