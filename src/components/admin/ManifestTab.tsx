import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CalendarDays, Printer, MapPin, Users, DollarSign, 
  CheckCircle2, Bus, ChevronLeft, ChevronRight, Filter, Search,
  ChevronDown, Check, Sparkles
} from 'lucide-react';
import { type Order, type OrderStatus } from './types';

interface ManifestTabProps {
  orders: Order[];
  manifestDate: string;
  onDateChange: (date: string) => void;
  onUpdateStatus?: (orderId: string, newStatus: OrderStatus) => void;
}

const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const ManifestTab: React.FC<ManifestTabProps> = ({
  orders,
  manifestDate,
  onDateChange,
  onUpdateStatus,
}) => {
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all');
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');

  // Состояния открытия кастомных попапов
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);

  // Рефы для закрытия по клику вне области
  const calendarRef = useRef<HTMLDivElement>(null);
  const tourDropdownRef = useRef<HTMLDivElement>(null);

  // Состояние отображаемого месяца в кастомном календаре
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(manifestDate);
    return isNaN(d.getTime()) ? new Date() : d;
  });

  useEffect(() => {
    const d = new Date(manifestDate);
    if (!isNaN(d.getTime())) setViewDate(d);
  }, [manifestDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
      if (tourDropdownRef.current && !tourDropdownRef.current.contains(e.target as Node)) {
        setIsTourDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Переключение дней стрелками
  const handleShiftDate = (days: number) => {
    const current = new Date(manifestDate);
    if (isNaN(current.getTime())) return;
    current.setDate(current.getDate() + days);
    onDateChange(current.toISOString().split('T')[0]);
  };

  const setPresetDate = (preset: 'today' | 'tomorrow' | 'after_tomorrow') => {
    const d = new Date();
    if (preset === 'tomorrow') d.setDate(d.getDate() + 1);
    if (preset === 'after_tomorrow') d.setDate(d.getDate() + 2);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formattedDateTitle = useMemo(() => {
    try {
      const d = new Date(manifestDate);
      if (isNaN(d.getTime())) return manifestDate;
      return d.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return manifestDate;
    }
  }, [manifestDate]);

  // Список доступных туров с подсчетом количества человек
  const tourStatsOnDate = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach(o => {
      if (['confirmed', 'checked_in', 'completed'].includes(o.status)) {
        if (o.date.includes(manifestDate) || o.createdAt.startsWith(manifestDate)) {
          map[o.tourTitle] = (map[o.tourTitle] || 0) + 1;
        }
      }
    });
    return map;
  }, [orders, manifestDate]);

  const availableToursList = useMemo(() => Object.keys(tourStatsOnDate), [tourStatsOnDate]);

  // Фильтрация заказов для манифеста
  const manifestOrders = useMemo(() => {
    return orders.filter(o => {
      const isEligibleStatus = ['confirmed', 'checked_in', 'completed'].includes(o.status);
      if (!isEligibleStatus) return false;

      const matchesDate = o.date.includes(manifestDate) || o.createdAt.startsWith(manifestDate);
      if (!matchesDate) return false;

      if (selectedTourFilter !== 'all' && o.tourTitle !== selectedTourFilter) {
        return false;
      }

      if (hotelSearchQuery.trim()) {
        const q = hotelSearchQuery.toLowerCase();
        const mHotel = o.hotel.toLowerCase().includes(q);
        const mName = o.clientName.toLowerCase().includes(q);
        const mId = o.id.toLowerCase().includes(q);
        if (!mHotel && !mName && !mId) return false;
      }

      return true;
    }).sort((a, b) => a.hotel.localeCompare(b.hotel));
  }, [orders, manifestDate, selectedTourFilter, hotelSearchQuery]);

  const stats = useMemo(() => {
    const totalOrders = manifestOrders.length;
    const totalCash = manifestOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const checkedInCount = manifestOrders.filter(o => o.status === 'checked_in' || o.status === 'completed').length;

    let totalAdults = 0;
    let totalKids = 0;

    manifestOrders.forEach(o => {
      const aM = o.guests?.match(/(\d+)\s*взр/);
      const cM = o.guests?.match(/(\d+)\s*дет/);
      totalAdults += aM ? parseInt(aM[1], 10) : 1;
      totalKids += cM ? parseInt(cM[1], 10) : 0;
    });

    return {
      totalOrders,
      totalCash,
      totalGuests: totalAdults + totalKids,
      totalAdults,
      totalKids,
      checkedInCount,
    };
  }, [manifestOrders]);

  // Генерация сетки дней для кастомного календаря
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Понедельник = 0
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Дни предыдущего месяца
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 12 : month;
      const y = month === 0 ? year - 1 : year;
      days.push({
        day: d,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    // Дни текущего месяца
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const m = month + 1;
      days.push({
        day: i,
        dateStr: `${year}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: true,
      });
    }

    // Добивка следующего месяца до ровной сетки
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 1 : month + 2;
      const y = month === 11 ? year + 1 : year;
      days.push({
        day: i,
        dateStr: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewDate]);

  return (
    <div className="space-y-6">
      
      {/* 1. ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className="bg-[#0d223a] p-5 sm:p-6 rounded-3xl border border-white/10 space-y-5 print:hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#f5d77f] block font-bold">
              Диспетчерская ведомость
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white capitalize flex items-center gap-2.5 mt-0.5">
              <CalendarDays className="w-6 h-6 text-[#d4af37]" />
              <span>{formattedDateTitle}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Быстрые кнопки дней */}
            <div className="flex items-center bg-[#07111e] p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => handleShiftDate(-1)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Предыдущий день"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPresetDate('today')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  manifestDate === new Date().toISOString().split('T')[0]
                    ? 'bg-[#d4af37] text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Сегодня
              </button>

              <button
                type="button"
                onClick={() => setPresetDate('tomorrow')}
                className="px-3 py-1.5 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Завтра
              </button>

              <button
                type="button"
                onClick={() => handleShiftDate(1)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Следующий день"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* КАСТОМНАЯ КНОПКА КАЛЕНДАРЯ */}
            <div className="relative" ref={calendarRef}>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                  isCalendarOpen 
                    ? 'border-[#d4af37] bg-[#d4af37]/20 text-white ring-2 ring-[#d4af37]/30' 
                    : 'border-[#d4af37]/60 bg-[#07111e] text-white hover:border-[#d4af37] hover:bg-[#d4af37]/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#f5d77f]" />
                  <span className="font-mono font-black text-xs tracking-wider text-[#f5d77f]">
                    {manifestDate.split('-').reverse().join('.')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ПОПАП КАЛЕНДАРЯ */}
              {isCalendarOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-[#07111e] border-2 border-[#d4af37]/40 rounded-3xl p-4 shadow-2xl w-72 space-y-3 animate-fade-in backdrop-blur-xl">
                  {/* Шапка календаря */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-xs text-white">
                      {MONTHS_RU[viewDate.getMonth()]} {viewDate.getFullYear()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
                      }}
                      className="p-1.5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Дни недели */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DAYS_RU.map(d => (
                      <span key={d} className="text-[10px] font-mono font-bold text-slate-500">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Сетка дней */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarGrid.map((item, idx) => {
                      const isSelected = item.dateStr === manifestDate;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDateChange(item.dateStr);
                            setIsCalendarOpen(false);
                          }}
                          className={`h-8 w-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#d4af37] text-slate-950 shadow-md font-black scale-105'
                              : item.isCurrentMonth
                              ? 'text-white hover:bg-white/15 hover:text-[#f5d77f]'
                              : 'text-slate-600 hover:bg-white/5'
                          }`}
                        >
                          {item.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Печать */}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={manifestOrders.length === 0}
              className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>Распечатать</span>
            </button>
          </div>
        </div>

        {/* 2. ЛИНИЯ ФИЛЬТРОВ (КАСТОМНЫЙ ДРОПДАУН ВМЕСТО SELECT) */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Кастомный выпадающий список экскурсий */}
          <div className="relative flex-1 max-w-md" ref={tourDropdownRef}>
            <button
              type="button"
              onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
              className="w-full bg-[#07111e] border border-white/15 hover:border-[#d4af37] rounded-2xl px-4 py-2.5 text-xs font-bold text-white flex items-center justify-between gap-2 shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <Filter className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                <span className="truncate">
                  {selectedTourFilter === 'all' 
                    ? `🚌 Все экскурсии рейса (${manifestOrders.length})` 
                    : selectedTourFilter}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${isTourDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTourDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 z-50 bg-[#07111e] border border-white/20 rounded-2xl p-1.5 shadow-2xl w-full max-h-60 overflow-y-auto space-y-1 animate-fade-in backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTourFilter('all');
                    setIsTourDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                    selectedTourFilter === 'all'
                      ? 'bg-[#d4af37] text-slate-950 font-black'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <span>🚌 Все экскурсии рейса</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {Object.values(tourStatsOnDate).reduce((a, b) => a + b, 0)} броней
                  </span>
                </button>

                {availableToursList.map(tourName => (
                  <button
                    key={tourName}
                    type="button"
                    onClick={() => {
                      setSelectedTourFilter(tourName);
                      setIsTourDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                      selectedTourFilter === tourName
                        ? 'bg-[#d4af37] text-slate-950 font-black'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate pr-2">{tourName}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/10 shrink-0">
                      {tourStatsOnDate[tourName]} бр.
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Поиск по отелю */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Поиск по отелю, имени или ID..."
              value={hotelSearchQuery}
              onChange={(e) => setHotelSearchQuery(e.target.value)}
              className="w-full bg-[#07111e] border border-white/15 hover:border-[#d4af37] rounded-2xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 3. СВОДКА ДЛЯ ГИДА И ВОДИТЕЛЯ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4 print:gap-2">
        <div className="bg-[#0d223a] print:bg-slate-100 print:text-black p-4 rounded-2xl border border-white/10 print:border-slate-300 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 print:text-slate-600 font-bold uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400 print:text-black" /> Всего туристов
          </span>
          <span className="text-2xl font-black text-cyan-400 print:text-black">
            {stats.totalGuests} <span className="text-xs font-semibold text-slate-400 print:text-slate-600">({stats.totalAdults} взр + {stats.totalKids} дет)</span>
          </span>
        </div>

        <div className="bg-[#0d223a] print:bg-slate-100 print:text-black p-4 rounded-2xl border border-white/10 print:border-slate-300 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 print:text-slate-600 font-bold uppercase flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400 print:text-black" /> Сбор наличных
          </span>
          <span className="text-2xl font-black text-emerald-400 print:text-black">
            ${stats.totalCash}
          </span>
        </div>

        <div className="bg-[#0d223a] print:bg-slate-100 print:text-black p-4 rounded-2xl border border-white/10 print:border-slate-300 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 print:text-slate-600 font-bold uppercase flex items-center gap-1.5">
            <Bus className="w-3.5 h-3.5 text-amber-400 print:text-black" /> В автобусе
          </span>
          <span className="text-2xl font-black text-amber-400 print:text-black">
            {stats.checkedInCount} / {stats.totalOrders} <span className="text-xs font-semibold text-slate-400 print:text-slate-600">броней</span>
          </span>
        </div>

        <div className="bg-[#0d223a] print:bg-slate-100 print:text-black p-4 rounded-2xl border border-white/10 print:border-slate-300 space-y-1 shadow-md">
          <span className="text-[11px] text-slate-400 print:text-slate-600 font-bold uppercase flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-400 print:text-black" /> Точек сбора
          </span>
          <span className="text-2xl font-black text-white print:text-black">
            {new Set(manifestOrders.map(o => o.hotel)).size} отелей
          </span>
        </div>
      </div>

      {/* 4. ТАБЛИЦА СБОРА ТУРИСТОВ */}
      {manifestOrders.length === 0 ? (
        <div className="bg-[#0d223a] p-12 rounded-3xl border border-white/10 text-center space-y-2">
          <Bus className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">На выбранную дату подтвержденных выездов нет</h4>
          <p className="text-xs text-slate-500">
            Здесь отображаются только заказы со статусом «Ожидает посадки» или «В автобусе».
          </p>
        </div>
      ) : (
        <div className="bg-[#0d223a] print:bg-white rounded-3xl border border-white/10 print:border print:border-black overflow-hidden shadow-2xl">
          
          <div className="hidden print:block p-4 border-b border-black text-black">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-lg font-black uppercase tracking-wider">SHARM & ADAM TOURS • MANIFEST</h1>
                <p className="text-xs">Дата выезда: <b>{formattedDateTitle}</b></p>
              </div>
              <div className="text-right text-xs">
                <span>Всего гостей: <b>{stats.totalGuests}</b></span> | <span>Сумма гиду: <b>${stats.totalCash}</b></span>
              </div>
            </div>
          </div>

          <table className="w-full text-left text-xs print:text-[11px]">
            <thead className="bg-[#07111e] print:bg-slate-200 text-slate-400 print:text-black font-extrabold border-b border-white/10 print:border-black uppercase font-mono">
              <tr>
                <th className="p-3.5 w-12 text-center print:table-cell">№</th>
                <th className="p-3.5">Отель / Сбор (Security Gate)</th>
                <th className="p-3.5">Главный турист & Телефон</th>
                <th className="p-3.5">Экскурсия</th>
                <th className="p-3.5 text-center">Гости</th>
                <th className="p-3.5">К оплате гиду</th>
                <th className="p-3.5 text-center print:hidden">Посадка</th>
                <th className="p-3.5 text-center hidden print:table-cell">Отметка гида</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-slate-300 text-slate-200 print:text-black font-medium">
              {manifestOrders.map((mo, idx) => {
                const isCheckedIn = mo.status === 'checked_in' || mo.status === 'completed';

                return (
                  <tr 
                    key={mo.id} 
                    className={`transition-colors ${
                      isCheckedIn 
                        ? 'bg-emerald-500/5 print:bg-slate-50' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="p-3.5 text-center font-mono font-bold text-slate-500 print:text-black">
                      {idx + 1}
                    </td>

                    <td className="p-3.5 font-bold text-white print:text-black">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0 print:hidden" />
                        <span className="text-sm print:text-xs">{mo.hotel || 'Отель не указан'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#f5d77f] print:text-slate-600 block mt-0.5">
                        Билет #{mo.id}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-white print:text-black block">{mo.clientName}</span>
                      <span className="font-mono text-slate-400 print:text-slate-700 text-[11px] block">
                        {mo.phone} ({mo.contactMethod})
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-200 print:text-black max-w-[180px]">
                      {mo.tourTitle}
                    </td>

                    <td className="p-3.5 text-center font-black text-white print:text-black">
                      {mo.guests}
                    </td>

                    <td className="p-3.5">
                      <span className="font-black text-sm text-emerald-400 print:text-black block">
                        ${mo.totalPrice}
                      </span>
                      <span className="text-[9px] text-slate-400 print:text-slate-600">Наличными</span>
                    </td>

                    <td className="p-3.5 text-center print:hidden">
                      {isCheckedIn ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" /> В автобусе
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus && onUpdateStatus(mo.id, 'checked_in')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
                        >
                          Посадить
                        </button>
                      )}
                    </td>

                    <td className="p-3.5 text-center hidden print:table-cell">
                      <div className="w-5 h-5 border-2 border-black mx-auto rounded-sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="hidden print:flex justify-between items-center p-6 pt-12 text-xs border-t border-black text-black">
            <div>Подпись гида: ___________________</div>
            <div>Подпись водителя: ___________________</div>
          </div>
        </div>
      )}
    </div>
  );
};