import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { auth as authApi, clearApiKey, setApiKey } from "./api"

interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  authRequired: boolean
  login: (key: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  authRequired: false,
  login: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authRequired, setAuthRequired] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const { required } = await authApi.checkRequired()
      setAuthRequired(required)
      if (!required) {
        setIsAuthenticated(true)
        setIsLoading(false)
        return
      }
      const res = await authApi.check().catch(() => null)
      setIsAuthenticated(res?.status === "ok")
    } catch {
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = useCallback(async (key: string) => {
    setApiKey(key)
    try {
      const res = await authApi.check()
      if (res.status === "ok") {
        setIsAuthenticated(true)
        return true
      }
    } catch {
      clearApiKey()
    }
    return false
  }, [])

  const logout = useCallback(() => {
    clearApiKey()
    setIsAuthenticated(false)
  }, [])

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, authRequired, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
