import React from 'react';
import { Clock, ArrowRight, ShieldCheck, Flame, Users, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';

interface TourCardProps {
  tour: Tour;
  onSelect: (tour: Tour) => void;
}

export const TourCard: React.FC<TourCardProps> = ({ tour, onSelect }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Берем первое фото из массива images
  const mainCover = tour.images[0] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000';

  // Извлекаем локализованные тексты экскурсии
  const title = getLocalizedText(tour.title, currentLang);
  const overview = getLocalizedText(tour.overview, currentLang);
  const location = getLocalizedText(tour.location, currentLang);
  const duration = getLocalizedText(tour.duration, currentLang);
  const categoryLabel = getLocalizedText(tour.categoryLabel, currentLang);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(tour)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:border-amber-200/60 transition-all duration-300 flex flex-col justify-between group h-full cursor-pointer"
    >
      <div>
        {/* Картинка и плавающие бэйджи */}
        <div className="relative h-56 overflow-hidden bg-slate-900">
          <img
            src={mainCover}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Бэйдж "Популярно" (если featured === true) */}
          {tour.featured && (
            <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>{t('tour.popular', 'Популярно')}</span>
            </div>
          )}

          {/* Счетчик мест */}
          <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-amber-400/20 z-10">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('tour.seats', 'Мест')}: {tour.availableSeats}</span>
          </div>

          {/* Длительность и Локация */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white/90 text-xs font-semibold z-10">
            <div className="backdrop-blur-sm bg-black/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{duration}</span>
            </div>

            <div className="backdrop-blur-sm bg-black/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Контентная часть */}
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 inline-block px-2.5 py-1 rounded-md">
            {categoryLabel}
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-amber-600 transition-colors">
            {title}
          </h3>

          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
            {overview}
          </p>
        </div>
      </div>

      {/* Футер карточки (Цена + Кнопка) */}
      <div className="p-6 pt-0 mt-auto">
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              {t('tour.price_from', 'Цена от')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">${tour.priceAdult}</span>
              <span className="text-xs text-slate-400">
                {t('tour.per_person', '/ чел')}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 group-hover:bg-amber-500 group-hover:text-slate-950 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-md group-hover:shadow-amber-500/20">
            <span>{t('tour.details', 'Подробнее')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Маркер без предоплаты */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{t('tour.no_prepayment', 'Без предоплаты • Оплата гиду')}</span>
        </div>
      </div>
    </motion.div>
  );
};