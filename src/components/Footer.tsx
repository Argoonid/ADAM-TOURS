import React from 'react';
import { 
  ShieldCheck, Banknote, Clock, Award, Phone, 
  MessageCircle, Send, MapPin, Mail 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FooterProps {
  onCategorySelect?: (cat: string) => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategorySelect, onOpenAdmin }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-50 text-slate-700 font-sans border-t border-slate-200 relative overflow-hidden">
      {/* 4 ключевые гарантии */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">0% Предоплаты</span>
              <span className="text-[11px] text-slate-500">Оплата лично гиду в автобусе</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Официальная страховка</span>
              <span className="text-[11px] text-slate-500">Включена во все экскурсии</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Русские гиды-историки</span>
              <span className="text-[11px] text-slate-500">Лицензированные эксперты</span>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-slate-900 block">Поддержка 24/7</span>
              <span className="text-[11px] text-slate-500">Диспетчер всегда на связи</span>
            </div>
          </div>
        </div>
      </div>

      {/* Основная сетка футера */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Колонка 1: Бренд */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-sm">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="font-serif font-black text-lg text-amber-600">S&A</span>
              </div>
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 block leading-none">
                SHARM & ADAM <span className="text-rose-600 text-xs font-extrabold">TOURS</span>
              </span>
              <span className="text-[10px] text-amber-700 font-bold tracking-widest uppercase block mt-1">
                Official Excursion Service
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Официальный организатор морских, исторических и сафари-экскурсий в Шарм-эль-Шейхе, Дахабе и по всему Египту. Путешествуйте комфортно, выгодно и безопасно.
          </p>
        </div>

        {/* Колонка 2: Направления */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900 tracking-wide uppercase">Категории туров</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onCategorySelect?.('sea')} className="text-slate-600 hover:text-amber-600 transition-colors cursor-pointer">
                🌊 Морские прогулки и Рас-Мохаммед
              </button>
            </li>
            <li>
              <button onClick={() => onCategorySelect?.('safari')} className="text-slate-600 hover:text-amber-600 transition-colors cursor-pointer">
                🏜 Сафари на квадроциклах и каньоны
              </button>
            </li>
            <li>
              <button onClick={() => onCategorySelect?.('historical')} className="text-slate-600 hover:text-amber-600 transition-colors cursor-pointer">
                🏛 Каир, Луксор и Пирамиды
              </button>
            </li>
            <li>
              <button onClick={() => onCategorySelect?.('show')} className="text-slate-600 hover:text-amber-600 transition-colors cursor-pointer">
                ✨ Шоу дельфинов и вечерний Шарм
              </button>
            </li>
          </ul>
        </div>

        {/* Колонка 3: Контакты */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900 tracking-wide uppercase">Контакты в Шарме</h4>
          <ul className="space-y-2.5 text-xs text-slate-600">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Naama Bay / Hadaba, Sharm El Sheikh, Egypt</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-600 shrink-0" />
              <span>+20 100 000 0000 (Горячая линия)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-sky-600 shrink-0" />
              <span>info@sharmadamtours.com</span>
            </li>
          </ul>
        </div>

        {/* Колонка 4: Мессенджеры */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm text-slate-900 tracking-wide uppercase">Быстрая связь</h4>
          <p className="text-xs text-slate-500">
            Отвечаем в течение 5 минут в мессенджерах:
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Написать в WhatsApp</span>
            </a>
            <a
              href="https://t.me/sharmadamtours"
              target="_blank"
              rel="noreferrer"
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Написать в Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Копирайт */}
      <div className="border-t border-slate-200 bg-white py-5 text-center text-[11px] text-slate-400 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} SHARM & ADAM TOURS EGYPT. Все права защищены.</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-300">•</span>
            <button 
              onClick={onOpenAdmin} 
              className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer font-medium"
            >
              CRM Вход
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};