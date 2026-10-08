import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetUrl } from '../../utils/assets';
import { useLanguage } from '../../context/LanguageContext';

export const DraggableWhatsAppButton: React.FC = () => {
  const { language } = useLanguage();
  const [showDragNotice, setShowDragNotice] = useState<boolean>(false);
  const [noticeCount, setNoticeCount] = useState<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);

  // Scheduling drag hint tooltips:
  // 1st time: 10 seconds after web opened
  // 2nd time: 20 seconds after 1st info (at t = 30s)
  // Total strictly 2 times only!
  useEffect(() => {
    // 1st notification at 10 seconds
    const timer1 = setTimeout(() => {
      setShowDragNotice(true);
      setNoticeCount(1);

      // Auto close 1st notification after 5.5 seconds
      const hideTimer1 = setTimeout(() => {
        setShowDragNotice(false);

        // 2nd notification 20 seconds after 1st info (at t = 30s)
        const timer2 = setTimeout(() => {
          setShowDragNotice(true);
          setNoticeCount(2);

          // Auto close 2nd notification after 5.5 seconds
          const hideTimer2 = setTimeout(() => {
            setShowDragNotice(false);
          }, 5500);

          return () => clearTimeout(hideTimer2);
        }, 14500); // 10s + 5.5s + 14.5s = 30s (exactly 20s after first notice opened)

        return () => clearTimeout(timer2);
      }, 5500);

      return () => clearTimeout(hideTimer1);
    }, 10000);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    // Hide notice immediately if user is already dragging
    setShowDragNotice(false);
  };

  const handleDrag = (_: any, info: { delta: { x: number; y: number } }) => {
    dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y);
  };

  const handleDragEnd = () => {
    // Small timeout to prevent click from firing immediately after drag
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If dragged more than 5px, do not open link
    if (isDraggingRef.current || dragDistanceRef.current > 6) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const getNoticeText = () => {
    if (language === 'JP') {
      return {
        title: '💡 アイコンを移動できます',
        desc: '画面が隠れないよう、このWhatsAppアイコンをお好きな位置へドラッグ（スワイプ）して移動できます。',
        tip: 'ドラッグで自由に移動 ↕️'
      };
    }
    if (language === 'EN') {
      return {
        title: '💡 This icon is draggable!',
        desc: 'Drag and move this WhatsApp button anywhere on screen so it won’t block the live order banner.',
        tip: 'Drag anywhere ↕️'
      };
    }
    return {
      title: '💡 Icon WA Ini Bisa Digeser!',
      desc: 'Sentuh & geser icon WhatsApp ini ke posisi mana saja agar tidak menghalangi live banner pesanan.',
      tip: 'Bisa digeser ke mana saja ↔️'
    };
  };

  const txt = getNoticeText();

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end select-none cursor-grab touch-none"
    >
      {/* 2-Time Educational Tooltip Information Bubble */}
      <AnimatePresence>
        {showDragNotice && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="mb-3 max-w-[270px] sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-400 text-stone-800 relative z-30 filter drop-shadow-xl"
          >
            {/* Header info with gesture icon */}
            <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                <span className="material-symbols-outlined text-base text-emerald-600 animate-pulse">
                  pan_tool
                </span>
                <span>{txt.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDragNotice(false)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded-full hover:bg-stone-100 transition-colors"
                title="Tutup info"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Description */}
            <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed font-medium">
              {txt.desc}
            </p>

            {/* Badge pill */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
              <span>{txt.tip}</span>
              <span className="text-stone-400 font-normal">
                ({noticeCount}/2)
              </span>
            </div>

            {/* Downward triangle pointer pointing to WA icon */}
            <div className="absolute -bottom-2 right-6 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-emerald-400 rotate-45 transform"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button Wrapper */}
      <div className="relative group flex items-center gap-2">
        {/* Hover Pill on Desktop */}
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-xl border border-emerald-100 text-[11px] font-bold text-stone-800 pointer-events-none transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Chat WhatsApp CS</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 font-normal">
            Geser ↕
          </span>
        </div>

        {/* WhatsApp Floating Circle Button */}
        <a
          href="https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp (Bisa digeser)"
          onClick={handleClick}
          className="relative flex items-center justify-center w-14 h-14 bg-white hover:bg-stone-50 rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 border-2 border-emerald-300 pointer-events-auto"
        >
          {/* Radar Wave Rings (Green Radar Pulse Effect) */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 pointer-events-none"></span>
          <span className="absolute -inset-1.5 rounded-full bg-emerald-400 opacity-20 animate-pulse pointer-events-none"></span>

          {/* Official WhatsApp Icon Image */}
          <img
            src={assetUrl('whatsapp-icon.png')}
            alt="WhatsApp CS"
            className="w-9 h-9 object-contain relative z-10 drop-shadow-xs pointer-events-none"
            draggable={false}
          />

          {/* Active Online Green Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full z-20 animate-pulse"></span>

          {/* Drag Handle Hint Dots (Tiny Subtle Visual Cue) */}
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs text-[9px] pointer-events-none">
            <span className="material-symbols-outlined text-[10px]">drag_indicator</span>
          </span>
        </a>
      </div>
    </motion.div>
  );
};
