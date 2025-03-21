"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react"

const TaskFilters = ({
  filter,
  setFilter,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 transition-all focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="dueDate">Due date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="high">High only</SelectItem>
              <SelectItem value="medium">Medium only</SelectItem>
              <SelectItem value="low">Low only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export default TaskFilters

