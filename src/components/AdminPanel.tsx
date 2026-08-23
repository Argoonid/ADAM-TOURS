import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, KeyRound, Compass, ClipboardList, Megaphone, 
  Users, CheckCircle2, MessageCircle, LogOut, ArrowLeft,
  Trash2, DollarSign, Camera, Plus,
  Globe, Loader2, Edit3, Check, AlertTriangle, X, Ticket,
  PhoneCall, Send, Search, Clock, Ban, 
  ChevronDown, BarChart3, TrendingUp, CalendarDays, FileSpreadsheet, 
  Printer, Building2, MapPin
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';
import { GuideScannerModal } from './GuideScannerModal';
import { VoucherModal, type VoucherData } from './VoucherModal';
import { tourService } from '../services/tourService';
import { supabase } from '../services/supabase';

export type OrderStatus = 
  | 'unconfirmed'           // Ожидает паспорта (начальный)
  | 'in_progress'           // В работе (менеджер связался)
  | 'confirmed'             // Ожидает посадки (паспорт проверен, QR активен)
  | 'checked_in'             // Турист посажен в автобус
  | 'completed'              // Экскурсия успешно завершена
  | 'unconfirmed_failed'    // Не подтверждена (турист не дал паспорт / фейк)
  | 'cancelled_by_client'   // Отменена клиентом
  | 'no_show'               // Клиент не прибыл к трансферу
  | 'new';

export interface Order {
  id: string;
  clientName: string;
  phone: string;
  email?: string;
  hotel: string;
  tourTitle: string;
  date: string;
  guests: string;
  totalPrice: number;
  paymentMethod?: string;
  contactMethod: 'WhatsApp' | 'Telegram' | 'Звонок' | string;
  isPaid?: boolean;
  status: OrderStatus;
  rejectionReason?: string;
  checkedInAt?: string;
  createdAt: string;
  expiresAt?: string;
}

interface AdminPanelProps {
  tours: Tour[];
  onUpdateTours: (updatedTours: Tour[]) => void;
  promoText: string;
  onUpdatePromoText: (text: string) => void;
  onGoToSite: () => void;
}

const REASON_OPTIONS: { label: string; status: OrderStatus; reason: string; icon: string; color: string }[] = [
  { label: 'Игнорирует сообщения', status: 'unconfirmed_failed', reason: 'Игнорирует сообщения', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Фейковый номер телефона', status: 'unconfirmed_failed', reason: 'Фейковый номер', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Отказ присылать паспорт', status: 'unconfirmed_failed', reason: 'Отказался давать паспорт', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Клиент передумал / заболел', status: 'cancelled_by_client', reason: 'Передумал / заболел', icon: '🚫', color: 'text-amber-400 hover:bg-amber-500/10' },
  { label: 'Другие планы у туриста', status: 'cancelled_by_client', reason: 'Изменились планы', icon: '🚫', color: 'text-amber-400 hover:bg-amber-500/10' },
  { label: 'Клиент не прибыл (No-Show)', status: 'no_show', reason: 'Не вышел к трансферу (No-Show)', icon: '⚠️', color: 'text-slate-300 hover:bg-white/10' },
];

// Безопасный парсинг дат
const getSafeDate = (val?: string): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};

