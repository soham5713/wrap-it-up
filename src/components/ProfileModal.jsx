"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateUserProfile } from "../firebase"
import { toast } from "sonner"
import { User, Camera, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ProfileModal = ({ user, isOpen, onClose, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewURL, setPreviewURL] = useState(user?.photoURL || "")

  useEffect(() => {
    if (isOpen) {
      setDisplayName(user?.displayName || "")
      setPhotoURL(user?.photoURL || "")
      setPreviewURL(user?.photoURL || "")
    }
  }, [isOpen, user])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await updateUserProfile({
        displayName: displayName.trim() || null,
        photoURL: photoURL || null,
      })

      onProfileUpdate()
      toast.success("Profile updated successfully")
      onClose()
    } catch (error) {
      console.error("Error updating profile", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handlePhotoURLChange = (e) => {
    const url = e.target.value
    setPhotoURL(url)
    setPreviewURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewURL} alt={displayName || user?.email} />
                <AvatarFallback className="text-lg">{getInitials(displayName || user?.displayName)}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm">
                <Camera className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoURL">Profile Picture URL</Label>
              <Input
                id="photoURL"
                placeholder="https://example.com/avatar.jpg"
                value={photoURL}
                onChange={handlePhotoURLChange}
              />
              <p className="text-xs text-muted-foreground">Enter a URL to an image for your profile picture</p>
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

export default ProfileModal

