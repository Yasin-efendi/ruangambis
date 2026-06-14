import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/services/supabase"

// Menguji TypeScript: Mendefinisikan tipe data untuk state
interface ClickStats {
  count: number
  lastClicked: string | null
}

// Tipe untuk status koneksi Supabase
type ConnectionStatus = "checking" | "connected" | "error"

export default function App() {
  // Menguji React State dengan tipe data TypeScript
  const [stats, setStats] = useState<ClickStats>({
    count: 0,
    lastClicked: null,
  })

  // Status koneksi Supabase
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Test koneksi Supabase saat component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Supabase connection error:", error)
          setConnectionStatus("error")
          setErrorMessage(error.message)
        } else {
          console.log("✅ Supabase connected successfully!", data)
          setConnectionStatus("connected")
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setConnectionStatus("error")
        setErrorMessage(err instanceof Error ? err.message : "Unknown error")
      }
    }

    testConnection()
  }, [])

  const handleIncrement = () => {
    setStats({
      count: stats.count + 1,
      lastClicked: new Date().toLocaleTimeString(),
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-50 antialiased">
      {/* Menguji Shadcn Card & Tailwind CSS */}
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 text-zinc-50 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            Status Instalasi
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Jika kamu melihat kartu ini dengan rapi, instalasi kamu berjalan lancar.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 py-4">
          {/* Indikator Keberhasilan Teknologi */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
            <div className="rounded-md bg-violet-500/10 p-2 text-violet-400 border border-violet-500/20">
              ⚡ Vite OK
            </div>
            <div className="rounded-md bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
              🔷 TS OK
            </div>
            <div className="rounded-md bg-teal-500/10 p-2 text-teal-400 border border-teal-500/20">
              🎨 Shadcn OK
            </div>
          </div>

          {/* Indikator Koneksi Supabase */}
          <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800">
            <div className="text-sm text-zinc-400 mb-2">Supabase Connection:</div>
            {connectionStatus === "checking" && (
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
                <span className="text-sm">Checking connection...</span>
              </div>
            )}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-2 text-green-400">
                <div className="h-4 w-4 rounded-full bg-green-400"></div>
                <span className="text-sm font-semibold">✅ Connected</span>
              </div>
            )}
            {connectionStatus === "error" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-400">
                  <div className="h-4 w-4 rounded-full bg-red-400"></div>
                  <span className="text-sm font-semibold">❌ Error</span>
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-300 bg-red-950/50 p-2 rounded">
                    {errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Area Pengujian State & TypeScript */}
          <div className="rounded-lg bg-zinc-950 p-4 border border-zinc-800 space-y-2">
            <div className="text-sm text-zinc-400">Total Klik:</div>
            <div className="text-3xl font-extrabold text-white">{stats.count}</div>
            {stats.lastClicked && (
              <p className="text-xs text-zinc-500 animate-pulse">
                Klik terakhir pada: {stats.lastClicked}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          {/* Menguji Shadcn Button */}
          <Button
            onClick={handleIncrement}
            className="w-full bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
          >
            Test State & Interaksi
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}