async function translateText(text: string, targetLang: 'en' | 'it'): Promise<string> {
  if (!text || !text.trim()) return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|${targetLang}`);
    const data = await res.json();
    return data.responseData?.translatedText || text;
  } catch {
    return text;
  }
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
  const [orderFilter, setOrderFilter] = useState<'all' | 'unconfirmed' | 'confirmed' | 'checked_in' | 'completed' | 'issues'>('all');
  const [dateQuickFilter, setDateQuickFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'price_desc'>('created_desc');

  const [analyticsPeriod, setAnalyticsPeriod] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('week');

  const [manifestDate, setManifestDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [localTours, setLocalTours] = useState<Tour[]>(tours);
  const [localPromo, setLocalPromo] = useState<string>(promoText);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [selectedVoucher, setSelectedVoucher] = useState<VoucherData | null>(null);
  const [activeCancelDropdownId, setActiveCancelDropdownId] = useState<string | null>(null);

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [editingTourId, setEditingTourId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    id: string;
    titleRu: string;
    titleEn: string;
    titleIt: string;
    category: 'sea' | 'safari' | 'historical' | 'show';
    categoryLabelRu: string;
    durationRu: string;
    priceAdult: number;
    priceChild: number;
    availableSeats: number;
    featured: boolean;
    overviewRu: string;
    overviewEn: string;
    overviewIt: string;
    imageUrl: string;
    includedRu: string[];
    whatToBringRu: string[];
    options: { nameRu: string; nameEn: string; nameIt: string; price: number }[];
  }>({
    id: '',
    titleRu: '',
    titleEn: '',
    titleIt: '',
    category: 'sea',
    categoryLabelRu: 'Морские прогулки',
    durationRu: '6 часов',
    priceAdult: 30,
    priceChild: 15,
    availableSeats: 20,
    featured: false,
    overviewRu: '',
    overviewEn: '',
    overviewIt: '',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    includedRu: ['Трансфер из отеля', 'Русскоговорящий гид'],
    whatToBringRu: ['Питьевая вода', 'Полотенце'],
    options: []
  });

  const [orders, setOrders] = useState<Order[]>([]);

  const unconfirmedCount = useMemo(() => {
    return orders.filter(o => o.status === 'unconfirmed' || o.status === 'in_progress' || o.status === 'new').length;
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders
      .filter(o => !['unconfirmed_failed', 'cancelled_by_client', 'no_show'].includes(o.status))
      .reduce((sum, o) => sum + o.totalPrice, 0);
  }, [orders]);

  useEffect(() => {
    const handleClickOutside = () => setActiveCancelDropdownId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAndFetchOrders = async () => {
      try {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
          const now = Date.now();
          let hasAutoCancellations = false;

          const mappedOrders = await Promise.all(data.map(async (o: any) => {
            const createdAtDate = getSafeDate(o.created_at);
            const createdAtMs = createdAtDate.getTime();
            const isExpired = (o.status === 'unconfirmed' || o.status === 'new' || o.status === 'in_progress') && 
                              (now - createdAtMs > 24 * 60 * 60 * 1000);

            if (isExpired) {
              hasAutoCancellations = true;
              
              await supabase.from('orders').update({
                status: 'unconfirmed_failed',
                rejection_reason: 'Автоматическая отмена (истёк срок 24ч на паспорт)'
              }).eq('id', o.id);

              const adultMatch = o.guests?.match(/(\d+)\s*взр/);
              const childMatch = o.guests?.match(/(\d+)\s*дет/);
              const adults = adultMatch ? parseInt(adultMatch[1], 10) : 0;
              const kids = childMatch ? parseInt(childMatch[1], 10) : 0;
              const totalToReturn = adults + kids;

              if (totalToReturn > 0 && o.tour_id) {
                const { data: tourData } = await supabase.from('tours').select('available_seats').eq('id', o.tour_id).single();
                if (tourData) {
                  await supabase.from('tours').update({
                    available_seats: (tourData.available_seats || 0) + totalToReturn
                  }).eq('id', o.tour_id);
                }
              }

              o.status = 'unconfirmed_failed';
              o.rejection_reason = 'Автоматическая отмена (истёк срок 24ч на паспорт)';
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

          if (hasAutoCancellations) {
            window.dispatchEvent(new Event('elina_tours_updated'));
          }
          return;
        }
      } catch (e) {
        console.warn('Orders fetch fallback:', e);
      }

      const saved = localStorage.getItem('elina_orders_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setOrders(parsed.map((p: any) => ({
            ...p,
            createdAt: getSafeDate(p.createdAt).toISOString()
          })));
        } catch {
          setOrders([]);
        }
      }
    };

    checkAndFetchOrders();

    const channel = supabase
      .channel('admin:orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        checkAndFetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setLocalTours(tours);
  }, [tours]);

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

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus, reason: string = '') => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus, rejectionReason: reason || o.rejectionReason } : o);
    setOrders(updated);
    localStorage.setItem('elina_orders_data', JSON.stringify(updated));
    window.dispatchEvent(new Event('elina_orders_updated'));

    try {
      await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          rejection_reason: reason || null
        })
        .eq('id', orderId);
    } catch (err) {
      console.error('Supabase status update error:', err);
    }
  };

  const handleQuickCancel = (orderId: string, opt: typeof REASON_OPTIONS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdateOrderStatus(orderId, opt.status, opt.reason);
    setActiveCancelDropdownId(null);
  };

  const handleContactAction = (order: Order, actionType: 'request_passport' | 'send_qr') => {
    const cleanPhone = order.phone.replace(/[^0-9]/g, '');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${order.id}`;

    const passportText = `Здравствуйте, ${order.clientName}! Ваша заявка #${order.id} на экскурсию «${order.tourTitle}» принята. Для оформления разрешения в туристической полиции отправьте, пожалуйста, фото главной страницы загранпаспорта (оригинал с собой брать не нужно).`;
    const confirmQrText = `Здравствуйте, ${order.clientName}! Паспорт получен, бронь #${order.id} на «${order.tourTitle}» официально подтверждена! ✅\n\nВаш посадочный QR-билет для гида: ${qrUrl}\nОплата наличными при посадке. Приятного отдыха!`;

    const messageText = actionType === 'request_passport' ? passportText : confirmQrText;

    if (order.contactMethod === 'Telegram') {
      if (order.phone.startsWith('@')) {
        window.open(`https://t.me/${order.phone.replace('@', '')}`, '_blank');
      } else {
        window.open(`https://t.me/+${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
      }
    } else if (order.contactMethod === 'Звонок') {
      window.location.href = `tel:${cleanPhone}`;
    } else {
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`, '_blank');
    }

    if (actionType === 'request_passport' && (order.status === 'unconfirmed' || order.status === 'new')) {
      handleUpdateOrderStatus(order.id, 'in_progress');
    } else if (actionType === 'send_qr') {
      handleUpdateOrderStatus(order.id, 'confirmed');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm(`Удалить заказ #${orderId} из базы?`)) {
      const updated = orders.filter(o => o.id !== orderId);
      setOrders(updated);
      localStorage.setItem('elina_orders_data', JSON.stringify(updated));
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID Заказа', 'Клиент', 'Телефон', 'Способ связи', 'Отель', 'Экскурсия', 'Дата выезда', 'Гости', 'Сумма ($)', 'Статус', 'Причина отмены', 'Дата создания'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${o.clientName}"`,
      `"${o.phone}"`,
      `"${o.contactMethod}"`,
      `"${o.hotel}"`,
      `"${o.tourTitle}"`,
      `"${o.date}"`,
      `"${o.guests}"`,
      o.totalPrice,
      `"${o.status}"`,
      `"${o.rejectionReason || ''}"`,
      `"${o.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sharm-orders-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const manifestOrders = useMemo(() => {
    return orders.filter(o => {
      const isConfirmed = ['confirmed', 'checked_in'].includes(o.status);
      const matchDate = o.date.includes(manifestDate) || o.createdAt.includes(manifestDate);
      return isConfirmed || matchDate;
    });
  }, [orders, manifestDate]);

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

  const handleOpenCreateModal = () => {
    setEditingTourId(null);
    setFormData({
      id: `tour-${Date.now()}`,
      titleRu: '',
      titleEn: '',
      titleIt: '',
      category: 'sea',
      categoryLabelRu: 'Морские прогулки',
      durationRu: '6 часов',
      priceAdult: 30,
      priceChild: 15,
      availableSeats: 20,
      featured: false,
      overviewRu: '',
      overviewEn: '',
      overviewIt: '',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      includedRu: ['Трансфер из отеля', 'Русскоговорящий гид'],
      whatToBringRu: ['Питьевая вода', 'Полотенце'],
      options: []
    });
    setIsTourModalOpen(true);
  };

  const handleOpenEditModal = (tour: Tour) => {
    setEditingTourId(tour.id);
    setFormData({
      id: tour.id,
      titleRu: typeof tour.title === 'string' ? tour.title : tour.title.ru,
      titleEn: typeof tour.title === 'string' ? tour.title : tour.title.en || '',
      titleIt: typeof tour.title === 'string' ? tour.title : tour.title.it || '',
      category: tour.category,
      categoryLabelRu: typeof tour.categoryLabel === 'string' ? tour.categoryLabel : tour.categoryLabel?.ru || '',
      durationRu: typeof tour.duration === 'string' ? tour.duration : tour.duration?.ru || '',
      priceAdult: tour.priceAdult,
      priceChild: tour.priceChild,
      availableSeats: tour.availableSeats || 20,
      featured: Boolean(tour.featured),
      overviewRu: typeof tour.overview === 'string' ? tour.overview : tour.overview?.ru || '',
      overviewEn: typeof tour.overview === 'string' ? tour.overview : tour.overview?.en || '',
      overviewIt: typeof tour.overview === 'string' ? tour.overview : tour.overview?.it || '',
      imageUrl: tour.images[0] || '',
      includedRu: tour.included.map(i => typeof i === 'string' ? i : i.ru),
      whatToBringRu: (tour.whatToBring || []).map(i => typeof i === 'string' ? i : i.ru),
      options: (tour.options || []).map(opt => ({
        nameRu: typeof opt.name === 'string' ? opt.name : opt.name.ru,
        nameEn: typeof opt.name === 'string' ? opt.name : opt.name.en || '',
        nameIt: typeof opt.name === 'string' ? opt.name : opt.name.it || '',
        price: opt.price
      }))
    });
    setIsTourModalOpen(true);
  };

  const handleAutoTranslateAll = async () => {
    if (!formData.titleRu) {
      alert('Сначала введите название на русском языке!');
      return;
    }
    setIsTranslating(true);
    const [tEn, tIt, oEn, oIt] = await Promise.all([
      translateText(formData.titleRu, 'en'),
      translateText(formData.titleRu, 'it'),
      translateText(formData.overviewRu, 'en'),
      translateText(formData.overviewRu, 'it')
    ]);

    const translatedOptions = await Promise.all(
      formData.options.map(async (opt) => ({
        ...opt,
        nameEn: opt.nameEn || await translateText(opt.nameRu, 'en'),
        nameIt: opt.nameIt || await translateText(opt.nameRu, 'it')
      }))
    );

    setFormData(prev => ({
      ...prev,
      titleEn: tEn,
      titleIt: tIt,
      overviewEn: oEn,
      overviewIt: oIt,
      options: translatedOptions
    }));
    setIsTranslating(false);
  };

  const handleSaveTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleRu) {
      alert('Введите название тура!');
      return;
    }

    const fullTour: Tour = {
      id: formData.id || `tour-${Date.now()}`,
      slug: formData.id || `tour-${Date.now()}`,
      title: {
        ru: formData.titleRu,
        en: formData.titleEn || formData.titleRu,
        it: formData.titleIt || formData.titleRu
      },
      category: formData.category,
      categoryLabel: {
        ru: formData.categoryLabelRu,
        en: formData.categoryLabelRu,
        it: formData.categoryLabelRu
      },
      location: { ru: 'Шарм-эль-Шейх', en: 'Sharm El Sheikh', it: 'Sharm el-Sheikh' },
      duration: { ru: formData.durationRu, en: formData.durationRu, it: formData.durationRu },
      priceAdult: Number(formData.priceAdult),
      priceChild: Number(formData.priceChild),
      childAgeInfo: { ru: 'Дети до 5 лет бесплатно', en: 'Under 5 free', it: 'Sotto 5 gratis' },
      schedule: { ru: 'Ежедневно', en: 'Daily', it: 'Tutti i giorni' },
      departureTime: { ru: '08:00', en: '08:00', it: '08:00' },
      overview: {
        ru: formData.overviewRu,
        en: formData.overviewEn || formData.overviewRu,
        it: formData.overviewIt || formData.overviewRu
      },
      included: formData.includedRu.map(i => ({ ru: i, en: i, it: i })),
      whatToBring: formData.whatToBringRu.map(i => ({ ru: i, en: i, it: i })),
      availableSeats: Number(formData.availableSeats),
      featured: Boolean(formData.featured),
      images: [formData.imageUrl],
      options: formData.options.map(o => ({
        name: { ru: o.nameRu, en: o.nameEn || o.nameRu, it: o.nameIt || o.nameRu },
        price: Number(o.price)
      }))
    };

    const success = await tourService.saveTour(fullTour);
    if (success) {
      const updated = editingTourId 
        ? localTours.map(t => t.id === editingTourId ? fullTour : t)
        : [fullTour, ...localTours];
      
      setLocalTours(updated);
      onUpdateTours(updated);
      setIsTourModalOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert('Ошибка сохранения в базу Supabase!');
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту экскурсию?')) {
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
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black py-3.5 rounded-2xl transition-all cursor-pointer text-xs"
            >
              Войти в CRM
            </button>
          </form>
          <button
            type="button"
            onClick={onGoToSite}
            className="text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Вернуться на сайт
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100 flex flex-col font-sans">
      {/* Главная шапка CRM */}
      <header className="bg-[#040b14] text-white px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-[#d4af37]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f5d77f] to-[#d4af37] text-slate-950 font-black flex items-center justify-center text-xl shadow-md">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight">SHARM & ADAM Tours CRM</h1>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> 
              Realtime Database Connected
            </span>
          </div>
        </div>

        {/* Навигация по вкладкам */}
        <div className="flex items-center gap-1.5 bg-[#0d223a] p-1.5 rounded-2xl border border-white/10 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Заказы ({orders.length})</span>
            {unconfirmedCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5 animate-pulse">
                {unconfirmedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Аналитика & Отчёты</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manifest')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'manifest' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Манифест выездов</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tours')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'tours' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Каталог ({localTours.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('marketing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'marketing' ? 'bg-[#d4af37] text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Баннер</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Сканер гида</span>
          </button>

          <button
            type="button"
            onClick={onGoToSite}
            className="text-xs font-bold text-slate-300 hover:text-white bg-[#0d223a] px-3.5 py-2 rounded-xl border border-white/10 cursor-pointer"
          >
            На сайт ↗
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-bold text-rose-400 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Контент */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* ТАБ: АНАЛИТИКА */}
        {activeTab === 'analytics' && (
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
                      onClick={() => setAnalyticsPeriod(p.id as any)}
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
                  onClick={handleExportCSV}
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
        )}

        {/* ТАБ: МАНИФЕСТ */}
        {activeTab === 'manifest' && (
          <div className="space-y-6">
            <div className="bg-[#0d223a] p-5 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#d4af37]" />
                  <span>Посадочный манифест на выезд</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Готовая ведомость сбора туристов по отелям для гида и водителя трансфера
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={manifestDate}
                  onChange={(e) => setManifestDate(e.target.value)}
                  className="bg-[#07111e] border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                />

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>Печать листа</span>
                </button>
              </div>
            </div>

            {manifestOrders.length === 0 ? (
              <div className="bg-[#0d223a] p-12 rounded-3xl border border-white/10 text-center text-slate-400 text-xs">
                На выбранную дату подтвержденных посадок не найдено
              </div>
            ) : (
              <div className="bg-[#0d223a] rounded-3xl border border-white/10 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#07111e] text-slate-400 font-extrabold border-b border-white/10 uppercase font-mono">
                    <tr>
                      <th className="p-4">Билет</th>
                      <th className="p-4">Отель / Сбор</th>
                      <th className="p-4">Турист & Связь</th>
                      <th className="p-4">Экскурсия</th>
                      <th className="p-4">Гости</th>
                      <th className="p-4">К оплате гиду ($)</th>
                      <th className="p-4 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {manifestOrders.map(mo => (
                      <tr key={mo.id} className="hover:bg-white/5">
                        <td className="p-4 font-mono font-bold text-[#f5d77f]">#{mo.id}</td>
                        <td className="p-4 font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{mo.hotel}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-white block">{mo.clientName}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{mo.phone}</span>
                        </td>
                        <td className="p-4 font-semibold text-slate-200">{mo.tourTitle}</td>
                        <td className="p-4 font-bold text-white">{mo.guests}</td>
                        <td className="p-4 font-black text-sm text-emerald-400">${mo.totalPrice}</td>
                        <td className="p-4 text-center">
                          {mo.status === 'checked_in' ? (
                            <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-indigo-500/40">
                              🚌 В автобусе
                            </span>
                          ) : (
                            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-500/40">
                              🟢 Ожидает
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ТАБ: ЗАКАЗЫ (CRM) */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="bg-[#0d223a] p-4 rounded-3xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                <button
                  type="button"
                  onClick={() => setOrderFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'all' ? 'bg-[#d4af37] text-slate-950' : 'bg-[#07111e] text-slate-400 hover:text-white'
                  }`}
                >
                  Все ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('unconfirmed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'unconfirmed' ? 'bg-amber-500 text-slate-950' : 'bg-[#07111e] text-amber-300/80 hover:text-white'
                  }`}
                >
                  Требуют паспорта ({unconfirmedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('confirmed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'confirmed' ? 'bg-emerald-500 text-slate-950' : 'bg-[#07111e] text-emerald-400/80 hover:text-white'
                  }`}
                >
                  Ожидают посадки ({orders.filter(o => o.status === 'confirmed').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('checked_in')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'checked_in' ? 'bg-indigo-500 text-white' : 'bg-[#07111e] text-indigo-300/80 hover:text-white'
                  }`}
                >
                  В автобусе ({orders.filter(o => o.status === 'checked_in').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'completed' ? 'bg-cyan-500 text-slate-950' : 'bg-[#07111e] text-cyan-300/80 hover:text-white'
                  }`}
                >
                  Выполнены ({orders.filter(o => o.status === 'completed').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('issues')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    orderFilter === 'issues' ? 'bg-rose-500 text-white' : 'bg-[#07111e] text-rose-300/80 hover:text-white'
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
                  className="bg-[#07111e] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-slate-300 outline-none"
                >
                  <option value="created_desc">Сначала новые</option>
                  <option value="created_asc">Сначала старые</option>
                  <option value="price_desc">По сумме ($)</option>
                </select>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-[#0d223a]/60 border border-white/10 rounded-3xl p-12 text-center text-slate-500">
                Заявок в этой категории не найдено
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => {
                  const expiry = getExpiryCountdown(ord.createdAt, ord.status);
                  const isCancelOpen = activeCancelDropdownId === ord.id;

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

                          {ord.status === 'unconfirmed' || ord.status === 'new' ? (
                            <span className="bg-amber-500/20 text-amber-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                              🟡 Ожидает паспорта ({expiry?.text})
                            </span>
                          ) : ord.status === 'in_progress' ? (
                            <span className="bg-blue-500/20 text-blue-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-500/30 flex items-center gap-1">
                              🔵 В работе (запрос отправлен)
                            </span>
                          ) : ord.status === 'confirmed' ? (
                            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              🟢 Ожидает посадки (QR активен)
                            </span>
                          ) : ord.status === 'checked_in' ? (
                            <span className="bg-indigo-500/20 text-indigo-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                              🚌 Турист в автобусе
                            </span>
                          ) : ord.status === 'completed' ? (
                            <span className="bg-cyan-500/20 text-cyan-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                              ✅ Экскурсия выполнена
                            </span>
                          ) : ord.status === 'unconfirmed_failed' ? (
                            <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-rose-500/30">
                              ❌ Не подтверждена: {ord.rejectionReason}
                            </span>
                          ) : ord.status === 'cancelled_by_client' ? (
                            <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-rose-500/30">
                              🚫 Отмена клиентом: {ord.rejectionReason}
                            </span>
                          ) : (
                            <span className="bg-rose-500/20 text-rose-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-rose-500/30">
                              ⚠️ Клиент не прибыл (No-Show)
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-400 flex flex-wrap gap-4">
                          <span>📍 <b className="text-white">{ord.tourTitle}</b></span>
                          <span>📅 {ord.date}</span>
                          <span>🏨 {ord.hotel}</span>
                          <span>👥 {ord.guests}</span>
                          <span>💵 К оплате: <b className="text-emerald-400">${ord.totalPrice}</b></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                        {ord.status === 'unconfirmed' || ord.status === 'in_progress' || ord.status === 'new' ? (
                          <button
                            type="button"
                            onClick={() => handleContactAction(ord, 'request_passport')}
                            className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            {ord.contactMethod === 'WhatsApp' ? <MessageCircle className="w-3.5 h-3.5" /> : ord.contactMethod === 'Telegram' ? <Send className="w-3.5 h-3.5" /> : <PhoneCall className="w-3.5 h-3.5" />}
                            <span>Запросить паспорт</span>
                          </button>
                        ) : null}

                        {ord.status === 'unconfirmed' || ord.status === 'in_progress' || ord.status === 'new' ? (
                          <button
                            type="button"
                            onClick={() => handleContactAction(ord, 'send_qr')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Подтвердить & QR</span>
                          </button>
                        ) : null}

                        {ord.status === 'checked_in' ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(ord.id, 'completed')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Завершить тур (Выполнена)
                          </button>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setSelectedVoucher({
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
                          title="Посмотреть ваучер"
                        >
                          <Ticket className="w-3.5 h-3.5 text-[#d4af37]" />
                          <span>Ваучер</span>
                        </button>

                        {/* 1-Click Меню причин отмены */}
                        <div className="relative">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveCancelDropdownId(isCancelOpen ? null : ord.id);
                            }}
                            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Отмена</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isCancelOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isCancelOpen && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-full mt-1.5 bg-[#07111e] border border-white/20 rounded-2xl p-2 shadow-2xl z-50 min-w-[260px] space-y-1 animate-fade-in"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-white/10 mb-1">
                                Выберите причину отмены:
                              </div>
                              {REASON_OPTIONS.map((opt, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={(e) => handleQuickCancel(ord.id, opt, e)}
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
                          onClick={() => handleDeleteOrder(ord.id)}
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
        )}

        {/* ТАБ: ЭКСКУРСИИ */}
        {activeTab === 'tours' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-white text-lg">Каталог экскурсий ({localTours.length})</h3>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Добавить экскурсию
              </button>
            </div>

            <div className="bg-[#0d223a] rounded-3xl border border-white/10 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#07111e] text-slate-400 font-extrabold border-b border-white/10 uppercase font-mono">
                  <tr>
                    <th className="p-4">Фото</th>
                    <th className="p-4">Название</th>
                    <th className="p-4">Категория</th>
                    <th className="p-4">Взр. / Дет. ($)</th>
                    <th className="p-4">Мест</th>
                    <th className="p-4 text-center">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {localTours.map((tItem) => (
                    <tr key={tItem.id} className="hover:bg-white/5">
                      <td className="p-4">
                        <img src={tItem.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      </td>
                      <td className="p-4 font-bold text-white max-w-xs">
                        {getLocalizedText(tItem.title, currentLang)}
                      </td>
                      <td className="p-4 uppercase font-mono text-[10px] text-[#f5d77f] font-bold">
                        {tItem.category}
                      </td>
                      <td className="p-4 font-bold text-white">
                        ${tItem.priceAdult} / ${tItem.priceChild}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {tItem.availableSeats} мест
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(tItem)}
                            className="p-2 bg-[#07111e] hover:bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTour(tItem.id)}
                            className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded-xl cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ТАБ: МАРКЕТИНГ */}
        {activeTab === 'marketing' && (
          <div className="bg-[#0d223a] p-6 rounded-3xl border border-white/10 space-y-4 max-w-2xl">
            <h3 className="font-extrabold text-white text-lg">Текст верхней плашки акций</h3>
            <input
              type="text"
              value={localPromo}
              onChange={(e) => setLocalPromo(e.target.value)}
              className="w-full bg-[#07111e] border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
            />
            <button
              type="button"
              onClick={() => {
                onUpdatePromoText(localPromo);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-6 py-3 rounded-2xl text-xs cursor-pointer"
            >
              Сохранить баннер
            </button>
          </div>
        )}
      </main>

      {/* МОДАЛКА ВАУЧЕРА */}
      <VoucherModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
      />

      {/* МОДАЛКА СОЗДАНИЯ / РЕДАКТИРОВАНИЯ ТУРА */}
      {isTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
          <div className="bg-[#0d223a] w-full max-w-3xl rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 my-auto max-h-[92vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white">
                {editingTourId ? 'Редактировать экскурсию' : 'Добавить новую экскурсию'}
              </h3>
              <button type="button" onClick={() => setIsTourModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTourSubmit} className="space-y-5">
              <div className="flex items-center justify-between bg-[#07111e] p-3.5 rounded-2xl border border-white/10">
                <div className="text-xs text-slate-300">
                  💡 <b>Умный перевод:</b> заполните русские поля и нажмите кнопку для EN и IT версий
                </div>
                <button
                  type="button"
                  onClick={handleAutoTranslateAll}
                  disabled={isTranslating}
                  className="bg-[#d4af37] hover:bg-[#e5c158] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isTranslating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  <span>{isTranslating ? 'Перевод...' : 'Автоперевод'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#f5d77f]">Название экскурсии (RU / EN / IT)</label>
                <input
                  type="text"
                  required
                  placeholder="Название (RU) *"
                  value={formData.titleRu}
                  onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                  className="w-full bg-[#07111e] border border-white/10 rounded-xl p-3 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Title (EN)"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:border-[#d4af37] outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Titolo (IT)"
                    value={formData.titleIt}
                    onChange={(e) => setFormData({ ...formData, titleIt: e.target.value })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-slate-300 focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#f5d77f] mb-1">Категория</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  >
                    <option value="sea">Морские (sea)</option>
                    <option value="safari">Сафари (safari)</option>
                    <option value="historical">Исторические (historical)</option>
                    <option value="show">Шоу (show)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#f5d77f] mb-1">Цена Взр. ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceAdult}
                    onChange={(e) => setFormData({ ...formData, priceAdult: Number(e.target.value) })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#f5d77f] mb-1">Цена Дет. ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.priceChild}
                    onChange={(e) => setFormData({ ...formData, priceChild: Number(e.target.value) })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#f5d77f] mb-1">Мест в автобусе</label>
                  <input
                    type="number"
                    required
                    value={formData.availableSeats}
                    onChange={(e) => setFormData({ ...formData, availableSeats: Number(e.target.value) })}
                    className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f5d77f] mb-1">Ссылка на фото (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="flex-1 bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  />
                  <img src={formData.imageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f5d77f] mb-1">Описание экскурсии (RU)</label>
                <textarea
                  rows={2}
                  value={formData.overviewRu}
                  onChange={(e) => setFormData({ ...formData, overviewRu: e.target.value })}
                  className="w-full bg-[#07111e] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:border-[#d4af37] outline-none"
                />
              </div>

              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#f5d77f]">Дополнительные платные опции</label>
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      options: [...formData.options, { nameRu: 'Новая опция', nameEn: '', nameIt: '', price: 10 }]
                    })}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Добавить опцию
                  </button>
                </div>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-[#07111e] p-2 rounded-xl border border-white/10">
                    <input
                      type="text"
                      placeholder="Название (RU)"
                      value={opt.nameRu}
                      onChange={(e) => {
                        const updated = [...formData.options];
                        updated[idx].nameRu = e.target.value;
                        setFormData({ ...formData, options: updated });
                      }}
                      className="flex-1 bg-[#0d223a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#d4af37] outline-none"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        placeholder="Цена"
                        value={opt.price}
                        onChange={(e) => {
                          const updated = [...formData.options];
                          updated[idx].price = Number(e.target.value);
                          setFormData({ ...formData, options: updated });
                        }}
                        className="w-16 bg-[#0d223a] border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-white focus:border-[#d4af37] outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        options: formData.options.filter((_, i) => i !== idx)
                      })}
                      className="p-1 text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black text-sm uppercase rounded-2xl cursor-pointer shadow-lg active:scale-95"
              >
                Сохранить экскурсию в базу Supabase
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Сканер Гида */}
      <GuideScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </div>
  );
};