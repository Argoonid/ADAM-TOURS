import React from 'react';
import { Flame, ArrowRight, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PromoBannerProps {
  onBookClick: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onBookClick }) => {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-slate-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Декоративный размытый свечение на фоне */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-amber-500/20 to-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
        
        <div className="space-y-4 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
            <span>{t('promo.badge', 'Спецпредложение недели')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {t('promo.title', 'Скидка 10% на вторую экскурсию в одном заказе!')}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t(
              'promo.description',
              'Выбирайте комбо: например, морскую прогулку и вечернее сафари. Забронируйте сейчас через WhatsApp — зафиксируйте лучшую цену без предоплаты.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0">
          <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl w-full sm:w-auto text-left">
            <Gift className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">{t('promo.code_label', 'Промокод')}</div>
              <div className="text-sm font-extrabold text-amber-400 tracking-wider">ELINA-SUMMER</div>
            </div>
          </div>

          <button
            onClick={onBookClick}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
          >
            <span>{t('promo.select_btn', 'Выбрать туры')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};