import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Star,
  ChevronDown
} from 'lucide-react';

interface TourItem {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  groupSize: string;
  image: string;
  tag: string;
  description: string;
  highlights: string[];
}

const TOURS: TourItem[] = [
  {
    id: 'safari',
    title: 'Супер Сафари на Квадроциклах',
    category: 'Экстрим & Пустыня',
    price: 25,
    duration: '4 часа',
    groupSize: 'Мини-группы',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    tag: 'Хит продаж',
    description: 'Драйв по Синайской пустыне, катание на верблюдах, закат в бедуинской деревне и восточное шоу с ужином.',
    highlights: ['Квадроциклы 250cc', 'Бедуинский чай', 'Трансфер от отеля']
  },
  {
    id: 'ras-mohammed',
    title: 'Морской круиз в Рас-Мохаммед',
    category: 'Яхты & Дайвинг',
    price: 35,
    duration: '8 часов',
    groupSize: 'До 25 чел',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    tag: 'Все включено',
    description: 'Круиз на белоснежной яхте к коралловым садам заповедника и Белому острову («Египетские Мальдивы»).',
    highlights: ['Обед с морепродуктами', '2 остановки на снорклинг', 'Снаряжение включено']
  },
  {
    id: 'cairo-pyramids',
    title: 'Каир и Великие Пирамиды',
    category: 'История & Культура',
    price: 55,
    duration: '1 день',
    groupSize: 'Комфорт-автобус',
    image: 'https://images.unsplash.com/photo-1503177112294-72c0ae0f6ff0?auto=format&fit=crop&w=1200&q=80',
    tag: 'Топ 1',
    description: 'Легендарные Пирамиды Гизы, загадочный Сфинкс и залы Египетского национального музея с гидом-египтологом.',
    highlights: ['Пирамиды и Сфинкс', 'Русский гид-историк', 'Обед в Каире']
  },
  {
    id: 'canyon-dahab',
    title: 'Цветной Каньон и Дахаб',
    category: 'Приключения',
    price: 30,
    duration: '10 часов',
    groupSize: 'Джип-тур',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    tag: 'Инста-тур',
    description: 'Джип-сафари сквозь разноцветные ущелья каньона, снорклинг в знаменитой Голубой Дыре (Blue Hole) и шопинг в Дахабе.',
    highlights: ['Джип по каньону', 'Blue Hole', 'Обед на берегу моря']
  },
  {
    id: 'dolphins',
    title: 'Шоу Дельфинов & Плавание',
    category: 'Для всей семьи',
    price: 20,
    duration: '2.5 часа',
    groupSize: 'Любой возраст',
    image: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?auto=format&fit=crop&w=1200&q=80',
    tag: 'Семьям',
    description: 'Яркое акробатическое шоу дельфинов и морских котиков. Возможность индивидуального плавания и фото.',
    highlights: ['Билеты включены', 'Трансфер туда/обратно', 'Дети до 5 лет бесплатно']
  }
];

