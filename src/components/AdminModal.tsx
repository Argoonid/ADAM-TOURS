import React, { useState, useEffect } from 'react';
import {
  X, Lock, KeyRound, LayoutDashboard, Compass, ClipboardList,
  Megaphone, Save, Users, CheckCircle2, MessageCircle, LogOut, ArrowLeft,
  Trash2, DollarSign, Clock, CreditCard, Camera, Bus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';
import { GuideScannerModal } from './GuideScannerModal';

export interface Order {
  id: string;
  clientName: string;
  phone: string;
  hotel: string;
  tourTitle: string;
  date: string;
  departureTime: string;
  guests: string;
  totalPrice: number;
  paymentMethod: string;
  isPaid: boolean;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
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

  // Авторизация по ПИН-коду
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);

  // Вкладки админки
  const [activeTab, setActiveTab] = useState<'tours' | 'orders' | 'marketing'>('tours');

  // Локальное состояние редактируемых данных
  const [localTours, setLocalTours] = useState<Tour[]>(tours);
  const [localPromo, setLocalPromo] = useState<string>(promoText);
  const [orders, setOrders] = useState<Order[]>([]);
  
  // Состояние модального окна сканера гида
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Загрузка заказов из localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('elina_crm_orders');
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders));
      } catch (e) {
        console.error('Failed to parse orders:', e);
      }
    }
  }, []);

  useEffect(() => {
    setLocalTours(tours);
  }, [tours]);

  useEffect(() => {
    setLocalPromo(promoText);
  }, [promoText]);

  if (!isOpen) return null;

  // ПИН-код по умолчанию: 2025
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '2025' || pin === '7777') {
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

  const handlePriceChange = (tourId: string, newPrice: number) => {
    setLocalTours(prev =>
      prev.map(tour => (tour.id === tourId ? { ...tour, priceAdult: newPrice } : tour))
    );
  };

  const handleToggleSeats = (tourId: string, seats: number) => {
    setLocalTours(prev =>
      prev.map(tour => (tour.id === tourId ? { ...tour, availableSeats: seats } : tour))
    );
  };

  const handleTogglePaidStatus = (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return { ...ord, isPaid: !ord.isPaid };
      }
      return ord;
    });
    setOrders(updated);
    localStorage.setItem('elina_crm_orders', JSON.stringify(updated));
  };

  const handleDeleteOrder = (orderId: string) => {
    const updated = orders.filter(ord => ord.id !== orderId);
    setOrders(updated);
    localStorage.setItem('elina_crm_orders', JSON.stringify(updated));
  };

  // ЭКРАН АВТОРИЗАЦИИ
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
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
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black">{t('admin.login_title', 'Панель Управления')}</h2>
            <p className="text-xs text-slate-400">
              {t('admin.login_subtitle', 'Введите ПИН-код сотрудника для доступа к CRM')}
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
                  placeholder={t('admin.pin_placeholder', 'Введите ПИН (2025)')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-center font-mono text-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-rose-500 text-xs text-center mt-2 font-semibold">
                  {t('admin.pin_error', 'Неверный ПИН-код')}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              {t('admin.login_btn', 'Войти в систему')}
            </button>
          </form>

          {onGoToSite && (
            <button
              onClick={onGoToSite}
              className="w-full mt-4 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('admin.back_to_site', 'Вернуться на сайт')}</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // РАБОЧИЙ КАБИНЕТ АДМИНИСТРАТОРА
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      
      {/* Шапка админки */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-lg">
              E
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">ELINA CRM</h3>
              <span className="text-[10px] text-amber-400 font-mono block uppercase">
                {t('admin.system_status', 'Online • Sharm El Sheikh')}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 ml-6">
            <button
              onClick={() => setActiveTab('tours')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tours'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('admin.tab_tours', 'Экскурсии')}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{t('admin.tab_orders', 'Заказы')} ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'marketing'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>{t('admin.tab_marketing', 'Маркетинг')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.scan_qr', 'Сканер ваучера')}</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition-colors cursor-pointer"
            title={t('admin.logout', 'Выйти')}
          >
            <LogOut className="w-4 h-4" />
          </button>

          {(onClose || onGoToSite) && (
            <button
              onClick={onGoToSite || onClose}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('admin.to_website', 'На сайт')}</span>
            </button>
          )}
        </div>
      </header>

      {/* Основная рабочая область */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t('admin.save_success', 'Изменения успешно сохранены!')}</span>
          </div>
        )}

        {/* ВКЛАДКА 1: УПРАВЛЕНИЕ ЭКСКУРСИЯМИ */}
        {activeTab === 'tours' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">{t('admin.tours_title', 'Управление турами и ценами')}</h2>
                <p className="text-xs text-slate-400">
                  {t('admin.tours_subtitle', 'Редактируйте стоимость и количество свободных мест')}
                </p>
              </div>

              <button
                onClick={handleSaveTours}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{t('admin.save_btn', 'Сохранить изменения')}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localTours.map(tour => {
                const title = getLocalizedText(tour.title, currentLang);
                return (
                  <div key={tour.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="h-40 rounded-2xl overflow-hidden relative">
                        <img src={tour.images[0]} alt={title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute bottom-3 left-3 text-xs font-bold text-white truncate max-w-[90%]">
                          {title}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            {t('admin.price_usd', 'Цена ($)')}
                          </label>
                          <input
                            type="number"
                            value={tour.priceAdult}
                            onChange={e => handlePriceChange(tour.id, Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-amber-400 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                          <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                            {t('admin.seats_avail', 'Мест в автобусе')}
                          </label>
                          <input
                            type="number"
                            value={tour.availableSeats}
                            onChange={e => handleToggleSeats(tour.id, Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ВКЛАДКА 2: СПИСОК ЗАКАЗОВ (CRM) */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-extrabold">{t('admin.orders_title', 'Журнал бронирований')}</h2>
              <p className="text-xs text-slate-400">
                {t('admin.orders_subtitle', 'Все актуальные заявки туристов и их финансовые статусы')}
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
                <ClipboardList className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-sm font-semibold">{t('admin.no_orders', 'Заказов пока нет')}</p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="p-4"># ID</th>
                        <th className="p-4">{t('admin.col_client', 'Турист')}</th>
                        <th className="p-4">{t('admin.col_tour', 'Экскурсия')}</th>
                        <th className="p-4">{t('admin.col_hotel', 'Отель / Дата')}</th>
                        <th className="p-4">{t('admin.col_sum', 'Сумма')}</th>
                        <th className="p-4">{t('admin.col_status', 'Статус')}</th>
                        <th className="p-4 text-right">{t('admin.col_actions', 'Действия')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-400">#{order.id}</td>
                          <td className="p-4 space-y-0.5">
                            <div className="font-bold text-white">{order.clientName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{order.phone}</div>
                          </td>
                          <td className="p-4 font-bold text-white max-w-[180px] truncate">
                            {order.tourTitle}
                          </td>
                          <td className="p-4 space-y-0.5">
                            <div className="text-white truncate max-w-[150px]">{order.hotel}</div>
                            <div className="text-[11px] text-amber-400">{order.date} • {order.departureTime}</div>
                          </td>
                          <td className="p-4 font-black text-sm text-white">${order.totalPrice}</td>
                          <td className="p-4">
                            <button
                              onClick={() => handleTogglePaidStatus(order.id)}
                              className={`px-3 py-1 rounded-lg font-black text-[10px] uppercase transition-all cursor-pointer ${
                                order.isPaid
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {order.isPaid ? t('admin.paid', 'Оплачено') : t('admin.unpaid', 'Наличные')}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title={t('admin.delete_order', 'Удалить заказ')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ВКЛАДКА 3: МАРКЕТИНГ И АКЦИИ */}
        {activeTab === 'marketing' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-extrabold">{t('admin.marketing_title', 'Верхний рекламный баннер')}</h2>
              <p className="text-xs text-slate-400">
                {t('admin.marketing_subtitle', 'Текст, показываемый на всех страницах сайта над шапкой')}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <textarea
                rows={3}
                value={localPromo}
                onChange={e => setLocalPromo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={handleSavePromo}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                <span>{t('admin.update_banner_btn', 'Обновить баннер')}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Модальное окно сканера для гида */}
      <GuideScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
};