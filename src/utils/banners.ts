import { assetUrl } from './assets';
import { supabase } from '../lib/supabase';

export interface PromoBanner {
  id: number; // 1, 2, 3
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  title: string;
  subtitle: string;
  linkUrl: string;
  badge: string;
  duration?: number; // In milliseconds: 10000 for video, 5000 for image
}

export function isVideoBanner(banner?: PromoBanner | null): boolean {
  if (!banner) return false;
  if (banner.mediaType === 'video') return true;
  const url = (banner.videoUrl || banner.imageUrl || '').toLowerCase();
  return (
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.endsWith('.ogg') ||
    url.endsWith('.mov') ||
    url.includes('.mp4?') ||
    url.startsWith('data:video/')
  );
}

export function getBannerMediaUrl(banner?: PromoBanner | null): string {
  if (!banner) return '';
  if (isVideoBanner(banner)) {
    return banner.videoUrl ? assetUrl(banner.videoUrl) : assetUrl(banner.imageUrl);
  }
  return assetUrl(banner.imageUrl);
}

export const DEFAULT_PROMO_BANNERS: PromoBanner[] = [
  {
    id: 1,
    mediaType: 'image',
    imageUrl: assetUrl('banner-promo-1.jpg'),
    title: 'Sembako Nusantara Jepang',
    subtitle: 'Belanja Produk Indonesia Otentik di Seluruh 47 Prefektur Jepang!',
    linkUrl: '/catalog',
    badge: 'PROMO SPESIAL',
    duration: 4000 // Khusus foto 4 detik
  },
  {
    id: 2,
    mediaType: 'video',
    videoUrl: assetUrl('Cartoon_cat_carrying_groceries_1080p_20261009100736.mp4'),
    imageUrl: assetUrl('banner-promo-2.jpg'), // Thumbnail / Fallback
    title: 'Gratis Ongkir Se-Jepang!',
    subtitle: 'Gratis Ongkir Otomatis untuk Belanja Minimal ¥15,000 via Yamato & Sagawa',
    linkUrl: '/catalog',
    badge: 'VIDEO PROMO',
    duration: 10000 // Khusus video stay 10 detik sesuai permintaan
  },
  {
    id: 3,
    mediaType: 'image',
    imageUrl: assetUrl('banner-promo-3.jpg'),
    title: 'Halal Frozen Food & Bumbu Nusantara',
    subtitle: 'Bakso Sapi, Rendang, Bebek Ungkep, Aneka Sambal & Bumbu Masakan Lengkap',
    linkUrl: '/catalog?category=Frozen+Food',
    badge: '100% HALAL & PRAKTIS',
    duration: 4000 // Khusus foto 4 detik
  }
];

const STORAGE_KEY = 'sn_promo_banners_v2';
const LEGACY_STORAGE_KEY = 'sn_promo_banners_v1';

/**
 * Mengambil daftar 3 banner promo (mendukung foto & video)
 */
export function getStoredPromoBanners(): PromoBanner[] {
  if (typeof window === 'undefined') return DEFAULT_PROMO_BANNERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        return parsed.slice(0, 3).map((p: PromoBanner, idx: number) => {
          const def = DEFAULT_PROMO_BANNERS[idx];
          const isVid = p.mediaType === 'video' || isVideoBanner(p) || (def && isVideoBanner(def));
          // Jika duration sebelumnya 5000 (default lama), ubah ke 4000 untuk foto
          let duration = p.duration;
          if (!isVid && (!duration || duration === 5000)) {
            duration = 4000;
          } else if (isVid && (!duration || duration === 5000)) {
            duration = 10000;
          }
          return {
            ...p,
            id: p.id || idx + 1,
            mediaType: isVid ? 'video' : 'image',
            imageUrl: p.imageUrl ? assetUrl(p.imageUrl) : def?.imageUrl || assetUrl(`banner-promo-${idx + 1}.jpg`),
            videoUrl: p.videoUrl ? assetUrl(p.videoUrl) : (isVid ? (def?.videoUrl || p.imageUrl) : undefined),
            duration,
            title: p.title || def?.title || '',
            subtitle: p.subtitle || def?.subtitle || '',
            linkUrl: p.linkUrl || '/catalog',
            badge: p.badge || (isVid ? 'VIDEO PROMO' : 'PROMO')
          };
        });
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
      const formatted: PromoBanner[] = data.slice(0, 3).map((d: any, idx: number) => {
        const def = DEFAULT_PROMO_BANNERS[idx];
        const isVid = d.media_type === 'video' || (d.video_url && isVideoBanner({ imageUrl: d.video_url, id: d.id, title: '', subtitle: '', linkUrl: '', badge: '' })) || (def && isVideoBanner(def));
        let duration = d.duration;
        if (!isVid && (!duration || duration === 5000)) {
          duration = 4000;
        } else if (isVid && (!duration || duration === 5000)) {
          duration = 10000;
        }
        return {
          id: d.id,
          mediaType: isVid ? 'video' : 'image',
          imageUrl: d.image_url ? assetUrl(d.image_url) : def?.imageUrl || assetUrl(`banner-promo-${idx + 1}.jpg`),
          videoUrl: d.video_url ? assetUrl(d.video_url) : (isVid ? def?.videoUrl : undefined),
          duration,
          title: d.title || def?.title,
          subtitle: d.subtitle || def?.subtitle,
          linkUrl: d.link_url || '/catalog',
          badge: d.badge || (isVid ? 'VIDEO PROMO' : 'PROMO')
        };
      });

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
 * Menyimpan 3 foto/video sampul / banner promo ke localStorage dan sinkronisasi ke Supabase jika tersedia
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
          video_url: b.videoUrl || null,
          media_type: b.mediaType || (isVideoBanner(b) ? 'video' : 'image'),
          duration: b.duration || (isVideoBanner(b) ? 10000 : 5000),
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
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('sn_banners_updated', { detail: DEFAULT_PROMO_BANNERS }));
  }
  return DEFAULT_PROMO_BANNERS;
}

