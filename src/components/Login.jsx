"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { signInWithGoogle } from "../firebase"
import { toast } from "sonner"

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await signInWithGoogle()
      toast.success("Signed in successfully")
    } catch (error) {
      console.error("Login failed", error)

      // Handle specific error messages
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled. Please try again.")
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Network error. Please check your connection and try again.")
      } else {
        toast.error("Failed to sign in. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border shadow-lg">
      <CardHeader className="space-y-1 pb-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M12 22a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"></path>
            <path d="M9 9h.01"></path>
            <path d="M15 9h.01"></path>
            <path d="M8 6h8"></path>
            <path d="M9 3h6"></path>
          </svg>
        </div>
        <CardTitle className="text-3xl font-bold text-center">Wrap It Up</CardTitle>
        <CardDescription className="text-center text-base">Your personal task management solution</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        <div className="space-y-4">
          <p className="text-center">Please sign in to access your tasks</p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">continue with</span>
            </div>
          </div>
        </div>
        <Button
          onClick={handleLogin}
          className="w-full relative overflow-hidden group h-12 text-base"
          variant="outline"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            <>
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign in with Google
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-primary transition-opacity duration-300"></div>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export default Login

