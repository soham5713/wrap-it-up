"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Settings } from "lucide-react"
import ProfileModal from "./ProfileModal"
import SettingsModal from "./SettingsModal"

const UserProfile = ({ user, onLogout }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user)

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleProfileUpdate = () => {
    // Update the local user state with the latest Firebase user data
    setCurrentUser({
      ...currentUser,
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 rounded-full border px-3 py-1.5 transition-colors hover:bg-accent">
            <Avatar className="h-7 w-7">
              <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || currentUser.email} />
              <AvatarFallback>{getInitials(currentUser.displayName)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium max-w-[120px] truncate">
              {currentUser.displayName || currentUser.email?.split("@")[0]}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsProfileModalOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileModal
        user={currentUser}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />

      <SettingsModal user={currentUser} isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </>
  )
}

export default UserProfile

