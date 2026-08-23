import React from 'react';
import { ShieldCheck, MapPin, Sparkles, PhoneCall, ArrowRight, Compass } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  const { t } = useTranslation();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative min-h-[82vh] flex items-center justify-center bg-gradient-to-b from-amber-50/70 via-white to-sky-50/40 text-slate-900 overflow-hidden pt-16 pb-20 border-b border-slate-200/80">
      {/* Декоративные световые круги фона */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-amber-200/40 via-rose-100/30 to-sky-200/40 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-7"
      >
        {/* Бейдж */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>{t('hero.badge', '№1 Экскурсии в Шарм-эль-Шейхе без предоплаты')}</span>
          </div>
        </motion.div>

        {/* Заголовок */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-slate-950 text-balance">
          {t('hero.title_part1', 'Откройте Египет по-новому:')} <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600">
            {t('hero.title_highlight', 'Ярко, Безопасно, Выгодно')}
          </span>
        </motion.h1>

        {/* Подзаголовок */}
        <motion.p variants={itemVariants} className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          {t('hero.subtitle', 'Морские прогулки, пустынное сафари и исторические туры. Забронируйте место за 1 минуту без предоплаты с оплатой в автобусе!')}
        </motion.p>

        {/* Кнопка перехода */}
        <motion.div variants={itemVariants} className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={onExploreClick}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-105 text-slate-950 font-black text-base sm:text-lg px-9 py-4.5 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer overflow-hidden"
          >
            <Compass className="w-6 h-6 text-slate-950 group-hover:rotate-45 transition-transform duration-300" />
            <span>{t('hero.cta_button', 'Перейти в каталог экскурсий')}</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Гарантии */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700 max-w-3xl mx-auto font-semibold">
          <div className="flex items-center justify-center gap-2 bg-white/80 py-2.5 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('hero.feature1', 'Без предоплаты')}</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white/80 py-2.5 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{t('hero.feature2', 'Трансфер из отеля')}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 bg-white/80 py-2.5 px-3 rounded-xl border border-slate-200/60 shadow-2xs">
            <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('hero.feature3', 'Поддержка 24/7')}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};