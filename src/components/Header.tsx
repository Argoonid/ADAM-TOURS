import React, { useState, useRef, useEffect } from 'react';
import { Compass, Phone, Globe, ChevronDown } from 'lucide-react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = ['RU', 'EN', 'IT'];

  // Закрываем меню языков при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Переключение языка в i18next и родительском стейте
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang.toLowerCase());
    setLangMenuOpen(false);
  };

  return (
    <header className="bg-white/90 border-b border-slate-100 sticky top-0 z-40 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Логотип */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setActiveTab('home')}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-none">
              ELINA TOURS
            </span>
            <span className="text-[10px] text-amber-500 font-bold tracking-widest uppercase">
              Sharm El Sheikh
            </span>
          </div>
        </div>

        {/* Навигационное меню */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 text-xs font-bold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'home' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.home', 'Главная')}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.catalog', 'Все экскурсии')}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'about' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.about', 'О нас')}
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer ${
              activeTab === 'contacts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('nav.contacts', 'Контакты')}
          </button>
        </nav>

        {/* Языки + Кнопка связи */}
        <div className="flex items-center gap-3">
          {/* Селект языков */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>{currentLang}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-28 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between cursor-pointer ${
                      currentLang === lang ? 'bg-amber-50 text-amber-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{lang === 'RU' ? '🇷🇺 RU' : lang === 'EN' ? '🇬🇧 EN' : '🇮🇹 IT'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Кнопка «Связаться» */}
          <button
            onClick={onContactClick}
            className="hidden sm:flex items-center gap-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>{t('nav.contact_btn', 'Связаться')}</span>
          </button>
        </div>

      </div>
    </header>
  );
};