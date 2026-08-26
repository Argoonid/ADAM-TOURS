import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Ticket, Ban, ChevronDown, Check, Trash2, 
  PhoneCall, Send, MessageCircle, RefreshCw, SlidersHorizontal
} from 'lucide-react';
import { type Order, type OrderStatus, REASON_OPTIONS, getSafeDate } from './types';
import { type VoucherData } from '../VoucherModal';

interface OrdersTabProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => void;
  onDeleteOrder: (orderId: string) => void;
  onOpenVoucher: (voucher: VoucherData) => void;
  onContactAction: (order: Order, actionType: 'request_passport' | 'send_qr') => void;
}

// Полный список всех возможных статусов для ручного переключения
const ALL_MANUAL_STATUSES: { status: OrderStatus; label: string; icon: string; color: string }[] = [
  { status: 'unconfirmed', label: 'Ожидает паспорта (TTL 24ч)', icon: '🟡', color: 'text-amber-400 hover:bg-amber-500/10' },
  { status: 'in_progress', label: 'В работе (запрос отправлен)', icon: '🔵', color: 'text-blue-400 hover:bg-blue-500/10' },
  { status: 'confirmed', label: 'Ожидает посадки (QR активен)', icon: '🟢', color: 'text-emerald-400 hover:bg-emerald-500/10' },
  { status: 'checked_in', label: 'Турист в автобусе', icon: '🚌', color: 'text-indigo-400 hover:bg-indigo-500/10' },
  { status: 'completed', label: 'Экскурсия выполнена', icon: '✅', color: 'text-cyan-400 hover:bg-cyan-500/10' },
  { status: 'unconfirmed_failed', label: 'Не подтверждена (Отказ / Фейк)', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { status: 'cancelled_by_client', label: 'Отменена клиентом', icon: '🚫', color: 'text-rose-400 hover:bg-rose-500/10' },
  { status: 'no_show', label: 'Клиент не явился (No-Show)', icon: '⚠️', color: 'text-rose-400 hover:bg-rose-500/10' },
];

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  onUpdateStatus,
  onDeleteOrder,
  onOpenVoucher,
  onContactAction,
}) => {
  const [orderFilter, setOrderFilter] = useState<'all' | 'unconfirmed' | 'confirmed' | 'checked_in' | 'completed' | 'issues'>('all');
  const [dateQuickFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'price_desc'>('created_desc');

  // Дропдауны
  const [activeCancelDropdownId, setActiveCancelDropdownId] = useState<string | null>(null);
  const [activeStatusOverrideId, setActiveStatusOverrideId] = useState<string | null>(null);

  // Закрытие дропдаунов по клику вне
  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveCancelDropdownId(null);
      setActiveStatusOverrideId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const unconfirmedCount = useMemo(() => {
    return orders.filter(o => o.status === 'unconfirmed' || o.status === 'in_progress' || o.status === 'new').length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return orders.filter(o => {
      if (orderFilter === 'unconfirmed' && o.status !== 'unconfirmed' && o.status !== 'in_progress' && o.status !== 'new') return false;
      if (orderFilter === 'confirmed' && o.status !== 'confirmed') return false;
      if (orderFilter === 'checked_in' && o.status !== 'checked_in') return false;
      if (orderFilter === 'completed' && o.status !== 'completed') return false;
      if (orderFilter === 'issues' && !['unconfirmed_failed', 'cancelled_by_client', 'no_show'].includes(o.status)) return false;

      if (dateQuickFilter === 'today' && !o.date.includes(todayStr)) return false;
      if (dateQuickFilter === 'tomorrow' && !o.date.includes(tomorrowStr)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = o.clientName.toLowerCase().includes(q);
        const matchPhone = o.phone.toLowerCase().includes(q);
        const matchTour = o.tourTitle.toLowerCase().includes(q);
        const matchHotel = o.hotel.toLowerCase().includes(q);
        if (!matchId && !matchName && !matchPhone && !matchTour && !matchHotel) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = getSafeDate(a.createdAt).getTime();
      const timeB = getSafeDate(b.createdAt).getTime();
      if (sortBy === 'created_desc') return timeB - timeA;
      if (sortBy === 'created_asc') return timeA - timeB;
      if (sortBy === 'price_desc') return b.totalPrice - a.totalPrice;
      return 0;
    });
  }, [orders, orderFilter, dateQuickFilter, searchQuery, sortBy]);

  const getExpiryCountdown = (createdAt: string, status: OrderStatus) => {
    if (status !== 'unconfirmed' && status !== 'in_progress' && status !== 'new') return null;
    const createdTime = getSafeDate(createdAt).getTime();
    const expiresTime = createdTime + 24 * 60 * 60 * 1000;
    const diffMs = expiresTime - Date.now();
    if (diffMs <= 0) return { text: 'Аннулируется', isExpired: true };
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `Осталось ${hours}ч ${mins}м`, isExpired: false };
  };

  return (
    <div className="space-y-5">
      {/* Шапка фильтров */}
      <div className="bg-[#0d223a] p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setOrderFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'all' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'bg-[#07111e] text-slate-400 hover:text-white'
            }`}
          >
            Все ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('unconfirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'unconfirmed' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-[#07111e] text-amber-300/80 hover:text-white'
            }`}
          >
            Требуют паспорта ({unconfirmedCount})
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'confirmed' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-[#07111e] text-emerald-400/80 hover:text-white'
            }`}
          >
            Ожидают посадки ({orders.filter(o => o.status === 'confirmed').length})
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('checked_in')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'checked_in' ? 'bg-indigo-500 text-white shadow-md' : 'bg-[#07111e] text-indigo-300/80 hover:text-white'
            }`}
          >
            В автобусе ({orders.filter(o => o.status === 'checked_in').length})
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'completed' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-[#07111e] text-cyan-300/80 hover:text-white'
            }`}
          >
            Выполнены ({orders.filter(o => o.status === 'completed').length})
          </button>
          <button
            type="button"
            onClick={() => setOrderFilter('issues')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              orderFilter === 'issues' ? 'bg-rose-500 text-white shadow-md' : 'bg-[#07111e] text-rose-300/80 hover:text-white'
            }`}
          >
            Отмены ({orders.filter(o => ['unconfirmed_failed', 'cancelled_by_client', 'no_show'].includes(o.status)).length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Поиск по ID, имени, тел..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#07111e] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:border-[#d4af37] outline-none"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#07111e] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-[#d4af37]"
          >
            <option value="created_desc">Сначала новые</option>
            <option value="created_asc">Сначала старые</option>
            <option value="price_desc">По сумме ($)</option>
          </select>
        </div>
      </div>

      {/* Список заявок */}
      {filteredOrders.length === 0 ? (
        <div className="bg-[#0d223a]/60 border border-white/10 rounded-3xl p-12 text-center text-slate-500">
          Заявок в этой категории не найдено
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((ord) => {
            const expiry = getExpiryCountdown(ord.createdAt, ord.status);
            const isCancelOpen = activeCancelDropdownId === ord.id;
            const isOverrideOpen = activeStatusOverrideId === ord.id;

            return (
              <div 
                key={ord.id} 
                className={`bg-[#0d223a] p-5 rounded-3xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                  ord.status === 'unconfirmed' || ord.status === 'in_progress' || ord.status === 'new'
                    ? 'border-amber-400/50 shadow-lg shadow-amber-500/5'
                    : ord.status === 'confirmed'
                    ? 'border-emerald-400/50 shadow-lg shadow-emerald-500/5'
                    : ord.status === 'checked_in'
                    ? 'border-indigo-400/50'
                    : ord.status === 'completed'
                    ? 'border-cyan-400/40 opacity-85'
                    : 'border-rose-400/40 bg-rose-950/10'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-[#07111e] text-[#f5d77f] font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border border-white/10">
                      #{ord.id}
                    </span>
                    <h4 className="font-bold text-white">{ord.clientName}</h4>
                    <span className="text-xs text-slate-400">• {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                      ord.contactMethod === 'WhatsApp' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      ord.contactMethod === 'Telegram' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {ord.contactMethod === 'WhatsApp' ? '📱 WhatsApp' : ord.contactMethod === 'Telegram' ? '✈️ Telegram' : '📞 Звонок'}
                    </span>

                    {/* КЛИКАБЕЛЬНЫЙ БЕЙДЖ СТАТУСА (РУЧНАЯ СМЕНА В 1 КЛИК) */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCancelDropdownId(null);
                          setActiveStatusOverrideId(isOverrideOpen ? null : ord.id);
                        }}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                          ord.status === 'unconfirmed' || ord.status === 'new'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : ord.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : ord.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : ord.status === 'checked_in'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                            : ord.status === 'completed'
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}
                        title="Нажмите, чтобы вручную изменить статус"
                      >
                        <span>
                          {ord.status === 'unconfirmed' || ord.status === 'new'
                            ? `🟡 Ожидает паспорта (${expiry?.text || '24ч'})`
                            : ord.status === 'in_progress'
                            ? '🔵 В работе'
                            : ord.status === 'confirmed'
                            ? '🟢 Ожидает посадки (QR)'
                            : ord.status === 'checked_in'
                            ? '🚌 В автобусе'
                            : ord.status === 'completed'
                            ? '✅ Выполнена'
                            : ord.status === 'unconfirmed_failed'
                            ? `❌ Не подтверждена: ${ord.rejectionReason || 'Отказ'}`
                            : ord.status === 'cancelled_by_client'
                            ? `🚫 Отмена туристом: ${ord.rejectionReason || 'Отказ'}`
                            : `⚠️ No-Show: ${ord.rejectionReason || 'Не явился'}`}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isOverrideOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* МЕНЮ РУЧНОЙ СМЕНЫ СТАТУСА */}
                      {isOverrideOpen && (
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute left-0 top-full mt-2 bg-[#07111e] border-2 border-[#d4af37]/40 rounded-2xl p-2 shadow-2xl z-50 min-w-[280px] space-y-1 animate-fade-in backdrop-blur-xl"
                        >
                          <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-[#f5d77f] font-bold border-b border-white/10 mb-1 flex items-center justify-between">
                            <span>Ручная установка статуса:</span>
                            <SlidersHorizontal className="w-3 h-3" />
                          </div>
                          {ALL_MANUAL_STATUSES.map((st) => (
                            <button
                              key={st.status}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(ord.id, st.status);
                                setActiveStatusOverrideId(null);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                ord.status === st.status 
                                  ? 'bg-[#d4af37] text-slate-950 font-black' 
                                  : st.color
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{st.icon}</span>
                                <span>{st.label}</span>
                              </div>
                              {ord.status === st.status && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap gap-4">
                    <span>📍 <b className="text-white">{ord.tourTitle}</b></span>
                    <span>📅 {ord.date}</span>
                    <span>🏨 {ord.hotel}</span>
                    <span>👥 {ord.guests}</span>
                    <span>💵 К оплате: <b className="text-emerald-400">${ord.totalPrice}</b></span>
                  </div>
                </div>

                {/* ПАНЕЛЬ ДЕЙСТВИЙ */}
                <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                  {(ord.status === 'unconfirmed' || ord.status === 'in_progress' || ord.status === 'new') && (
                    <button
                      type="button"
                      onClick={() => onContactAction(ord, 'request_passport')}
                      className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      {ord.contactMethod === 'WhatsApp' ? <MessageCircle className="w-3.5 h-3.5" /> : ord.contactMethod === 'Telegram' ? <Send className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                      <span>Запросить паспорт</span>
                    </button>
                  )}

                  {(ord.status === 'unconfirmed' || ord.status === 'in_progress' || ord.status === 'new') && (
                    <button
                      type="button"
                      onClick={() => onContactAction(ord, 'send_qr')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Подтвердить & QR</span>
                    </button>
                  )}

                  {ord.status === 'checked_in' && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(ord.id, 'completed')}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer active:scale-95"
                    >
                      Завершить тур (Выполнена)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onOpenVoucher({
                      id: ord.id,
                      clientName: ord.clientName,
                      phone: ord.phone,
                      hotel: ord.hotel || 'Не указан',
                      tourTitle: ord.tourTitle,
                      date: ord.date,
                      departureTime: '08:00',
                      guests: ord.guests,
                      totalPrice: ord.totalPrice,
                      paymentMethod: 'Наличными гиду в автобусе',
                      isPaid: ord.isPaid || false,
                      status: ord.status,
                    })}
                    className="px-3 py-2 bg-[#07111e] hover:bg-slate-800 text-[#f5d77f] rounded-xl border border-white/10 flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-[#d4af37]" />
                    <span>Ваучер</span>
                  </button>

                  {/* МЕНЮ ОТМЕНЫ И СМЕНЫ СТАТУСА */}
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveStatusOverrideId(null);
                        setActiveCancelDropdownId(isCancelOpen ? null : ord.id);
                      }}
                      className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Статус / Отмена</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isCancelOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isCancelOpen && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1.5 bg-[#07111e] border-2 border-white/20 rounded-2xl p-2 shadow-2xl z-50 min-w-[280px] space-y-1 backdrop-blur-xl"
                      >
                        {/* Быстрое восстановление */}
                        {(ord.status === 'unconfirmed_failed' || ord.status === 'cancelled_by_client' || ord.status === 'no_show') && (
                          <div className="border-b border-white/10 pb-1 mb-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateStatus(ord.id, 'confirmed');
                                setActiveCancelDropdownId(null);
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Восстановить в «Ожидает посадки»</span>
                            </button>
                          </div>
                        )}

                        <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10 mb-1">
                          Причины отмены заказа:
                        </div>
                        {REASON_OPTIONS.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(ord.id, opt.status, opt.reason);
                              setActiveCancelDropdownId(null);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${opt.color}`}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteOrder(ord.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl transition-colors cursor-pointer"
                    title="Удалить навсегда"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};