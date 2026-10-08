import { assetUrl } from './assets';
import { supabase } from '../lib/supabase';

export interface PromoBanner {
  id: number; // 1, 2, 3
  imageUrl: string;
  title: string;
  subtitle: string;
  linkUrl: string;
  badge: string;
}

export const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    imageUrl: assetUrl('banner-promo-1.jpg'),
    title: 'Sembako Nusantara Jepang',
    subtitle: 'Belanja Produk Indonesia Otentik di Seluruh 47 Prefektur Jepang!',
    linkUrl: '/catalog',
    badge: 'PROMO SPESIAL'
  },
  {
    id: 2,
    imageUrl: assetUrl('banner-promo-2.jpg'),
    title: 'Gratis Ongkir Se-Jepang!',
    subtitle: 'Gratis Ongkir Otomatis untuk Belanja Minimal ¥15,000 via Yamato & Sagawa',
    linkUrl: '/catalog',
    badge: 'GRATIS ONGKIR ¥15,000+'
  },
  {
    id: 3,
    imageUrl: assetUrl('banner-promo-3.jpg'),
    title: 'Halal Frozen Food & Bumbu Nusantara',
    subtitle: 'Bakso Sapi, Rendang, Bebek Ungkep, Aneka Sambal & Bumbu Masakan Lengkap',
    linkUrl: '/catalog?category=Frozen+Food',
    badge: '100% HALAL & PRAKTIS'
  }
];

const STORAGE_KEY = 'sn_promo_banners_v1';

/**
 * Mengambil daftar 3 foto sampul / banner promo
 */
export function getStoredPromoBanners(): PromoBanner[] {
  if (typeof window === 'undefined') return DEFAULT_PROMO_BANNERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3);
      }
    }
  } catch (e) {
    console.error('Failed to parse stored promo banners', e);
  }
  return DEFAULT_PROMO_BANNERS;
}

/**
 * Mengambil daftar 3 foto sampul dari Supabase table 'promo_banners' secara realtime/cloud
 */
export async function fetchRemotePromoBanners(): Promise<PromoBanner[]> {
  try {
    if (!supabase) return getStoredPromoBanners();
    const { data, error } = await supabase
      .from('promo_banners')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data && data.length >= 3) {
      const formatted: PromoBanner[] = data.slice(0, 3).map((d: any) => ({
        id: d.id,
        imageUrl: d.image_url,
        title: d.title,
        subtitle: d.subtitle,
        linkUrl: d.link_url || '/catalog',
        badge: d.badge || 'PROMO'
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
        window.dispatchEvent(new CustomEvent('sn_banners_updated', { detail: formatted }));
      }
      return formatted;
    }
  } catch (err) {
    console.warn('Could not fetch remote promo banners from Supabase, using local:', err);
  }
  return getStoredPromoBanners();
}

/**
 * Menyimpan 3 foto sampul / banner promo ke localStorage dan sinkronisasi ke Supabase jika tersedia
 */
export async function savePromoBanners(banners: PromoBanner[]): Promise<{ success: boolean; message: string }> {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(banners));
      // Dispatch custom event to update homepage in real-time
      window.dispatchEvent(new CustomEvent('sn_banners_updated', { detail: banners }));
    }

    // Coba simpan / upsert ke Supabase table 'promo_banners' jika terhubung
    try {
      if (supabase) {
        const payload = banners.map((b) => ({
          id: b.id,
          image_url: b.imageUrl,
          title: b.title,
          subtitle: b.subtitle,
          link_url: b.linkUrl,
          badge: b.badge,
          updated_at: new Date().toISOString()
        }));

        await supabase.from('promo_banners').upsert(payload, { onConflict: 'id' });
      }
    } catch (sbErr) {
      console.warn('Supabase sync info (local saved first):', sbErr);
    }

    return { success: true, message: '3 Banner promo berhasil disimpan dan langsung aktif di Beranda!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menyimpan banner promo.' };
  }
}

/**
 * Mengembalikan banner promo ke pengaturan default
 */
export function resetPromoBanners(): PromoBanner[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('sn_banners_updated', { detail: DEFAULT_PROMO_BANNERS }));
  }
  return DEFAULT_PROMO_BANNERS;
}
