import React, { useMemo } from 'react';
import { 
  BarChart3, TrendingUp, Building2, MessageCircle, 
  Send, PhoneCall, FileSpreadsheet 
} from 'lucide-react';
import { type Order, getSafeDate } from './types';

interface AnalyticsTabProps {
  orders: Order[];
  analyticsPeriod: 'today' | 'yesterday' | 'week' | 'month' | 'all';
  onPeriodChange: (period: 'today' | 'yesterday' | 'week' | 'month' | 'all') => void;
  onExportCSV: () => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  orders,
  analyticsPeriod,
  onPeriodChange,
  onExportCSV,
}) => {
  const analyticsData = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    const filtered = orders.filter(o => {
      const orderDate = getSafeDate(o.createdAt);
      const orderDateStr = orderDate.toISOString().split('T')[0];

      if (analyticsPeriod === 'today') return orderDateStr === todayStr;
      if (analyticsPeriod === 'yesterday') return orderDateStr === yesterdayStr;
      if (analyticsPeriod === 'week') return orderDate >= weekAgo;
      if (analyticsPeriod === 'month') return orderDate >= monthAgo;
      return true;
    });

    const activeOrders = filtered.filter(o => !['unconfirmed_failed', 'cancelled_by_client', 'no_show'].includes(o.status));
    const totalRev = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgCheck = activeOrders.length > 0 ? Math.round(totalRev / activeOrders.length) : 0;

    const totalGuests = activeOrders.reduce((sum, o) => {
      const adultMatch = o.guests?.match(/(\d+)\s*взр/);
      const childMatch = o.guests?.match(/(\d+)\s*дет/);
      const adults = adultMatch ? parseInt(adultMatch[1], 10) : 1;
      const kids = childMatch ? parseInt(childMatch[1], 10) : 0;
      return sum + adults + kids;
    }, 0);

    const confirmedCount = filtered.filter(o => ['confirmed', 'checked_in', 'completed'].includes(o.status)).length;
    const confirmationRate = filtered.length > 0 ? Math.round((confirmedCount / filtered.length) * 100) : 0;
    
    const issueCount = filtered.filter(o => ['unconfirmed_failed', 'cancelled_by_client', 'no_show'].includes(o.status)).length;
    const cancellationRate = filtered.length > 0 ? Math.round((issueCount / filtered.length) * 100) : 0;

    const tourMap: Record<string, { count: number; revenue: number; guests: number }> = {};
    activeOrders.forEach(o => {
      if (!tourMap[o.tourTitle]) {
        tourMap[o.tourTitle] = { count: 0, revenue: 0, guests: 0 };
      }
      tourMap[o.tourTitle].count += 1;
      tourMap[o.tourTitle].revenue += o.totalPrice;
      const aM = o.guests?.match(/(\d+)\s*взр/);
      const cM = o.guests?.match(/(\d+)\s*дет/);
      tourMap[o.tourTitle].guests += (aM ? parseInt(aM[1], 10) : 1) + (cM ? parseInt(cM[1], 10) : 0);
    });

    const topTours = Object.entries(tourMap)
      .map(([title, stats]) => ({ title, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    const hotelMap: Record<string, { count: number; revenue: number }> = {};
    activeOrders.forEach(o => {
      const hotel = o.hotel && o.hotel !== 'Не указан' ? o.hotel : 'Отель не указан';
      if (!hotelMap[hotel]) hotelMap[hotel] = { count: 0, revenue: 0 };
      hotelMap[hotel].count += 1;
      hotelMap[hotel].revenue += o.totalPrice;
    });

    const topHotels = Object.entries(hotelMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const channels = {
      whatsapp: filtered.filter(o => o.contactMethod === 'WhatsApp').length,
      telegram: filtered.filter(o => o.contactMethod === 'Telegram').length,
      call: filtered.filter(o => o.contactMethod === 'Звонок').length,
    };

    return {
      totalOrders: filtered.length,
      activeOrdersCount: activeOrders.length,
      totalRevenue: totalRev,
      avgCheck,
      totalGuests,
      confirmationRate,
      cancellationRate,
      topTours,
      topHotels,
      channels
    };
  }, [orders, analyticsPeriod]);

  return (
    <div className="space-y-6">
      <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#d4af37]" />
            <span>Финансовая аналитика & Эффективность</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Сводка по продажам, выручке и популярности направлений
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#07111e] p-1 rounded-2xl border border-white/10">
            {[
              { id: 'today', label: 'Сегодня' },
              { id: 'yesterday', label: 'Вчера' },
              { id: 'week', label: '7 дней' },
              { id: 'month', label: 'Месяц' },
              { id: 'all', label: 'Всё время' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPeriodChange(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  analyticsPeriod === p.id 
                    ? 'bg-[#d4af37] text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onExportCSV}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Выручка за период</span>
          <span className="text-3xl font-black text-[#f5d77f]">${analyticsData.totalRevenue}</span>
          <span className="text-[10px] text-emerald-400 font-semibold block">По активным броням</span>
        </div>

        <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Средний чек</span>
          <span className="text-3xl font-black text-white">${analyticsData.avgCheck}</span>
          <span className="text-[10px] text-slate-400 font-semibold block">На 1 бронирование</span>
        </div>

        <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Всего туристов</span>
          <span className="text-3xl font-black text-cyan-400">{analyticsData.totalGuests} чел</span>
          <span className="text-[10px] text-cyan-300/80 font-semibold block">Взрослые и дети</span>
        </div>

        <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Конверсия верификации</span>
          <span className="text-3xl font-black text-emerald-400">{analyticsData.confirmationRate}%</span>
          <span className="text-[10px] text-emerald-300/80 font-semibold block">Успешно сдали паспорта</span>
        </div>

        <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 space-y-1">
          <span className="text-slate-400 text-xs font-bold uppercase block">Процент отмен</span>
          <span className="text-3xl font-black text-rose-400">{analyticsData.cancellationRate}%</span>
          <span className="text-[10px] text-rose-300/80 font-semibold block">Отказы / Неявки</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0d223a] p-6 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Топ экскурсий по выручке</span>
            </h3>
            <span className="text-xs text-slate-400">Рейтинг за выбранный период</span>
          </div>

          {analyticsData.topTours.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">Нет данных за этот период</div>
          ) : (
            <div className="space-y-4">
              {analyticsData.topTours.map((tItem, idx) => {
                const percent = Math.round((tItem.revenue / (analyticsData.totalRevenue || 1)) * 100);
                return (
                  <div key={tItem.title} className="bg-[#07111e] p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f5d77f] font-mono text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-sm text-white">{tItem.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-[#f5d77f]">${tItem.revenue}</span>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {tItem.count} броней • {tItem.guests} чел.
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#e5c158] to-[#aa7c11] rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#0d223a] p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>Топ отелей туристов</span>
            </h3>

            {analyticsData.topHotels.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">Нет данных</div>
            ) : (
              <div className="space-y-2.5">
                {analyticsData.topHotels.map((h, i) => (
                  <div key={h.name} className="flex items-center justify-between p-3 rounded-xl bg-[#07111e] border border-white/5 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-slate-500 font-bold">{i + 1}.</span>
                      <span className="font-bold text-white truncate">{h.name}</span>
                    </div>
                    <span className="bg-cyan-500/10 text-cyan-400 font-bold px-2 py-0.5 rounded-md shrink-0">
                      {h.count} заявок
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#0d223a] p-6 rounded-3xl border border-white/10 space-y-3.5">
            <h3 className="font-extrabold text-white text-base">Каналы связи клиентов</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-[#07111e] rounded-xl">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </span>
                <span className="font-black text-white">{analyticsData.channels.whatsapp}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#07111e] rounded-xl">
                <span className="text-sky-400 font-bold flex items-center gap-1.5">
                  <Send className="w-4 h-4" /> Telegram
                </span>
                <span className="font-black text-white">{analyticsData.channels.telegram}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#07111e] rounded-xl">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4" /> Звонок по телефону
                </span>
                <span className="font-black text-white">{analyticsData.channels.call}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};