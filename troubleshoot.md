Sebelum install shadcn
1. Generate File Konfigurasi Tailwind
npx tailwindcss init -p

2. Atur Target File (Content Template)
tailwind.config.js
Vite + React (atau Vue)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

3. Tambahkan Direktif Tailwind ke CSS Utama
src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

4. Install Shadcn!
npx shadcn@latest init


Error#1
√ Select a component library » Base
√ Which preset would you like to use? » Nova
✔ Preflight checks.
✔ Verifying framework. Found Vite.
✔ Validating Tailwind CSS.
✖ Validating import alias.

Could not find valid path aliases or package imports for init.
Configure path aliases in tsconfig.json or imports in package.json, then run init again.
Learn more at https://ui.shadcn.com/docs/installation/manual#configure-import-aliases. 

Solusi#1
1. Edit tsconfig.json (atau tsconfig.app.json)
Buka file konfigurasi TypeScript kamu, lalu tambahkan properti baseUrl dan paths di dalam compilerOptions:
{
  "compilerOptions": {
    // ... kode kamu yang lain
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

2. Install Node Types (Agar Vite tidak error)
npm install -D @types/node

3. Edit vite.config.ts
import path from "path"
import react from "@vitejs/react-plugin" // atau plugin svelte/vue sesuai projectmu
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

Halaman tes cek vite, typescript, shadcn
2. Ubah File src/App.tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Menguji TypeScript: Mendefinisikan tipe data untuk state
interface ClickStats {
  count: number;
  lastClicked: string | null;
}

export default function App() {
  // Menguji React State dengan tipe data TypeScript
  const [stats, setStats] = useState<ClickStats>({
    count: 0,
    lastClicked: null,
  })

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

3. Jalankan Server Dev
npm run dev


### masalah shadcn yang menambahkan komponen di root/@/components/ui
tsconfig.app.json dan tsconfig.json harus memiliki konfigurasi path

  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },