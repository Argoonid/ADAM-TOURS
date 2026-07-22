import React, { useState, useEffect } from 'react';
import { 
  Lock, KeyRound, Compass, ClipboardList, Megaphone, 
  Save, Users, CheckCircle2, MessageCircle, LogOut, ArrowLeft,
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
  guests: string;
  totalPrice: number;
  paymentMethod?: string;
  isPaid?: boolean;
  transactionId?: string | null;
  status: 'new' | 'confirmed' | 'cancelled' | 'checked_in';
  checkedInAt?: string;
  createdAt: string;
}

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
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Авторизация
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('elina_admin_auth') === 'true';
  });

  const [pin, setPin] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'tours' | 'orders' | 'marketing'>('orders');
  const [localTours, setLocalTours] = useState<Tour[]>(tours);
  const [localPromo, setLocalPromo] = useState<string>(promoText);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Состояние модального окна QR-сканера гида
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // 1. Загрузка ЖИВЫХ заявок из localStorage с fallback на демо-данные
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('elina_orders_data');
    return saved ? JSON.parse(saved) : [
      {
        id: 'EL-8492',
        clientName: 'Алексей Смирнов',
        phone: '+7 911 234 56 78',
        hotel: 'Rixos Sharm El Sheikh',
        tourTitle: 'СУПЕР САФАРИ на баггах',
        date: '24 мая 2026',
        guests: '2 взр, 1 дет',
        totalPrice: 90,
        paymentMethod: 'Наличными гиду',
        isPaid: false,
        status: 'new',
        createdAt: '10:42',
      },
      {
        id: 'EL-3105',
        clientName: 'Мария Иванова',
        phone: '+7 903 987 65 43',
        hotel: 'Albatros Aqua Park',
        tourTitle: 'Вечерний круиз на яхте',
        date: '25 мая 2026',
        guests: '2 взр',
        totalPrice: 70,
        paymentMethod: 'Картой на сайте',
        isPaid: true,
        transactionId: 'TXN-749201',
        status: 'confirmed',
        createdAt: 'Вчера',
      },
    ];
  });

  // 2. Слушатель для реального времени (обновляет список при новой брони или чек-ине)
  useEffect(() => {
    const handleOrdersUpdate = () => {
      const saved = localStorage.getItem('elina_orders_data');
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    };

    window.addEventListener('elina_orders_updated', handleOrdersUpdate);
    window.addEventListener('storage', handleOrdersUpdate);

    return () => {
      window.removeEventListener('elina_orders_updated', handleOrdersUpdate);
      window.removeEventListener('storage', handleOrdersUpdate);
    };
  }, []);

  useEffect(() => {
    setLocalTours(tours);
  }, [tours]);

  useEffect(() => {
    setLocalPromo(promoText);
  }, [promoText]);

  // Авторизация
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('elina_admin_auth');
  };

  // Смена статуса заказа
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    localStorage.setItem('elina_orders_data', JSON.stringify(updated));
    window.dispatchEvent(new Event('elina_orders_updated'));
  };

  // Удаление заказа
  const handleDeleteOrder = (orderId: string) => {
    if (confirm(`${t('admin.confirm_delete', 'Удалить заявку')} #${orderId}?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem('elina_orders_data', JSON.stringify(updated));
      window.dispatchEvent(new Event('elina_orders_updated'));
    }
  };

  const handleTourChange = (id: string, field: keyof Tour, value: any) => {
    const updated = localTours.map(t => (t.id === id ? { ...t, [field]: value } : t));
    setLocalTours(updated);
  };

  const handleSaveChanges = () => {
    onUpdateTours(localTours);
    onUpdatePromoText(localPromo);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Вычисления для аналитики
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const checkedInCount = orders.filter(o => o.status === 'checked_in').length;

  // --- 1. ЭКРАН ВХОДА В АДМИНКУ ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900">
              {t('admin.login_title', 'Вход в панель управления')}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Elina Tours Egypt • {t('admin.enter_password', 'Введите пароль доступа')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="password"
                placeholder={t('admin.password_placeholder', 'Пароль (1234)')}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-center tracking-widest font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {authError && (
              <span className="text-xs font-bold text-rose-600 block">
                {t('admin.invalid_pin', 'Неверный пароль. Попробуйте 1234')}
              </span>
            )}

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold py-3.5 rounded-2xl transition-all cursor-pointer shadow-lg active:scale-95 text-xs"
            >
              {t('admin.login_btn', 'Войти в систему')}
            </button>
          </form>

          <button
            onClick={onGoToSite}
            className="text-slate-400 hover:text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('admin.back_to_site', 'Вернуться на сайт')}</span>
          </button>
        </div>
      </div>
    );
  }

  // --- 2. ЭКРАН РАБОЧЕГО КАБИНЕТА ---
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Шапка Панели */}
      <header className="bg-slate-950 text-white px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl">
            E
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight">Elina Tours Admin</h1>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 
              {t('admin.crm_active', 'CRM активна')}
            </span>
          </div>
        </div>

        {/* Навигация */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('admin.tab_orders', 'Заявки')} ({orders.length})</span>
            {newOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                +{newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tours')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tours' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t('admin.prices_seats', 'Цены & Места')} ({localTours.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('marketing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'marketing' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>{t('admin.tab_marketing', 'Акции')}</span>
          </button>
        </div>

        {/* 📷 КНОПКА СКАНЕРА ГИДА И ДЕЙСТВИЯ */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={() => setIsScannerOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>{t('admin.guide_scanner', 'Сканер гида')}</span>
          </button>

          <button
            onClick={onGoToSite}
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            {t('admin.to_site', 'На сайт ↗')}
          </button>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 transition-colors cursor-pointer"
            title={t('admin.logout', 'Выйти')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Основная область */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Карточки экспресс-аналитики */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t('admin.revenue', 'Выручка')}
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">${totalRevenue}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t('admin.total_orders', 'Всего заявок')}
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">{orders.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t('admin.new_orders', 'Новые заявки')}
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">{newOrdersCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Метрика чек-инов гида */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">
                {t('admin.in_bus', 'В автобусе (Check-In)')}
              </span>
              <span className="text-2xl font-black text-indigo-600 mt-1 block">{checkedInCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bus className="w-6 h-6" />
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{t('admin.changes_saved', 'Изменения успешно сохранены! Обновите сайт, чтобы проверить.')}</span>
          </div>
        )}

        {/* ТАБ 1: РЕЕСТР ЗАЯВОК */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {t('admin.client_bookings', 'Поступившие брони клиентов')}
              </h3>
              <span className="text-xs text-slate-400">
                {t('admin.wa_notice', 'Нажмите на номер WhatsApp для быстрой связи')}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl text-center text-slate-400 font-medium border border-slate-200">
                {t('admin.no_orders', 'Заявок пока нет. Сделайте тестовое бронирование на сайте!')}
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div 
                    key={ord.id} 
                    className={`bg-white p-5 rounded-3xl border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      ord.status === 'new' 
                        ? 'border-amber-300 ring-2 ring-amber-400/20' 
                        : ord.status === 'checked_in'
                        ? 'border-indigo-300 bg-indigo-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-slate-900 text-amber-400 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-lg">
                          #{ord.id}
                        </span>
                        
                        <h4 className="font-extrabold text-slate-900 text-base">{ord.clientName}</h4>
                        <span className="text-xs text-slate-400">• {ord.createdAt}</span>

                        {/* Переключатель статуса */}
                        <div className="flex items-center gap-1 ml-auto md:ml-2 flex-wrap">
                          <button
                            onClick={() => handleStatusChange(ord.id, 'new')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                              ord.status === 'new' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {t('admin.status_new', '🟡 Новая')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(ord.id, 'confirmed')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                              ord.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {t('admin.status_confirmed', '🟢 Подтверждена')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(ord.id, 'checked_in')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                              ord.status === 'checked_in' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {t('admin.status_checked_in', '🚌 В автобусе')}
                          </button>
                          <button
                            onClick={() => handleStatusChange(ord.id, 'cancelled')}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black cursor-pointer transition-colors ${
                              ord.status === 'cancelled' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {t('admin.status_cancelled', '🔴 Отмена')}
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1.5 font-medium items-center">
                        <span>📍 <strong>{t('modal.tour', 'Экскурсия:')}</strong> {ord.tourTitle}</span>
                        <span>📅 <strong>{t('modal.tour_date', 'Дата:')}</strong> {ord.date}</span>
                        <span>🏨 <strong>{t('modal.hotel', 'Отель:')}</strong> {ord.hotel}</span>
                        <span>👥 <strong>{t('modal.guests', 'Состав:')}</strong> {ord.guests}</span>
                        
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <strong>{t('modal.payment_method', 'Способ оплаты')}:</strong> {ord.paymentMethod || t('modal.not_specified', 'Не указан')}
                        </span>

                        {/* Плашка статуса онлайн-эквайринга */}
                        {ord.isPaid ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                            {t('admin.paid_badge', '🟢 ОПЛАЧЕНО')} {ord.transactionId ? `(#${ord.transactionId})` : ''}
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {t('admin.unpaid_badge', '⏳ Наличные / Ожидает оплаты')}
                          </span>
                        )}

                        {ord.checkedInAt && (
                          <span className="bg-indigo-100 text-indigo-900 font-bold text-[10px] px-2 py-0.5 rounded-md">
                            ⏰ {t('admin.seated_at', 'Посажен в')} {ord.checkedInAt}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className="text-2xl font-black text-emerald-600">${ord.totalPrice}</span>
                      
                      <a
                        href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 text-xs font-bold shadow-md active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{t('admin.write_wa', 'Написать в WA')}</span>
                      </a>

                      <button
                        onClick={() => handleDeleteOrder(ord.id)}
                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title={t('admin.delete_order', 'Удалить заявку')}
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

        {/* ТАБ 2: УПРАВЛЕНИЕ ЦЕНАМИ И МЕСТАМИ */}
        {activeTab === 'tours' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {t('admin.tour_editor', 'Редактор экскурсий')}
                </h3>
                <p className="text-slate-500 text-xs">
                  {t('admin.tour_editor_sub', 'Меняйте цены и остаток мест — изменения сразу попадут на сайт')}
                </p>
              </div>

              <button
                onClick={handleSaveChanges}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 rounded-2xl text-xs transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>{t('admin.save_all', 'Сохранить всё')}</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-4">{t('admin.th_tour_name', 'Название экскурсии')}</th>
                    <th className="p-4">{t('admin.th_price_adult', 'Цена Взрослый ($)')}</th>
                    <th className="p-4">{t('admin.th_price_child', 'Цена Ребенок ($)')}</th>
                    <th className="p-4">{t('admin.th_available_seats', 'Свободно мест')}</th>
                    <th className="p-4">{t('admin.th_badge', 'Бэйдж')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
                  {localTours.map((tourItem) => (
                    <tr key={tourItem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <span className="font-bold block text-sm">
                          {getLocalizedText(tourItem.title, currentLang)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {getLocalizedText(tourItem.categoryLabel, currentLang)}
                        </span>
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={tourItem.priceAdult}
                          onChange={(e) => handleTourChange(tourItem.id, 'priceAdult', parseInt(e.target.value) || 0)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </td>

                      <td className="p-4">
                        <input
                          type="number"
                          value={tourItem.priceChild}
                          onChange={(e) => handleTourChange(tourItem.id, 'priceChild', parseInt(e.target.value) || 0)}
                          className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 w-28 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-900">
                          <Users className="w-4 h-4 text-amber-600 shrink-0" />
                          <input
                            type="number"
                            value={tourItem.availableSeats}
                            onChange={(e) => handleTourChange(tourItem.id, 'availableSeats', parseInt(e.target.value) || 0)}
                            className="w-full bg-transparent font-bold focus:outline-none"
                          />
                        </div>
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleTourChange(tourItem.id, 'featured', !tourItem.featured)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            tourItem.featured
                              ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {tourItem.featured ? `🔥 ${t('tour.popular', 'Популярно')}` : t('admin.regular', 'Обычный')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ТАБ 3: АКЦИИ */}
        {activeTab === 'marketing' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-lg">
              {t('admin.banner_text_title', 'Текст верхней акции')}
            </h3>
            <p className="text-slate-500 text-xs">
              {t('admin.banner_text_sub', 'Этот текст бежит в самом верху сайта')}
            </p>

            <input
              type="text"
              value={localPromo}
              onChange={(e) => setLocalPromo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={handleSaveChanges}
              className="bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold px-6 py-3 rounded-2xl text-xs transition-all cursor-pointer shadow-md"
            >
              {t('admin.save_banner', 'Сохранить баннер')}
            </button>
          </div>
        )}

      </main>

      {/* 📷 МОДАЛЬНОЕ ОКНО СКАНЕРА ГИДА */}
      <GuideScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />

    </div>
  );
};