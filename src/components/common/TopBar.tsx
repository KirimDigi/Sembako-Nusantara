import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';

export const TopBar: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [liveLocation, setLiveLocation] = useState<string>(() => {
    return localStorage.getItem('sn_user_location') || 'Mendeteksi lokasi...';
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const languages: Language[] = ['ID', 'JP', 'EN'];

  // Popular Japan Prefectures & Regions for quick select
  const popularLocations = [
    'Tokyo, Japan',
    'Osaka, Japan',
    'Nagoya (Aichi), Japan',
    'Okayama, Japan',
    'Fukuoka, Japan',
    'Yokohama (Kanagawa), Japan',
    'Saitama, Japan',
    'Chiba, Japan',
    'Kyoto, Japan',
    'Kobe (Hyogo), Japan',
    'Hiroshima, Japan',
    'Sendai (Miyagi), Japan',
    'Sapporo (Hokkaido), Japan',
    'Okinawa, Japan',
  ];

  // Function to detect live location
  const detectLiveLocation = async () => {
    setIsDetecting(true);

    // Method 1: Try fast IP-based geolocation (no permission popup required)
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.city && data.country_name) {
          const locStr = `${data.city}${data.region ? ` (${data.region})` : ''}, ${data.country_name}`;
          setLiveLocation(locStr);
          localStorage.setItem('sn_user_location', locStr);
          setIsDetecting(false);
          return;
        }
      }
    } catch {
      // Fallback to secondary IP geolocation
      try {
        const res2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(4000) });
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.success && data2.city) {
            const locStr = `${data2.city}, ${data2.country}`;
            setLiveLocation(locStr);
            localStorage.setItem('sn_user_location', locStr);
            setIsDetecting(false);
            return;
          }
        }
      } catch {
        // Continue to fallback
      }
    }

    // Method 2: Browser Geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              const city =
                geoData.address?.city ||
                geoData.address?.state ||
                geoData.address?.province ||
                geoData.address?.county ||
                'Japan';
              const country = geoData.address?.country || 'Japan';
              const locStr = `${city}, ${country}`;
              setLiveLocation(locStr);
              localStorage.setItem('sn_user_location', locStr);
            }
          } catch {
            setLiveLocation('Tokyo, Japan');
          } finally {
            setIsDetecting(false);
          }
        },
        () => {
          // If permission denied or unavailable, use stored or default Tokyo
          const fallback = localStorage.getItem('sn_user_location') || 'Tokyo, Japan';
          setLiveLocation(fallback);
          setIsDetecting(false);
        },
        { timeout: 5000 }
      );
    } else {
      const fallback = localStorage.getItem('sn_user_location') || 'Tokyo, Japan';
      setLiveLocation(fallback);
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    detectLiveLocation();
  }, []);

  const handleSelectLocation = (loc: string) => {
    setLiveLocation(loc);
    localStorage.setItem('sn_user_location', loc);
    setShowLocationModal(false);
  };

  return (
    <>
      <div className="bg-[#111111] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Automatic Live Location & 24 Jam Service Hours */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              title="Klik untuk ubah atau perbarui lokasi Anda"
              className="flex items-center gap-1.5 font-medium hover:text-white group cursor-pointer transition-colors"
            >
              <span className="text-[#c41230] text-sm animate-bounce">📍</span>
              <span className="text-stone-200 group-hover:underline underline-offset-2 flex items-center gap-1">
                <span>{liveLocation}</span>
                {isDetecting && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </span>
              <span className="material-symbols-outlined text-xs text-stone-500 group-hover:text-stone-300">
                expand_more
              </span>
            </button>

            {/* Separator Dot & Operational Hours Info (Buka Setiap Hari 24 Jam) */}
            <span className="text-stone-600">•</span>
            <div className="flex items-center gap-1.5 text-stone-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="font-semibold text-[11px] text-stone-200 whitespace-nowrap">
                {language === 'JP'
                  ? '毎日24時間営業'
                  : language === 'EN'
                  ? 'Open 24/7 Everyday'
                  : 'Buka Setiap Hari 24 Jam'}
              </span>
            </div>
          </div>

          {/* Social Links & Language Switcher */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-4 text-stone-300">
              <a
                href="https://www.instagram.com/sembakonusantara.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-xs hidden sm:inline"
              >
                Instagram
              </a>
              <a
                href="https://wa.me/6285773875762"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors text-xs hidden sm:inline"
              >
                WhatsApp
              </a>
            </div>

            {/* Language Switcher Pill */}
            <div className="flex items-center bg-[#222222] rounded-full p-0.5 border border-white/15 text-[11px] font-semibold">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${
                    language === lang
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-stone-900 relative">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📍</span>
                <h3 className="font-heading font-bold text-lg text-stone-900">
                  Pilih Lokasi Pengiriman
                </h3>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {/* Auto Detect Button */}
              <button
                onClick={() => {
                  detectLiveLocation();
                  setShowLocationModal(false);
                }}
                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-[#c41230] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border border-red-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">my_location</span>
                <span>Deteksi Otomatis Lokasi Saya (GPS / IP)</span>
              </button>

              <div className="text-xs text-stone-500 font-semibold pt-2">
                Atau pilih kota/prefektur Anda di Jepang:
              </div>

              {/* List of Prefectures */}
              <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                {popularLocations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleSelectLocation(loc)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      liveLocation === loc
                        ? 'bg-[#c41230] text-white font-bold'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{loc}</span>
                    {liveLocation === loc && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
