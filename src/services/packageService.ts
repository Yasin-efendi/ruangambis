import { supabase } from '@/services/supabase'
import type { PackageWithDetails, Subtest } from '@/types/tryout.types'

/**
 * Ambil semua paket try-out yang aktif
 * Include: subtes dan total jumlah soal
 * 
 * @returns Array of PackageWithDetails (bisa kosong jika tidak ada paket aktif)
 */
export async function getActivePackages(): Promise<PackageWithDetails[]> {
  try {
    console.log('🔍 Fetching active packages...') // <-- DEBUG
    
    // 1. Query semua paket aktif
    const { data: packages, error: packagesError } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        duration_min,
        is_active,
        created_at,
        subtests (
          id,
          package_id,
          title,
          order_index,
          created_at
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    console.log('📦 Raw packages data:', packages) // <-- DEBUG
    console.log('❌ Packages error:', packagesError) // <-- DEBUG

    if (packagesError) {
      console.error('Error fetching packages:', packagesError)
      return []
    }

    if (!packages || packages.length === 0) {
      console.log('⚠️ No packages found') // <-- DEBUG
      return []
    }

    // 2. Untuk setiap paket, hitung total soal
    const packagesWithDetails: PackageWithDetails[] = await Promise.all(
      packages.map(async (pkg) => {
        // Query jumlah soal untuk paket ini
        const { count, error: countError } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .in(
            'subtest_id',
            (pkg.subtests || []).map((s: Subtest) => s.id)
          )

        if (countError) {
          console.error('Error counting questions:', countError)
        }

        return {
          id: pkg.id,
          title: pkg.title,
          duration_min: pkg.duration_min,
          is_active: pkg.is_active,
          created_at: pkg.created_at,
          subtests: pkg.subtests || [],
          total_questions: count || 0,
        }
      })
    )

    return packagesWithDetails
  } catch (err) {
    console.error('getActivePackages error:', err)
    return []
  }
}

/**
 * Ambil detail paket tertentu berdasarkan ID
 * Include: subtes dan total jumlah soal
 * 
 * @param packageId - ID paket yang ingin diambil
 * @returns PackageWithDetails jika ditemukan, null jika tidak ada
 */
export async function getPackageById(
  packageId: string
): Promise<PackageWithDetails | null> {
  try {
    // 1. Query paket berdasarkan ID
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select(`
        id,
        title,
        duration_min,
        is_active,
        created_at,
        subtests (
          id,
          package_id,
          title,
          order_index,
          created_at
        )
      `)
      .eq('id', packageId)
      .single()

    if (pkgError) {
      if (pkgError.code === 'PGRST116') {
        console.warn(`Package not found: ${packageId}`)
        return null
      }
      console.error('Error fetching package:', pkgError)
      return null
    }

    if (!pkg) {
      return null
    }

    // 2. Hitung total soal
    const { count, error: countError } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .in(
        'subtest_id',
        (pkg.subtests || []).map((s: Subtest) => s.id)
      )

    if (countError) {
      console.error('Error counting questions:', countError)
    }

    return {
      id: pkg.id,
      title: pkg.title,
      duration_min: pkg.duration_min,
      is_active: pkg.is_active,
      created_at: pkg.created_at,
      subtests: pkg.subtests || [],
      total_questions: count || 0,
    }
  } catch (err) {
    console.error('getPackageById error:', err)
    return null
  }
}