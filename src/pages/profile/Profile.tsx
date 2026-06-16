import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { updateProfile } from '@/services/profileService'
import { updateProfileSchema } from '@/lib/validations/profile'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import type { Profile } from '@/types/profile.types'

/**
 * ProfilePage — Halaman profil dengan mode view & edit
 * 
 * Fitur:
 * - Toggle antara mode view dan edit
 * - Validasi form dengan Zod
 * - Update data ke database + store
 * - Pesan sukses/error yang jelas
 * - Cancel reset ke data asli
 */
export default function ProfilePage() {
  const { profile, user, setProfile } = useAuthStore()

  // State untuk mode
  const [isEditing, setIsEditing] = useState(false)
  
  // State untuk form data
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    full_name: profile?.full_name || '',
    school_name: profile?.school_name || '',
  })
  
  // State untuk menyimpan data asli (untuk cancel)
  const [originalData, setOriginalData] = useState(formData)
  
  // State untuk UI feedback
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Loading state jika profile belum di-fetch
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-50">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          <span>Memuat profil...</span>
        </div>
      </div>
    )
  }

  // Handler: Masuk mode edit
  const handleEdit = () => {
    setOriginalData(formData) // Simpan data asli
    setIsEditing(true)
    setError(null)
    setSuccessMessage(null)
  }

  // Handler: Batal edit (reset ke data asli)
  const handleCancel = () => {
    setFormData(originalData) // Reset ke data asli
    setIsEditing(false)
    setError(null)
  }

  // Handler: Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    // 1. Validasi dengan Zod
    const result = updateProfileSchema.safeParse(formData)
    
    if (!result.success) {
      setError(result.error.errors[0].message)
      setIsLoading(false)
      return
    }

    // 2. Panggil service untuk update database
    const updatedProfile = await updateProfile(profile.id, result.data)

    if (!updatedProfile) {
      setError('Gagal mengupdate profil. Silakan coba lagi.')
      setIsLoading(false)
      return
    }

    // 3. Update store dengan data baru
    setProfile(updatedProfile)
    
    // 4. Update originalData agar cancel berikutnya juga benar
    setOriginalData({
      username: updatedProfile.username,
      full_name: updatedProfile.full_name || '',
      school_name: updatedProfile.school_name || '',
    })
    
    // 5. Keluar dari mode edit
    setIsEditing(false)
    setIsLoading(false)
    
    // 6. Tampilkan pesan sukses
    setSuccessMessage('Profil berhasil diupdate!')
    
    // 7. Hilangkan pesan sukses setelah 3 detik
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Handler: Update field form
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8 text-zinc-50">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Profil Saya</h1>
            <p className="text-zinc-400 mt-1">
              Kelola informasi akun RuangAmbis kamu
            </p>
          </div>
          
          {/* Tombol Edit / Batal */}
          {!isEditing ? (
            <Button
              onClick={handleEdit}
              className="bg-violet-600 hover:bg-violet-500 text-white w-fit"
            >
              ✏️ Edit Profil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-500 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : '💾 Simpan'}
              </Button>
            </div>
          )}
        </div>

        {/* Pesan Sukses */}
        {successMessage && (
          <div className="rounded-md bg-green-950/50 border border-green-800 p-3 text-sm text-green-300 animate-in fade-in slide-in-from-top-2">
            ✅ {successMessage}
          </div>
        )}

        {/* Pesan Error */}
        {error && (
          <div className="rounded-md bg-red-950/50 border border-red-800 p-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-2">
            ❌ {error}
          </div>
        )}

        {/* Card Utama */}
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? 'Edit Informasi' : 'Informasi Akun'}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {isEditing 
                ? 'Ubah data profil kamu di bawah ini' 
                : 'Data profil RuangAmbis kamu'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* MODE VIEW */}
            {!isEditing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <InfoField label="Username" value={`@${profile.username}`} />
                <InfoField label="Email" value={user?.email || '-'} />
                <InfoField label="Nama Lengkap" value={profile.full_name || '-'} />
                <InfoField label="Sekolah" value={profile.school_name || '-'} />
                <InfoField 
                  label="Role" 
                  value={
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      profile.role === 'admin' 
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {profile.role === 'admin' ? '👑 Admin' : '🎓 Siswa'}
                    </span>
                  }
                />
                <InfoField 
                  label="Status" 
                  value={
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                      ● Aktif
                    </span>
                  }
                />
                <InfoField 
                  label="Bergabung" 
                  value={new Date(profile.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  fullWidth
                />
              </div>
            ) : (
              /* MODE EDIT */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email (readonly) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">
                    Email <span className="text-xs text-zinc-500">(tidak bisa diubah)</span>
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-400 cursor-not-allowed"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleFieldChange('username', e.target.value)}
                    placeholder="siswa_123"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-zinc-500">
                    Hanya huruf, angka, dan underscore. Minimal 3 karakter.
                  </p>
                </div>

                {/* Nama Lengkap */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleFieldChange('full_name', e.target.value)}
                    placeholder="Budi Santoso"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={isLoading}
                  />
                </div>

                {/* Nama Sekolah */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Nama Sekolah</label>
                  <input
                    type="text"
                    value={formData.school_name}
                    onChange={(e) => handleFieldChange('school_name', e.target.value)}
                    placeholder="SMA Negeri 1 Jakarta"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    disabled={isLoading}
                  />
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Tambahan */}
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="pt-6">
            <div className="text-sm text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-300">💡 Catatan:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Email tidak bisa diubah dari halaman ini. Hubungi admin jika perlu ganti email.</li>
                <li>Role dan status hanya bisa diubah oleh admin.</li>
                <li>Username harus unik dan tidak boleh sama dengan user lain.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Komponen kecil untuk menampilkan field info di mode view
 */
function InfoField({ 
  label, 
  value, 
  fullWidth = false 
}: { 
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}) {
  return (
    <div className={`space-y-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  )
}