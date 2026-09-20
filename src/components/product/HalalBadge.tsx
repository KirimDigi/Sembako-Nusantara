import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const HalalBadge: React.FC<{ isFrozen?: boolean }> = ({ isFrozen }) => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold shadow-xs">
        <span className="material-symbols-outlined text-xs">verified</span>
        <span>{t('halal_verified')}</span>
      </span>
      {isFrozen && (
        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold">
          <span className="material-symbols-outlined text-xs">ac_unit</span>
          <span>{t('frozen_badge')}</span>
        </span>
      )}
    </div>
  );
};