export const ToursScrollLanding: React.FC<{ onSelectTour?: (tourId: string) => void }> = ({ onSelectTour }) => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Горизонтальный сдвиг карточек на основе вертикального скролла
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-78%']);

  return (
    <div className="bg-[#07111e] text-slate-100 selection:bg-[#d4af37] selection:text-black">
      
      {/* 1. HERO СЕКЦИЯ */}
      <section className="relative min-h-screen flex flex-col justify-between items-center px-4 py-12 overflow-hidden bg-gradient-to-b from-[#030914] via-[#07162c] to-[#07111e]">
        {/* Фоновое свечение в цветах логотипа */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#00c49f]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Навбар / Верхний бейдж */}
        <div className="w-full max-w-6xl flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#d4af37] p-0.5 bg-[#0b1d33] flex items-center justify-center shadow-lg shadow-[#d4af37]/20">
              <Compass className="w-5 h-5 text-[#e5c158]" />
            </div>
            <span className="font-bold tracking-wider text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-[#f3e5ab] via-[#d4af37] to-[#aa7c11]">
              SHARM & ADAM TOURS
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#0d223a]/80 border border-[#d4af37]/30 px-3 py-1.5 rounded-full text-xs text-[#e5c158]">
            <Star className="w-3.5 h-3.5 fill-[#d4af37]" />
            <span>4.9 / 5.0 (1,200+ отзывов)</span>
          </div>
        </div>

        {/* Главный заголовок Hero */}
        <div className="max-w-4xl text-center z-10 my-auto py-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#c92a2a]/40 bg-[#c92a2a]/10 text-[#ff8585] text-xs uppercase tracking-widest font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Лучшие экскурсии в Шарм-эль-Шейхе
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Открой настоящий Египет <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e5c158] via-[#f5d77f] to-[#d4af37]">
              за 1 идеальный день
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Индивидуальные и групповые туры: от адреналина сафари и глубин Красного моря до величия древних Пирамид. Трансфер от любого отеля.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#gallery"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-[#07111e] bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#b38728] hover:shadow-lg hover:shadow-[#d4af37]/30 transition-all flex items-center justify-center gap-2 group"
            >
              Смотреть все туры
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-[#00c49f]" /> Страховка включена</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>Русские гиды</span>
            </div>
          </div>
        </div>

        {/* Подсказка о скролле */}
        <div className="flex flex-col items-center gap-2 text-slate-400 text-xs tracking-widest uppercase animate-bounce z-10">
          <span>Листайте вниз</span>
          <ChevronDown className="w-4 h-4 text-[#d4af37]" />
        </div>
      </section>

      {/* 2. ГОРИЗОНТАЛЬНАЯ СКРОЛЛ-ГАЛЕРЕЯ (Pinned Sticky Track) */}
      <section id="gallery" ref={targetRef} className="relative h-[380vh] bg-[#07111e]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          
          {/* Верхняя плашка галереи */}
          <div className="px-6 md:px-16 mb-6 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Каталог программ
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-white">Популярные экскурсии</h2>
            </div>
            <p className="hidden md:block text-slate-400 text-xs tracking-wider">
              Прокручивайте страницу, чтобы листать карточки →
            </p>
          </div>

          {/* Движущаяся лента с карточками туров */}
          <motion.div style={{ x }} className="flex gap-8 px-6 md:px-16 will-change-transform">
            {TOURS.map((tour) => (
              <div
                key={tour.id}
                className="group relative flex-shrink-0 w-[300px] sm:w-[380px] md:w-[440px] h-[520px] rounded-3xl overflow-hidden bg-[#0d223a] border border-[#d4af37]/25 shadow-2xl transition-all duration-300 hover:border-[#d4af37]"
              >
                {/* Фоновая фотография с зумом */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Градиентные наложения для читаемости */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-[#07111e]/60 to-transparent" />
                </div>

                {/* Бейджи сверху */}
                <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c92a2a] text-white shadow-md">
                    {tour.tag}
                  </span>
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-[#07111e]/80 backdrop-blur-md border border-[#d4af37]/40 text-[#f5d77f]">
                    от ${tour.price} / чел
                  </div>
                </div>

                {/* Контент карточки снизу */}
                <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end">
                  <span className="text-xs text-[#00c49f] font-semibold tracking-wide uppercase mb-1">
                    {tour.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
                    {tour.title}
                  </h3>
                  
                  <p className="text-xs text-slate-300 line-clamp-2 mb-4">
                    {tour.description}
                  </p>

                  {/* Характеристики тура */}
                  <div className="flex items-center gap-4 text-xs text-slate-300 pb-4 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#d4af37]" />
                      <span>{tour.groupSize}</span>
                    </div>
                  </div>

                  {/* Кнопка бронирования */}
                  <button
                    onClick={() => onSelectTour ? onSelectTour(tour.id) : null}
                    className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-[#d4af37] to-[#aa7c11] text-[#07111e] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/50"
                  >
                    Забронировать тур
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. ФИНАЛЬНЫЙ БЛОК ДОВЕРИЯ / ПРЕИМУЩЕСТВ */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-[#d4af37]/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-[#0d223a]/50 border border-[#d4af37]/20">
            <ShieldCheck className="w-8 h-8 text-[#e5c158] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Без предоплаты</h4>
            <p className="text-xs text-slate-400">Оплата наличными или картой прямо в день экскурсии при посадке в трансфер.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0d223a]/50 border border-[#d4af37]/20">
            <Compass className="w-8 h-8 text-[#00c49f] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Трансфер от любого отеля</h4>
            <p className="text-xs text-slate-400">Забираем и привозим обратно во все отели Шарм-эль-Шейха без доплат.</p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0d223a]/50 border border-[#d4af37]/20">
            <Users className="w-8 h-8 text-[#ff8585] mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">Русскоязычные гиды</h4>
            <p className="text-xs text-slate-400">Лицензированные гиды и инструкторы с отличным знанием русского языка.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToursScrollLanding;