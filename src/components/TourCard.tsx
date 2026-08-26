import React, { useState } from 'react';
import { Clock, ArrowRight, ShieldCheck, Flame, Users, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  const images = tour.images && tour.images.length > 0
    ? tour.images
    : ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1000'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const title = getLocalizedText(tour.title, currentLang);
  const overview = getLocalizedText(tour.overview, currentLang);
  const location = getLocalizedText(tour.location, currentLang);
  const duration = getLocalizedText(tour.duration, currentLang);
  const categoryLabel = getLocalizedText(tour.categoryLabel, currentLang);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(tour)}
      className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col justify-between group h-full cursor-pointer"
    >
      <div>
        {/* Фотогалерея с бейджами и слайдером */}
        <div className="relative h-60 overflow-hidden bg-slate-900 select-none">
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={activeImageIndex}
              src={images[activeImageIndex]}
              alt={`${title} - photo ${activeImageIndex + 1}`}
              initial={{ opacity: 0.4, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.2 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/25 pointer-events-none" />

          {/* Стрелки переключения (если фоток > 1) */}
          {images.length > 1 && (
            <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
              <button
                type="button"
                onClick={handlePrevImage}
                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90"
                aria-label="Предыдущее фото"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-md transition-transform active:scale-90"
                aria-label="Следующее фото"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Точки-индикаторы */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeImageIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Бейдж популярно */}
          {tour.featured && (
            <div className="absolute top-3.5 left-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 z-10">
              <Flame className="w-3.5 h-3.5 fill-slate-950" />
              <span>{t('tour.popular', 'Популярно')}</span>
            </div>
          )}

          {/* Счетчик мест */}
          <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-slate-100 z-10">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('tour.seats', 'Мест')}: {tour.availableSeats}</span>
          </div>

          {/* Длительность и локация */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold z-10">
            <div className="backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{duration}</span>
            </div>

            <div className="backdrop-blur-md bg-black/50 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{location}</span>
            </div>
          </div>
        </div>

        {/* Контентная часть */}
        <div className="p-6 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200/80 inline-block px-2.5 py-1 rounded-md">
            {categoryLabel}
          </div>

          <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-amber-600 transition-colors">
            {title}
          </h3>

          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
            {overview}
          </p>
        </div>
      </div>

      {/* Футер карточки */}
      <div className="p-6 pt-0 mt-auto">
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {t('tour.price_from', 'Цена от')}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">${tour.priceAdult}</span>
              <span className="text-xs text-slate-500">
                {t('tour.per_person', '/ чел')}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-amber-500 group-hover:text-slate-950 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 shadow-sm group-hover:shadow-md group-hover:shadow-amber-500/20">
            <span>{t('tour.details', 'Подробнее')}</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>

        {/* Маркер без предоплаты */}
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>{t('tour.no_prepayment', 'Без предоплаты • Оплата гиду')}</span>
        </div>
      </div>
    </motion.div>
  );
};