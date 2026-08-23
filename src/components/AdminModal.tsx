import React, { useState, useEffect } from 'react';
import { 
  X, Lock, KeyRound, Compass, ClipboardList,
  Megaphone, Save, CheckCircle2, LogOut, ArrowLeft,
  Trash2, Camera, QrCode, MessageCircle, Check, Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';
import { GuideScannerModal } from './GuideScannerModal';
import { supabase } from '../services/supabase';

export interface Order {
  id: string;
  clientName: string;
  phone: string;
  hotel: string;
  tourTitle: string;
  date: string;
  departureTime?: string;
  guests: string;
  totalPrice: number;
  paymentMethod?: string;
  isPaid?: boolean;
  status: 'unconfirmed' | 'confirmed' | 'checked_in' | 'cancelled' | 'new';
  createdAt: string;
}

interface AdminModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  tours: Tour[];
  onUpdateTours: (updatedTours: Tour[]) => void;
  promoText: string;
  onUpdatePromoText: (text: string) => void;
  onGoToSite?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen = true,
  onClose,
  tours,
  onUpdateTours,
  promoText,
  onUpdatePromoText,
  onGoToSite
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'tours' | 'marketing'>('orders');
  const [localTours, setLocalTours] = useState<Tour[]>(tours);
  const [localPromo, setLocalPromo] = useState<string>(promoText);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedQrOrder, setSelectedQrOrder] = useState<Order | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setOrders(data.map((o: any) => ({
            id: o.id,
            clientName: o.client_name,
            phone: o.phone,
            hotel: o.hotel,
            tourTitle: o.tour_title,
            date: o.tour_date,
            guests: o.guests,
            totalPrice: Number(o.total_price),
            status: o.status,
            createdAt: o.created_at || new Date().toISOString()
          })));
          return;
        }
      } catch (err) {
        console.warn('Orders cloud fetch fallback:', err);
      }

      const saved = localStorage.getItem('elina_orders_data');
      if (saved) setOrders(JSON.parse(saved));
    };

    fetchOrders();

    const channel = supabase
      .channel('admin-modal:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setLocalTours(tours);
  }, [tours]);

  useEffect(() => {
    setLocalPromo(promoText);
  }, [promoText]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin === '2026' || pin === '7777') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleSaveTours = () => {
    onUpdateTours(localTours);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSavePromo = () => {
    onUpdatePromoText(localPromo);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status } : o);
    setOrders(updated);
    await supabase.from('orders').update({ status }).eq('id', orderId);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Удалить заявку #${orderId}?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  const getWhatsAppPassportLink = (phone: string, name: string, id: string, tourTitle: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Здравствуйте, ${name}! Ваша бронь #${id} на экскурсию «${tourTitle}» получена. Для регистрации в туристической полиции отправьте, пожалуйста, фото главной страницы загранпаспорта.`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  const getWhatsAppConfirmLink = (phone: string, name: string, id: string, tourTitle: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${id}`;
    const msg = encodeURIComponent(`Здравствуйте, ${name}! Паспорт получен, бронь #${id} на «${tourTitle}» официально подтверждена! ✅\n\nВаш QR-билет для гида: ${qrUrl}\nОплата наличными при посадке.`);
    return `https://wa.me/${cleanPhone}?text=${msg}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative text-white">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="text-center space-y-3 mb-8">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-[#d4af37]">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black">{t('admin.login_title', 'Панель Управления')}</h2>
            <p className="text-xs text-slate-400">
              SHARM & ADAM TOURS • Введите PIN-код сотрудника
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <KeyRound className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Введите PIN (1234)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-center font-mono text-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-rose-500 text-xs text-center mt-2 font-semibold">
                  Неверный PIN-код
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              Войти в CRM
            </button>
          </form>

          {onGoToSite && (
            <button
              onClick={onGoToSite}
              className="w-full mt-4 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Вернуться на сайт</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#07111e] text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f5d77f] to-[#d4af37] text-slate-950 font-black flex items-center justify-center text-lg">
              S
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">SHARM CRM</h3>
              <span className="text-[10px] text-amber-400 font-mono block uppercase">
                Realtime Cloud
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Заказы ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tours' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Экскурсии ({localTours.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'marketing' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Баннер акций</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Сканер гида</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl cursor-pointer"
            title="Выйти"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {(onClose || onGoToSite) && (
            <button
              onClick={onGoToSite || onClose}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>На сайт</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Изменения сохранены!</span>
          </div>
        )}

        {/* ЗАКАЗЫ */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white">Журнал заявок и верификации (24h TTL)</h2>
            {orders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                Заявок пока нет
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#07111e] text-[#f5d77f] font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border border-white/10">
                          #{ord.id}
                        </span>
                        <h4 className="font-bold text-white">{ord.clientName}</h4>
                        <span className="text-xs text-slate-400">• {ord.phone}</span>

                        {ord.status === 'unconfirmed' || ord.status === 'new' ? (
                          <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            🟡 Ожидает паспорта
                          </span>
                        ) : ord.status === 'confirmed' ? (
                          <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            🟢 Подтверждена (QR отправлен)
                          </span>
                        ) : ord.status === 'checked_in' ? (
                          <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            🚌 В автобусе
                          </span>
                        ) : (
                          <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full">
                            🔴 Отменена
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 flex flex-wrap gap-4">
                        <span>📍 <b className="text-slate-200">{ord.tourTitle}</b></span>
                        <span>📅 {ord.date}</span>
                        <span>🏨 {ord.hotel}</span>
                        <span>👥 {ord.guests}</span>
                        <span>💵 Сумма: <b className="text-emerald-400">${ord.totalPrice}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                      <a
                        href={getWhatsAppPassportLink(ord.phone, ord.clientName, ord.id, ord.tourTitle)}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Запросить паспорт</span>
                      </a>

                      <a
                        href={getWhatsAppConfirmLink(ord.phone, ord.clientName, ord.id, ord.tourTitle)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => handleStatusChange(ord.id, 'confirmed')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Подтвердить & QR</span>
                      </a>

                      <button
                        onClick={() => setSelectedQrOrder(ord)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                        title="QR-код"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 rounded-xl"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ТУРЫ */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white">Редактор цен и вместимости</h2>
              <button
                onClick={handleSaveTours}
                className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Сохранить всё</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localTours.map((tour) => (
                <div key={tour.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <div className="h-40 rounded-2xl overflow-hidden relative">
                    <img src={tour.images[0]} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 text-xs font-bold text-white truncate max-w-[90%]">
                      {getLocalizedText(tour.title, currentLang)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Цена Взр. ($)
                      </label>
                      <input
                        type="number"
                        value={tour.priceAdult}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLocalTours(prev => prev.map(t => t.id === tour.id ? { ...t, priceAdult: val } : t));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-amber-400 focus:outline-none"
                      />
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Вместимость (рейс)
                      </label>
                      <input
                        type="number"
                        value={tour.availableSeats}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setLocalTours(prev => prev.map(t => t.id === tour.id ? { ...t, availableSeats: val } : t));
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* МАРКЕТИНГ */}
        {activeTab === 'marketing' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-2xl">
            <h3 className="text-lg font-bold text-white">Текст верхнего рекламного баннера</h3>
            <textarea
              rows={3}
              value={localPromo}
              onChange={e => setLocalPromo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSavePromo}
              className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-6 py-3 rounded-2xl text-xs cursor-pointer"
            >
              Обновить баннер
            </button>
          </div>
        )}
      </main>

      {/* Просмотр QR */}
      {selectedQrOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-mono font-bold text-xs text-amber-600">Билет #{selectedQrOrder.id}</span>
              <button onClick={() => setSelectedQrOrder(null)} className="text-slate-400 hover:text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedQrOrder.id}`} 
              alt="QR Code" 
              className="w-48 h-48 mx-auto rounded-2xl border border-slate-200 p-2"
            />
            <div className="text-xs text-slate-600 space-y-1">
              <div className="font-bold text-slate-900">{selectedQrOrder.tourTitle}</div>
              <div>{selectedQrOrder.clientName} • {selectedQrOrder.date}</div>
              <div className="font-black text-emerald-600">${selectedQrOrder.totalPrice}</div>
            </div>
            <a
              href={getWhatsAppConfirmLink(selectedQrOrder.phone, selectedQrOrder.clientName, selectedQrOrder.id, selectedQrOrder.tourTitle)}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Отправить QR клиенту в WhatsApp
            </a>
          </div>
        </div>
      )}

      <GuideScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};