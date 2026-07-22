import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TOURS_DATA } from './data/tours';
import type { Tour } from './data/tours';

// Компоненты сайта
import { TourCard } from './components/TourCard';
import { TourModal } from './components/TourModal';
import { Hero } from './components/Hero';
import { Advantages } from './components/Advantages';
import { PromoBanner } from './components/PromoBanner';
import { FAQ } from './components/FAQ';
import { Header, type Language } from './components/Header';
import { TopPromoBanner } from './components/TopPromoBanner';
import { ChatWidget } from './components/ChatWidget';
import { AdminPanel } from './components/AdminPanel';

import { 
  Compass, Ship, Palmtree, Ticket, Landmark, Phone, Mail, MapPin, 
  MessageCircle, ShieldCheck, Award, Users, Lock
} from 'lucide-react';

export function App() {
  const { t, i18n } = useTranslation();
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'catalog' | 'about' | 'contacts'
  
  // 1. Вычисляем текущий язык динамически из i18n (убирает локации вроде 'ru-RU' -> 'RU')
  const rawLang = i18n.language ? i18n.language.slice(0, 2).toUpperCase() : 'RU';
  const currentLang: Language = (['RU', 'EN', 'IT'].includes(rawLang) ? rawLang : 'RU') as Language;

  const catalogRef = useRef<HTMLElement>(null);

  // Переключение языка через i18next
  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang.toLowerCase());
  };

  // Категории каталога с динамической локализацией
  const categories = useMemo(() => [
    { id: 'all', label: t('categories.all', 'Все туры'), icon: <Compass className="w-4 h-4" /> },
    { id: 'sea', label: t('categories.sea', 'Морские'), icon: <Ship className="w-4 h-4" /> },
    { id: 'safari', label: t('categories.safari', 'Сафари'), icon: <Palmtree className="w-4 h-4" /> },
    { id: 'show', label: t('categories.show', 'Шоу'), icon: <Ticket className="w-4 h-4" /> },
    { id: 'historical', label: t('categories.historical', 'Исторические'), icon: <Landmark className="w-4 h-4" /> },
  ], [t]);

  // Отслеживание URL-хэша для входа в админку (#admin)
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Живое состояние экскурсий с синхронизацией путей к изображениям из TOURS_DATA
  const [tours, setTours] = useState<Tour[]>(() => {
    const saved = localStorage.getItem('elina_tours_data_v2');
    if (!saved) return TOURS_DATA;

    try {
      const parsed: Tour[] = JSON.parse(saved);
      // Автоматически подставляем актуальные пути картинок из TOURS_DATA
      return parsed.map((savedTour) => {
        const freshTour = TOURS_DATA.find((t) => t.id === savedTour.id);
        return freshTour ? { ...savedTour, images: freshTour.images } : savedTour;
      });
    } catch {
      return TOURS_DATA;
    }
  });

  // Состояние кастомного текста акции из админки
  const [customPromoText, setCustomPromoText] = useState<string | null>(() => {
    return localStorage.getItem('elina_promo_text');
  });

  // Если админ не задал свой текст, промо-баннер динамически переводится через t()
  const promoText = customPromoText || t('promo.default_top_banner', '🔥 Скидка 10% на все морские экскурсии при бронировании до конца недели!');

  // Обработчики сохранения из админки
  const handleUpdateTours = (updated: Tour[]) => {
    setTours(updated);
    localStorage.setItem('elina_tours_data_v2', JSON.stringify(updated));
  };

  const handleUpdatePromo = (text: string) => {
    setCustomPromoText(text);
    localStorage.setItem('elina_promo_text', text);
  };

  // Фильтрация туров по динамическому массиву `tours`:
  const displayedTours = useMemo(() => {
    if (activeTab === 'home') {
      return tours.filter(t => t.featured);
    }
    return tours.filter(tour => activeCategory === 'all' || tour.category === activeCategory);
  }, [activeTab, activeCategory, tours]);

  const handleExploreClick = () => {
    if (activeTab !== 'home') {
      setActiveTab('home');
      setTimeout(() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ЕСЛИ В АДРЕСНОЙ СТРОКЕ #admin — РЕНДЕРИМ ПОЛНОЭКРАННУЮ АДМИНКУ
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-200 selection:text-amber-900 relative">
      
      {/* 0. Верхняя плашка акций */}
      <TopPromoBanner text={promoText} onActionClick={handleExploreClick} />

      {/* 1. Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLang={currentLang}
        setLanguage={handleLanguageChange}
        onContactClick={() => setActiveTab('contacts')}
      />

      {/* РЕНДЕР ВКЛАДОК */}
      {activeTab === 'home' && (
        <>
          <Hero onExploreClick={handleExploreClick} />
          <Advantages />

          {/* Популярные экскурсии на главной */}
          <main ref={catalogRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
                  {t('home.badge', 'Топ выбор туристов')}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
                  {t('home.popular_title', 'Популярные экскурсии')}
                </h2>
              </div>

              <button
                onClick={() => setActiveTab('catalog')}
                className="text-amber-600 font-extrabold text-sm hover:underline flex items-center gap-1 cursor-pointer"
              >
                {t('home.view_all', 'Смотреть весь каталог')} ({tours.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} onSelect={(t) => setSelectedTour(t)} />
              ))}
            </div>
          </main>

          <PromoBanner onBookClick={handleExploreClick} />
          <FAQ />
        </>
      )}

      {/* ВКЛАДКА: Полный Каталог */}
      {activeTab === 'catalog' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3">
              {t('catalog.title', 'Каталог всех экскурсий')}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              {t('catalog.subtitle', 'Выберите категорию, чтобы быстрее найти интересную прогулку по Шарм-эль-Шейху')}
            </p>
          </div>

          {/* Фильтры категорий */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <span className={activeCategory === cat.id ? 'text-amber-400' : 'text-slate-400'}>
                  {cat.icon}
                </span>
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

      {/* ВКЛАДКА: О нас */}
      {activeTab === 'about' && (
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          <div className="text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md">
              {t('about.badge', 'О компании')}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
              {t('about.title', 'Ваш надёжный гид в Шарм-эль-Шейхе')}
            </h1>
            <p className="text-slate-600 text-base max-w-2xl mx-auto leading-relaxed">
              {t('about.desc', 'Elina Tours организует морские прогулки, сафари и исторические туры с 2015 года. Наша главная цель — высокий сервис без переплат и рисков.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {t('about.feature1_title', 'Лицензированные гиды')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('about.feature1_desc', 'Все экскурсии проводят русскоговорящие гиды с государственными аккредитациями.')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {t('about.feature2_title', '0% Предоплаты')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('about.feature2_desc', 'Вы бронируете место на сайте, а оплачиваете экскурсию гиду прямо при посадке в автобус.')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center space-y-3">
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {t('about.feature3_title', '15,000+ Туристов')}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {t('about.feature3_desc', 'Ежегодно с нами отдыхают тысячи путешественников из стран СНГ и Европы.')}
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ВКЛАДКА: Контакты */}
      {activeTab === 'contacts' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-slate-900">
                {t('contacts.title', 'Свяжитесь с нами')}
              </h1>
              <p className="text-slate-500 text-sm">
                {t('contacts.subtitle', 'Мы на связи 24/7 и готовы ответить на любые вопросы по экскурсиям')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <a 
                href="https://wa.me/201000000000" 
                target="_blank" 
                rel="noreferrer"
                className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 hover:bg-emerald-100/60 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-emerald-700 font-bold uppercase block">WhatsApp</span>
                  <span className="font-black text-slate-900 text-base">+20 100 000 00 00</span>
                </div>
              </a>

              <a 
                href="tel:+201000000000" 
                className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 hover:bg-slate-100 transition-colors"
              >
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase block">
                    {t('contacts.phone_label', 'Телефон')}
                  </span>
                  <span className="font-black text-slate-900 text-base">+20 100 000 00 00</span>
                </div>
              </a>
            </div>

            <div className="pt-6 border-t border-slate-100 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-600 text-sm font-medium">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{t('contacts.address', 'Египет, Шарм-эль-Шейх, Наама Бэй')}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600 text-sm font-medium">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>info@elinatoursegypt.com</span>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Виджет Чат-бота */}
      <ChatWidget />

      {/* Футер */}
      <footer className="bg-slate-950 text-slate-300 py-16 border-t border-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-white">ELINA TOURS</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t(
                'footer.bio',
                'Официальный туроператор в Шарм-эль-Шейхе. Делаем ваш отдых ярким, безопасным и комфортным с 2015 года.'
              )}
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.contacts', 'Контакты')}</h4>
            <div className="space-y-4 text-sm">
              <a href="tel:+201000000000" className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                <Phone className="w-4 h-4 text-slate-500" /> +20 100 000 00 00
              </a>
              <a href="mailto:info@elinatoursegypt.com" className="flex items-center gap-3 hover:text-amber-400 transition-colors">
                <Mail className="w-4 h-4 text-slate-500" /> info@elinatoursegypt.com
              </a>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" /> {t('footer.location', 'Шарм-эль-Шейх, Египет')}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.guarantee_title', 'Оплата и Гарантии')}</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              {t(
                'footer.guarantee_desc',
                'Мы работаем без предоплаты. Все расчеты производятся на месте наличными (USD, EUR, GBP, EGP) или переводом.'
              )}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-8 pt-4 border-t border-slate-900">
              <span>&copy; {new Date().getFullYear()} Elina Tours. {t('footer.rights', 'Все права защищены.')}</span>
              <a href="#admin" className="text-slate-600 hover:text-amber-400 flex items-center gap-1 transition-colors">
                <Lock className="w-3 h-3" /> {t('footer.staff_login', 'Вход для персонала')}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Модальное окно бронирования */}
      <TourModal tour={selectedTour} onClose={() => setSelectedTour(null)} />
    </div>
  );
}

export default App;