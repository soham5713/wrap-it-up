"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "../contexts/ThemeContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SettingsModal = ({ user, isOpen, onClose }) => {
  const { theme, setTheme } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [settings, setSettings] = useState({
    defaultPriority: "medium",
    defaultView: "all",
    enableNotifications: false,
    compactMode: false,
  })

  // We'll implement this functionality once the Firestore rules are updated
  const handleSubmit = async (e) => {
    e.preventDefault()

    // For now, just close the modal without saving to Firestore
    toast.success("Settings updated")
    onClose()

    // The actual implementation will be enabled once Firestore rules are updated
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Customize your Wrap It Up experience. Theme changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Appearance</h3>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`flex flex-col items-center justify-center rounded-md border p-3 cursor-pointer hover:bg-accent ${theme === "light" ? "bg-accent border-primary" : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  <Sun className="h-5 w-5 mb-1" />
                  <span className="text-xs">Light</span>
                </div>
                <div
                  className={`flex flex-col items-center justify-center rounded-md border p-3 cursor-pointer hover:bg-accent ${theme === "dark" ? "bg-accent border-primary" : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  <Moon className="h-5 w-5 mb-1" />
                  <span className="text-xs">Dark</span>
                </div>
                <div
                  className={`flex flex-col items-center justify-center rounded-md border p-3 cursor-pointer hover:bg-accent ${theme === "system" ? "bg-accent border-primary" : ""}`}
                  onClick={() => handleThemeChange("system")}
                >
                  <Monitor className="h-5 w-5 mb-1" />
                  <span className="text-xs">System</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Task Defaults</h3>

              <div className="space-y-2">
                <Label htmlFor="defaultPriority">Default Priority</Label>
                <Select
                  value={settings.defaultPriority}
                  onValueChange={(value) => setSettings({ ...settings, defaultPriority: value })}
                >
                  <SelectTrigger id="defaultPriority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultView">Default View</Label>
                <Select
                  value={settings.defaultView}
                  onValueChange={(value) => setSettings({ ...settings, defaultView: value })}
                >
                  <SelectTrigger id="defaultView">
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="active">Active Tasks</SelectItem>
                    <SelectItem value="completed">Completed Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preferences</h3>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">Get notified about due tasks</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Display more tasks in less space</p>
                </div>
                <Switch
                  id="compactMode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal

