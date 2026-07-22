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
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center bg-slate-950 text-white overflow-hidden pt-16 pb-16">
      {/* Фоновое изображение */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=2000"
          alt="Egypt background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8"
      >
        {/* Маленький бэйдж */}
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{t('hero.badge', '№1 Экскурсии в Шарм-эль-Шейхе без предоплаты')}</span>
          </div>
        </motion.div>

        {/* Заголовок */}
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-balance">
          {t('hero.title_part1', 'Откройте Египет по-новому:')} <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-cyan-400">
            {t('hero.title_highlight', 'Ярко, Безопасно, Выгодно')}
          </span>
        </motion.h1>

        {/* Подзаголовок */}
        <motion.p variants={itemVariants} className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-normal leading-relaxed">
          {t('hero.subtitle', 'Морские прогулки, пустынное сафари и исторические туры. Забронируйте место за 1 минуту без предоплаты с оплатой в автобусе!')}
        </motion.p>

        {/* Кнопка перехода к каталогу вместо поиска */}
        <motion.div variants={itemVariants} className="pt-2 flex justify-center">
          <button
            onClick={onExploreClick}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-base sm:text-lg px-9 py-4.5 rounded-2xl transition-all duration-300 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer overflow-hidden"
          >
            <Compass className="w-6 h-6 text-slate-950 group-hover:rotate-45 transition-transform duration-300" />
            <span>{t('hero.cta_button', 'Перейти в каталог экскурсий')}</span>
            <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Гарантии */}
        <motion.div variants={itemVariants} className="pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('hero.feature1', 'Без предоплаты')}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{t('hero.feature2', 'Трансфер из отеля')}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-400" />
            <span>{t('hero.feature3', 'Поддержка 24/7')}</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};