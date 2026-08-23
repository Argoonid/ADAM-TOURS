import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TOURS_DATA, getLocalizedText } from './data/tours';
import type { Tour } from './data/tours';
import { sendBookingToTelegram } from './services/telegram';
import { supabase } from './services/supabase';
import { tourService } from './services/tourService';

import { ScrollytellingHero } from './components/ScrollytellingHero';
import { TourCard } from './components/TourCard';
import { TourModal } from './components/TourModal';
import { FAQ } from './components/FAQ';
import { Header, type Language } from './components/Header';
import { Footer } from './components/Footer';
import { TopPromoBanner } from './components/TopPromoBanner';
import { ChatWidget } from './components/ChatWidget';
import { AdminPanel } from './components/AdminPanel';

import { 
  Compass, Ship, Palmtree, Ticket, Landmark, Phone, MapPin, 
  ShieldCheck, Award, Users, Sparkles, CheckCircle2
} from 'lucide-react';

export function App() {
  const { t, i18n } = useTranslation();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home');
  
  const [quickForm, setQuickForm] = useState({
    name: '',
    phone: '',
    date: '',
    tourTitle: 'Каир и Великие Пирамиды на автобусе (1 день)'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const rawLang = i18n.language ? i18n.language.slice(0, 2).toUpperCase() : 'RU';
  const currentLang: Language = (['RU', 'EN', 'IT'].includes(rawLang) ? rawLang : 'RU') as Language;

  const catalogRef = useRef<HTMLElement>(null);
  const bookingRef = useRef<HTMLElement>(null);

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang.toLowerCase());
  };

  const categories = useMemo(() => [
    { id: 'all', label: t('categories.all', 'Все туры'), icon: <Compass className="w-4 h-4" /> },
    { id: 'sea', label: t('categories.sea', 'Морские'), icon: <Ship className="w-4 h-4" /> },
    { id: 'safari', label: t('categories.safari', 'Сафари'), icon: <Palmtree className="w-4 h-4" /> },
    { id: 'show', label: t('categories.show', 'Шоу'), icon: <Ticket className="w-4 h-4" /> },
    { id: 'historical', label: t('categories.historical', 'Исторические'), icon: <Landmark className="w-4 h-4" /> },
  ], [t]);

  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Синхронизация списка туров из Supabase
  const [tours, setTours] = useState<Tour[]>(TOURS_DATA);

  useEffect(() => {
    const loadToursFromCloud = async () => {
      const cloudTours = await tourService.getTours();
      if (cloudTours && cloudTours.length > 0) {
        setTours(cloudTours);
      }
    };

    loadToursFromCloud();

    const channel = supabase
      .channel('public:tours-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tours' }, async () => {
        const refreshed = await tourService.getTours();
        setTours(refreshed);
      })
      .subscribe();

    const handleLocalToursUpdate = () => {
      loadToursFromCloud();
    };

    window.addEventListener('elina_tours_updated', handleLocalToursUpdate);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('elina_tours_updated', handleLocalToursUpdate);
    };
  }, []);

  const [customPromoText, setCustomPromoText] = useState<string | null>(() => {
    return localStorage.getItem('elina_promo_text');
  });

  const promoText = customPromoText || t('promo.default_top_banner', '🔥 Скидка 10% на все морские экскурсии при бронировании до конца недели!');

  const handleUpdateTours = (updated: Tour[]) => {
    setTours(updated);
    window.dispatchEvent(new CustomEvent('elina_tours_updated'));
  };

  const handleUpdatePromo = (text: string) => {
    setCustomPromoText(text);
    localStorage.setItem('elina_promo_text', text);
  };

  const displayedTours = useMemo(() => {
    if (activeTab === 'home') {
      return tours.filter(t => t.featured || true).slice(0, 6);
    }
    return tours.filter(tour => activeCategory === 'all' || tour.category === activeCategory);
  }, [activeTab, activeCategory, tours]);

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Быстрое бронирование
  const handleQuickBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const targetTour = tours.find(t => 
      getLocalizedText(t.title, 'ru') === quickForm.tourTitle
    ) || tours[0];

    const newSeats = Math.max(0, (targetTour.availableSeats ?? 15) - 1);
    
    await tourService.updateSeats(targetTour.id, newSeats);

    const bookingId = `SA-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await supabase
        .from('orders')
        .insert([{
          id: bookingId,
          tour_id: targetTour.id,
          tour_title: quickForm.tourTitle,
          client_name: quickForm.name,
          phone: quickForm.phone,
          tour_date: quickForm.date || 'Уточняется',
          guests: '1 взр.',
          total_price: targetTour.priceAdult || 0,
          status: 'new'
        }]);
    } catch (err) {
      console.warn('Quick booking cloud sync:', err);
    }

    const success = await sendBookingToTelegram({
      bookingId,
      tourTitle: quickForm.tourTitle,
      date: quickForm.date || 'Уточняется',
      time: '09:00',
      adults: 1,
      adultAges: [25],
      childrenCount: 0,
      childAges: [],
      preferredLang: currentLang,
      contactMethod: 'WhatsApp',
      paymentMethod: 'Наличными гиду при посадке',
      name: quickForm.name,
      phone: quickForm.phone,
      hotel: 'Уточняется',
      notes: `Быстрая заявка с главной страницы. Осталось мест: ${newSeats}`,
      selectedOptions: [],
      totalPrice: targetTour.priceAdult || 0
    });

    setIsSubmitting(false);
    if (success) {
      setIsSubmitted(true);
    }
  };

  // Полноэкранная CRM панель
  if (currentHash === '#admin') {
    return (
      <AdminPanel
        tours={tours}
        onUpdateTours={handleUpdateTours}
        promoText={promoText}
        onUpdatePromoText={handleUpdatePromo}
        onGoToSite={() => {
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 relative">
      <TopPromoBanner text={promoText} onActionClick={scrollToBooking} />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLang={currentLang}
        setLanguage={handleLanguageChange}
        onContactClick={() => {
          if (activeTab !== 'home') {
            setActiveTab('home');
            setTimeout(scrollToBooking, 150);
          } else {
            scrollToBooking();
          }
        }}
      />

      {/* Главная страница */}
      {activeTab === 'home' && (
        <>
          <ScrollytellingHero onBookClick={scrollToBooking} />

          <div className="relative z-20 bg-[#fafbfc]">
            {/* Каталог на главной */}
            <main ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4 border-b border-slate-200/80 pb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 inline-flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Топ выбор путешественников
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
                    Популярные направления
                  </h2>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-700 hover:text-amber-600 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  Смотреть весь каталог ({tours.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} onSelect={(t) => setSelectedTour(t)} />
                ))}
              </div>
            </main>

            {/* Преимущества */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Гарантия качества
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
                  Почему выбирают Sharm & Adam Tours
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-center space-y-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                    <Award className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xl">Лицензированные гиды</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Все экскурсии проводят дипломированные гиды-историки и сертифицированные инструкторы.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xl">0% Предоплаты</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Оплата производится только при посадке в трансфер: наличными в любой удобной валюте.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all text-center space-y-4">
                  <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-200">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xl">Трансфер от любого отеля</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Забираем прямо от ворот вашего отеля в Шарм-эль-Шейхе и возвращаем обратно с комфортом.
                  </p>
                </div>
              </div>
            </section>

            {/* Блок быстрого бронирования */}
            <section ref={bookingRef} className="py-20 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/30 border-y border-amber-100">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full border border-amber-200 block w-fit">
                    Бронирование без рисков
                  </span>
                  <h3 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
                    Спланируем ваш идеальный отдых
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed">
                    Оставьте заявку — менеджер свяжется с вами в течение 10 минут, закрепит места в автобусе и зафиксирует скидку 10%.
                  </p>

                  <div className="space-y-4 pt-4 text-sm">
                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shadow-xs">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Телефон / WhatsApp</div>
                        <div className="font-bold text-slate-900">+20 100 000 00 00</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-slate-700">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 shadow-xs">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-medium">Главный офис</div>
                        <div className="font-bold text-slate-900">Шарм-эль-Шейх, Наама Бэй</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
                  {isSubmitted ? (
                    <div className="text-center py-10 space-y-4">
                      <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                      <h4 className="text-2xl font-black text-slate-900">Заявка оформлена!</h4>
                      <p className="text-slate-600 text-sm">
                        Место забронировано. Менеджер свяжется с вами в WhatsApp в ближайшие минуты.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-4 px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold bg-amber-500 text-slate-950 cursor-pointer hover:bg-amber-400 transition-colors"
                      >
                        Оформить ещё одну заявку
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleQuickBookingSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                          Ваше Имя *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Иван"
                          value={quickForm.name}
                          onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                            Телефон / WhatsApp *
                          </label>
                          <input
                            type="tel"
                            required
                            placeholder="+7 (999) 000-00-00"
                            value={quickForm.phone}
                            onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                            Желаемая дата
                          </label>
                          <input
                            type="date"
                            value={quickForm.date}
                            onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider text-slate-700 font-bold mb-1.5">
                          Интересующая экскурсия
                        </label>
                        <select
                          value={quickForm.tourTitle}
                          onChange={(e) => setQuickForm({ ...quickForm, tourTitle: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:border-amber-500 focus:bg-white outline-none transition-all"
                        >
                          {tours.map((t) => {
                            const name = getLocalizedText(t.title, 'ru');
                            return (
                              <option key={t.id} value={name}>
                                {name} (${t.priceAdult})
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-2 py-4 rounded-2xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 hover:brightness-105 transition-all cursor-pointer shadow-lg shadow-amber-500/25 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Оформление...' : 'Забронировать без предоплаты'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <FAQ />
            </div>
          </div>
        </>
      )}

      {/* Каталог */}
      {activeTab === 'catalog' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
              Экскурсии в Шарм-эль-Шейхе
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3 mb-3">
              {t('catalog.title', 'Каталог всех экскурсий')}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              {t('catalog.subtitle', 'Выберите категорию, чтобы быстрее найти подходящую программу')}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} onSelect={(t) => setSelectedTour(t)} />
            ))}
          </div>
        </main>
      )}

      {/* О нас */}
      {activeTab === 'about' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full">
              {t('about.badge', 'О компании')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
              {t('about.title', 'Ваш надёжный гид в Шарм-эль-Шейхе')}
            </h1>
            <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
              {t('about.desc', 'SHARM & ADAM TOURS организует морские прогулки, сафари и исторические туры с 2015 года.')}
            </p>
          </div>
        </main>
      )}

      <ChatWidget />

      {/* Премиальный светлый футер */}
      <Footer 
        onCategorySelect={(cat) => {
          setActiveCategory(cat);
          setActiveTab('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => {
          window.location.hash = '#admin';
        }}
      />

      {/* Модальное окно бронирования тура */}
      <TourModal 
        tour={selectedTour} 
        onClose={() => setSelectedTour(null)} 
        onBookingSuccess={(tourId, remainingSeats) => {
          setSelectedTour(prev => prev && prev.id === tourId ? { ...prev, availableSeats: remainingSeats } : prev);
        }}
      />
    </div>
  );
}

export default App;