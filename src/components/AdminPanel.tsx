import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, KeyRound, Compass, ClipboardList, Megaphone, 
  LogOut, ArrowLeft, Camera, BarChart3, CalendarDays 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tour } from '../data/tours';
import { GuideScannerModal } from './GuideScannerModal';
import { VoucherModal, type VoucherData } from './VoucherModal';
import { tourService } from '../services/tourService';
import { supabase } from '../services/supabase';

// Импорт модульных компонентов
import { type Order, type OrderStatus, getSafeDate } from './admin/types';
import { OrdersTab } from './admin/OrdersTab';
import { AnalyticsTab } from './admin/AnalyticsTab';
import { ManifestTab } from './admin/ManifestTab';
import { ToursTab } from './admin/ToursTab';
import { MarketingTab } from './admin/MarketingTab';
import { TourEditorModal } from './admin/TourEditorModal';

interface AdminPanelProps {
  tours: Tour[];
  onUpdateTours: (updatedTours: Tour[]) => void;
  promoText: string;
  onUpdatePromoText: (text: string) => void;
  onGoToSite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  tours,
  onUpdateTours,
  promoText,
  onUpdatePromoText,
  onGoToSite,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('elina_admin_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'manifest' | 'tours' | 'marketing'>('orders');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('week');
  const [manifestDate, setManifestDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const [localTours, setLocalTours] = useState<Tour[]>(tours);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);

  const unconfirmedCount = useMemo(() => {
  return orders.filter(o => o.status === 'unconfirmed' || o.status === 'in_progress' || o.status === 'new').length;
}, [orders]);

  useEffect(() => {
    const checkAndFetchOrders = async () => {
      try {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          const now = Date.now();
          const mappedOrders = await Promise.all(data.map(async (o: any) => {
            const createdAtDate = getSafeDate(o.created_at);
            const createdAtMs = createdAtDate.getTime();
            const isExpired = (o.status === 'unconfirmed' || o.status === 'new' || o.status === 'in_progress') && 
                              (now - createdAtMs > 24 * 60 * 60 * 1000);

            if (isExpired) {
              await supabase.from('orders').update({
                status: 'unconfirmed_failed',
                rejection_reason: 'Автоматическая отмена (истёк срок 24ч на паспорт)'
              }).eq('id', o.id);
              o.status = 'unconfirmed_failed';
            }

            return {
              id: o.id,
              clientName: o.client_name,
              phone: o.phone,
              hotel: o.hotel,
              tourTitle: o.tour_title,
              date: o.tour_date,
              guests: o.guests,
              totalPrice: Number(o.total_price),
              contactMethod: o.contact_method || 'WhatsApp',
              status: o.status || 'unconfirmed',
              rejectionReason: o.rejection_reason || '',
              createdAt: createdAtDate.toISOString(),
              expiresAt: new Date(createdAtMs + 24 * 60 * 60 * 1000).toISOString()
            };
          }));

          setOrders(mappedOrders);
          localStorage.setItem('elina_orders_data', JSON.stringify(mappedOrders));
          return;
        }
      } catch (e) {
        console.warn('Orders fetch fallback:', e);
      }

      const saved = localStorage.getItem('elina_orders_data');
      if (saved) {
        try {
          setOrders(JSON.parse(saved));
        } catch {
          setOrders([]);
        }
      }
    };

    checkAndFetchOrders();
    const channel = supabase
      .channel('admin:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => checkAndFetchOrders())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => { setLocalTours(tours); }, [tours]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === 'elina2026') {
      setIsAuthenticated(true);
      localStorage.setItem('elina_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, reason: string = '') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus, rejectionReason: reason || o.rejectionReason } : o);
    setOrders(updated);
    localStorage.setItem('elina_orders_data', JSON.stringify(updated));

    await supabase.from('orders').update({ status: newStatus, rejection_reason: reason || null }).eq('id', orderId);
  };

  const handleContactAction = (order: Order, actionType: 'request_passport' | 'send_qr') => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${order.id}`;

    const messageText = actionType === 'request_passport'
      ? `Здравствуйте, ${order.clientName}! Ваша заявка #${order.id} на экскурсию «${order.tourTitle}» принята. Отправьте фото загранпаспорта.`
      : `Здравствуйте, ${order.clientName}! Бронь #${order.id} подтверждена! QR-билет: ${qrUrl}. Оплата наличными гиду.`;

    if (order.contactMethod === 'Telegram') {
      window.open(order.phone.startsWith('@') ? `https://t.me/${order.phone.replace('@', '')}` : `https://t.me/+${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
    } else if (order.contactMethod === 'Звонок') {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
    }

    if (actionType === 'request_passport') handleUpdateOrderStatus(order.id, 'in_progress');
    if (actionType === 'send_qr') handleUpdateOrderStatus(order.id, 'confirmed');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Удалить заказ #${orderId}?`)) {
      setOrders(orders.filter(o => o.id !== orderId));
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Клиент', 'Телефон', 'Отель', 'Экскурсия', 'Дата', 'Сумма ($)', 'Статус'];
    const rows = orders.map(o => [`"${o.id}"`, `"${o.clientName}"`, `"${o.phone}"`, `"${o.hotel}"`, `"${o.tourTitle}"`, `"${o.date}"`, o.totalPrice, `"${o.status}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteTour = async (tourId: string) => {
    if (confirm('Удалить эту экскурсию?')) {
      await tourService.deleteTour(tourId);
      const updated = localTours.filter(t => t.id !== tourId);
      setLocalTours(updated);
      onUpdateTours(updated);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07111e] flex items-center justify-center p-4 font-sans">
        <div className="bg-[#0d223a] w-full max-w-md rounded-3xl p-8 shadow-2xl border border-[#d4af37]/30 text-center space-y-6">
          <div className="w-16 h-16 bg-[#d4af37]/10 text-[#d4af37] rounded-2xl flex items-center justify-center mx-auto border border-[#d4af37]/30">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Вход в CRM</h2>
            <p className="text-slate-400 text-xs mt-1">SHARM & ADAM TOURS • Введите PIN (1234)</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                placeholder="PIN (1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-[#07111e] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-center font-mono text-lg font-bold text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            {authError && <span className="text-xs font-bold text-rose-400 block">Неверный PIN-код</span>}
            <button type="submit" className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black py-3.5 rounded-2xl cursor-pointer text-xs">
              Войти в CRM
            </button>
          </form>
          <button type="button" onClick={onGoToSite} className="text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> Вернуться на сайт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100 flex flex-col font-sans">
      <header className="bg-[#040b14] text-white px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-[#d4af37]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f5d77f] to-[#d4af37] text-slate-950 font-black flex items-center justify-center text-xl shadow-md">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight">SHARM & ADAM Tours CRM</h1>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Realtime Database Connected
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0d223a] p-1.5 rounded-2xl border border-white/10 flex-wrap justify-center">
          <button type="button" onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <ClipboardList className="w-4 h-4" />
            <span>Заказы ({orders.length})</span>
            {unconfirmedCount > 0 && <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5">{unconfirmedCount}</span>}
          </button>

          <button type="button" onClick={() => setActiveTab('analytics')} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'analytics' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <BarChart3 className="w-4 h-4" /> Аналитика
          </button>

          <button type="button" onClick={() => setActiveTab('manifest')} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'manifest' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <CalendarDays className="w-4 h-4" /> Манифест
          </button>

          <button type="button" onClick={() => setActiveTab('tours')} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tours' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <Compass className="w-4 h-4" /> Каталог ({localTours.length})
          </button>

          <button type="button" onClick={() => setActiveTab('marketing')} className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'marketing' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}>
            <Megaphone className="w-4 h-4" /> Баннер
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsScannerOpen(true)} className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md">
            <Camera className="w-4 h-4" /> Сканер гида
          </button>
          <button type="button" onClick={onGoToSite} className="text-xs font-bold text-slate-300 hover:text-white bg-[#0d223a] px-3.5 py-2 rounded-xl border border-white/10 cursor-pointer">
            На сайт ↗
          </button>
          <button type="button" onClick={() => { setIsAuthenticated(false); localStorage.removeItem('elina_admin_auth'); }} className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onOpenVoucher={setSelectedVoucher}
            onContactAction={handleContactAction}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab
            orders={orders}
            analyticsPeriod={analyticsPeriod}
            onPeriodChange={setAnalyticsPeriod}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'manifest' && (
          <ManifestTab
            orders={orders}
            manifestDate={manifestDate}
            onDateChange={setManifestDate}
          />
        )}

        {activeTab === 'tours' && (
          <ToursTab
            tours={localTours}
            currentLang={currentLang}
            onOpenCreate={() => { setEditingTour(null); setIsTourModalOpen(true); }}
            onOpenEdit={(t) => { setEditingTour(t); setIsTourModalOpen(true); }}
            onDeleteTour={handleDeleteTour}
          />
        )}

        {activeTab === 'marketing' && (
          <MarketingTab
            promoText={promoText}
            onUpdatePromoText={onUpdatePromoText}
          />
        )}
      </main>

      <VoucherModal isOpen={!!selectedVoucher} onClose={() => setSelectedVoucher(null)} voucher={selectedVoucher} />

      <TourEditorModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        editingTour={editingTour}
        onSaveSuccess={(savedTour, isEdit) => {
          const updated = isEdit ? localTours.map(t => t.id === savedTour.id ? savedTour : t) : [savedTour, ...localTours];
          setLocalTours(updated);
          onUpdateTours(updated);
          setIsTourModalOpen(false);
        }}
      />

      <GuideScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};