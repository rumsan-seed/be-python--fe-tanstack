import { Outlet, createRootRoute } from "@tanstack/react-router"
import { AuthProvider, useAuth } from "@/lib/auth"
import { LoginScreen } from "@/components/login"
import { Toaster } from "sonner"

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

function AuthGate() {
  const { isLoading, isAuthenticated, authRequired } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (authRequired && !isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <>
      <div className="mx-auto min-h-svh max-w-2xl">
        <Outlet />
      </div>
      <Toaster position="bottom-center" />
    </>
  )
}
