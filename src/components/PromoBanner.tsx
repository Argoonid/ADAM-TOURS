import React from 'react';
import { Flame, ArrowRight, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PromoBannerProps {
  onBookClick: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onBookClick }) => {
  const { t } = useTranslation();

  return (
    <section className="py-14 bg-gradient-to-b from-white via-amber-50/40 to-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10 bg-white border border-amber-200/80 rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
        
        <div className="space-y-4 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-rose-600 fill-rose-600 animate-bounce" />
            <span>{t('promo.badge', 'Спецпредложение недели')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {t('promo.title', 'Скидка 10% на вторую экскурсию в одном заказе!')}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {t(
              'promo.description',
              'Выбирайте комбо: например, морскую прогулку и вечернее сафари. Забронируйте сейчас через WhatsApp — зафиксируйте лучшую цену без предоплаты.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 p-4 rounded-2xl w-full sm:w-auto text-left shadow-2xs">
            <Gift className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <div className="text-[11px] text-amber-800/80 font-medium">{t('promo.code_label', 'Промокод')}</div>
              <div className="text-sm font-black text-amber-900 tracking-wider">SHARM-SUMMER</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBookClick}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-105 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <span>{t('promo.select_btn', 'Выбрать туры')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};