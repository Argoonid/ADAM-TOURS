import React, { useState } from 'react';
import { Flame, ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TopPromoBannerProps {
  text: string;
  onActionClick?: () => void;
}

export const TopPromoBanner: React.FC<TopPromoBannerProps> = ({ text, onActionClick }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-slate-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-md relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center w-full">
        <span className="bg-slate-950 text-amber-400 p-1 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shrink-0 px-2.5 py-0.5">
          <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 
          {t('topPromo.badge', 'Акция')}
        </span>
        <span className="truncate font-black">{text}</span>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className="hidden sm:flex items-center gap-1 underline font-black hover:opacity-80 transition-opacity ml-2 shrink-0 cursor-pointer"
          >
            <span>{t('topPromo.select_tour', 'Выбрать тур')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-slate-950/70 hover:text-slate-950 p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
        title={t('topPromo.close_title', 'Закрыть баннер')}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};