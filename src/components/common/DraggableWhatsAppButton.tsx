import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { assetUrl } from '../../utils/assets';
import { useLanguage } from '../../context/LanguageContext';

export const DraggableWhatsAppButton: React.FC = () => {
  const { language } = useLanguage();
  const isDraggingRef = useRef<boolean>(false);
  const dragDistanceRef = useRef<number>(0);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
  };

  const handleDrag = (_: any, info: { delta: { x: number; y: number } }) => {
    dragDistanceRef.current += Math.abs(info.delta.x) + Math.abs(info.delta.y);
  };

  const handleDragEnd = () => {
    // Keep isDraggingRef true for a short moment so click event is ignored
    setTimeout(() => {
      isDraggingRef.current = false;
      dragDistanceRef.current = 0;
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    // If dragged even slightly (> 6px), treat as drag instead of click
    if (isDraggingRef.current || dragDistanceRef.current > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Direct tap/click without drag opens WhatsApp chat
    window.open(
      'https://wa.me/6285773875762?text=Halo%20Sembako%20Nusantara,%20saya%20ingin%20bertanya%20mengenai%20produk%20dan%20pemesanan',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.05 }}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      className="fixed bottom-6 right-6 z-50 select-none cursor-grab touch-none"
      style={{ touchAction: 'none' }}
    >
      <div className="relative group flex items-center gap-2">
        {/* Subtle desktop hover tooltip (Non-intrusive, no auto popups) */}
        <div className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-emerald-100 text-[11px] font-bold text-stone-800 pointer-events-none transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            {language === 'JP' ? 'WhatsAppでお問い合わせ' : language === 'EN' ? 'Chat WhatsApp CS' : 'Chat WhatsApp CS'}
          </span>
        </div>

        {/* Directly Draggable WhatsApp Floating Button */}
        <button
          type="button"
          onClick={handleClick}
          aria-label="Chat WhatsApp CS"
          className="relative flex items-center justify-center w-14 h-14 bg-white hover:bg-stone-50 rounded-full shadow-2xl transition-all border-2 border-emerald-400 focus:outline-none cursor-grab active:cursor-grabbing pointer-events-auto"
        >
          {/* Radar Wave Rings (Green Pulse Effect) */}
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

          {/* Drag Grip Indicator */}
          <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs text-[9px] pointer-events-none">
            <span className="material-symbols-outlined text-[10px]">drag_indicator</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
};
