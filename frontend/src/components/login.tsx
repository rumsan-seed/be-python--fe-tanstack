import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"

export function LoginScreen() {
  const { login } = useAuth()
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const ok = await login(key)
    setLoading(false)
    if (!ok) setError("Invalid API key")
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#f0f0f0] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">AS</span>
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-[#1a1a1a]">App Seed</CardTitle>
            <CardDescription>Enter your API key to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="password"
                placeholder="API Key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                disabled={loading || !key}
                className="w-full bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl h-10"
              >
                {loading ? "Checking..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
