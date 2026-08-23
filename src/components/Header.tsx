import React, { useState, useRef, useEffect } from 'react';
import { Compass, Phone, Globe, ChevronDown, Menu, X, Check, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type Language = 'RU' | 'EN' | 'IT';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentLang: Language;
  setLanguage: (lang: Language) => void;
  onContactClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentLang,
  setLanguage,
  onContactClick,
}) => {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = ['RU', 'EN', 'IT'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang.toLowerCase());
    setLangMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: t('nav.home', 'Главная') },
    { id: 'catalog', label: t('nav.catalog', 'Все экскурсии') },
    { id: 'about', label: t('nav.about', 'О нас') },
    { id: 'contacts', label: t('nav.contacts', 'Контакты') },
  ];

  return (
    <header className="bg-white/90 border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-xl transition-all shadow-xs">
      {/* Тонкая фирменная лента герба (Золото • Кармин • Лазурь) */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-sky-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Логотип */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => {
            setActiveTab('home');
            setMobileMenuOpen(false);
          }}
        >
          {/* Золотой медальон */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden border border-amber-100">
              <span className="font-serif font-black text-xl bg-gradient-to-b from-amber-500 to-amber-700 bg-clip-text text-transparent tracking-tighter">
                S&A
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 leading-none">
                SHARM <span className="text-amber-500">&</span> ADAM
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-600 text-white tracking-wider shadow-xs">
                TOURS
              </span>
            </div>
            <span className="text-[10px] text-amber-700/80 font-bold tracking-widest uppercase block mt-1">
              Sharm El Sheikh • Egypt
            </span>
          </div>
        </div>

        {/* Навигационное меню (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 text-xs font-bold shadow-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-5 py-2 rounded-full transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-slate-950 font-black shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Правый блок: Языки + Связь */}
        <div className="flex items-center gap-2.5">
          {/* Селект языков */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentLang}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                      currentLang === lang 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang === 'RU' ? '🇷🇺 RU' : lang === 'EN' ? '🇬🇧 EN' : '🇮🇹 IT'}</span>
                    {currentLang === lang && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка связи */}
          <button
            type="button"
            onClick={onContactClick}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-105 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('nav.contact_btn', 'Связаться')}</span>
          </button>

          {/* Бургер-меню (Mobile) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-slate-100 text-slate-700 hover:text-slate-950 rounded-xl border border-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-amber-50 text-amber-900 font-black border border-amber-200'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              onContactClick();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Phone className="w-4 h-4" />
            <span>{t('nav.contact_btn', 'Связаться с гидом')}</span>
          </button>
        </div>
      )}
    </header>
  );
};