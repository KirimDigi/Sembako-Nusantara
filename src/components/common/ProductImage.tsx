import React, { useState } from 'react';
import { Language } from '../../types';

export const getPlaceholderImage = (language?: Language): string => {
  if (language === 'JP') return '/placeholder-upload-jp.svg';
  if (language === 'EN') return '/placeholder-upload-en.svg';
  return '/placeholder-upload.svg';
};

export const resolveProductImage = (src?: string, language?: Language): string => {
  if (!src || src.includes('placeholder-upload')) {
    return getPlaceholderImage(language);
  }
  return src;
};

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  showBadge?: boolean;
  language?: Language;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  loading = 'lazy',
  showBadge = false,
  language = 'ID',
}) => {
  const [imageError, setImageError] = useState(false);
  const placeholderUrl = getPlaceholderImage(language);
  const isPlaceholder = !src || src.includes('placeholder-upload') || imageError;

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      <img
        src={isPlaceholder ? placeholderUrl : src}
        alt={alt}
        loading={loading}
        onError={() => setImageError(true)}
        className={`${className} ${isPlaceholder ? 'object-contain p-2 bg-[#FAF8F5]' : ''}`}
      />
      {showBadge && isPlaceholder && (
        <div className="absolute bottom-1.5 inset-x-2 text-center pointer-events-none">
          <span className="inline-block px-2 py-0.5 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-bold rounded-full tracking-wider uppercase shadow-xs">
            {language === 'JP' ? '画像準備中' : language === 'EN' ? 'Image Uploading' : 'Gambar Proses Upload'}
          </span>
        </div>
      )}
    </div>
  );
};
