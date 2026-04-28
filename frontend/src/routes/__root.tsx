import { Outlet, createRootRoute } from "@tanstack/react-router"
import { AuthProvider, useAuth } from "@/lib/auth"
import { LoginScreen } from "@/components/login"
import { AppShell } from "@/components/layout/app-shell"
import { IconSidebar } from "@/components/layout/icon-sidebar"
import { Toaster } from "sonner"
import { FileText } from "lucide-react"

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
      <div className="flex min-h-svh items-center justify-center bg-[#f0f0f0]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (authRequired && !isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <>
      <AppShell
        sidebar={
          <IconSidebar
            navItems={[{ icon: <FileText size={20} />, to: "/" }]}
            avatar="https://i.pravatar.cc/32?img=33"
            footerLabel="App Seed"
          />
        }
      >
        <Outlet />
      </AppShell>
      <Toaster position="bottom-center" />
    </>
  )
}
