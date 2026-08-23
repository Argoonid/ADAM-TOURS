import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import { enUS } from 'date-fns/locale/en-US';
import { it } from 'date-fns/locale/it';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';

import { 
  X, Calendar, Check, AlertCircle, Plus, Minus, 
  CalendarPlus, CheckCircle2, User, Phone, Mail, Building2,
  Globe2, MessageCircle, FileText, Send, Loader2, Ticket, Banknote, Sparkles, Clock, AlertTriangle, PhoneCall
} from 'lucide-react';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';
import { HoldTimer } from './HoldTimer';
import { VoucherModal, type VoucherData } from './VoucherModal';
import { tourService } from '../services/tourService';
import { supabase } from '../services/supabase';
import { sendBookingToTelegram } from '../services/telegram';

registerLocale('ru', ru);
registerLocale('en', enUS);
registerLocale('it', it);

interface TourModalProps {
  tour: Tour | null;
  onClose: () => void;
  onBookingSuccess?: (tourId: string, updatedSeats: number) => void;
}

const LANGUAGES = ['Русский', 'English', 'Italiano', 'Deutsch', 'Other'];
const CONTACT_METHODS = ['WhatsApp', 'Telegram', 'Звонок'];

const CustomDateInput = React.forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => {
  return (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="w-full bg-white border border-slate-200 hover:border-[#d4af37] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
    >
      <span className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-[#d4af37]" />
        {value || 'Выберите дату'}
      </span>
      <span className="text-[10px] text-[#aa7c11] font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
        Выбрать
      </span>
    </button>
  );
});

export const TourModal: React.FC<TourModalProps> = ({ tour, onClose, onBookingSuccess }) => {
  if (!tour) return null;

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Локализация текстов
  const title = getLocalizedText(tour.title, currentLang);
  const categoryLabel = getLocalizedText(tour.categoryLabel, currentLang);
  const location = getLocalizedText(tour.location, currentLang);
  const duration = getLocalizedText(tour.duration, currentLang);
  const schedule = getLocalizedText(tour.schedule, currentLang);
  const overview = getLocalizedText(tour.overview, currentLang);

  // Параметры расписания
  const availableDays = tour.daysOfWeek && tour.daysOfWeek.length > 0 ? tour.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
  const timeSlots = tour.timeSlots && tour.timeSlots.length > 0 
    ? tour.timeSlots 
    : [getLocalizedText(tour.departureTime, 'ru') || '08:00'];
  const maxCapacity = tour.maxCapacity || tour.availableSeats || 20;

  const getNextValidDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    while (!availableDays.includes(d.getDay())) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  };

  const [selectedDate, setSelectedDate] = useState<Date | null>(getNextValidDate);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(timeSlots[0]);
  const [remainingSeats, setRemainingSeats] = useState<number>(maxCapacity);
  const [isCheckingSeats, setIsCheckingSeats] = useState<boolean>(false);

  const [adults, setAdults] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [adultAges, setAdultAges] = useState<number[]>([25]);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [preferredLang, setPreferredLang] = useState('Русский');
  const [contactMethod, setContactMethod] = useState<'WhatsApp' | 'Telegram' | 'Звонок' | string>('WhatsApp');
  
  // Обязательные поля формы
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [hotel, setHotel] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [isHoldExpired, setIsHoldExpired] = useState(false);

  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  const totalGuests = adults + childrenCount;
  const isSeatsAvailable = remainingSeats >= totalGuests && remainingSeats > 0;

  const dateLocaleMap: Record<string, string> = {
    ru: 'ru',
    en: 'en',
    it: 'it'
  };

  const formattedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const formattedDateDisplay = selectedDate
    ? selectedDate.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Дата не выбрана';

  // Проверка свободных мест на рейс
  useEffect(() => {
    if (!selectedDate) return;
    const fetchRemainingSeats = async () => {
      setIsCheckingSeats(true);
      const seats = await tourService.getSeatsForSlot(tour.id, formattedDateStr, selectedTimeSlot, maxCapacity);
      setRemainingSeats(seats);
      setIsCheckingSeats(false);
    };
    fetchRemainingSeats();
  }, [tour.id, formattedDateStr, selectedTimeSlot, maxCapacity]);

  useEffect(() => {
    setAdultAges(prev => {
      if (prev.length < adults) return [...prev, ...Array(adults - prev.length).fill(25)];
      return prev.slice(0, adults);
    });
  }, [adults]);

  useEffect(() => {
    setChildAges(prev => {
      if (prev.length < childrenCount) return [...prev, ...Array(childrenCount - prev.length).fill(7)];
      return prev.slice(0, childrenCount);
    });
  }, [childrenCount]);

  const basePrice = (adults * tour.priceAdult) + (childrenCount * tour.priceChild);
  const getOptionKey = (optName: any) => optName?.ru || optName?.en || '';
  const optionsPrice = (tour.options || [])
    .filter(opt => selectedOptions.includes(getOptionKey(opt.name)))
    .reduce((sum, opt) => sum + opt.price, 0);

  const totalPrice = Math.max(0, basePrice + optionsPrice);

  const toggleOption = (optKey: string) => {
    setSelectedOptions(prev => prev.includes(optKey) ? prev.filter(i => i !== optKey) : [...prev, optKey]);
  };

  const handleAdultAgeChange = (index: number, val: number) => {
    const updated = [...adultAges];
    updated[index] = val;
    setAdultAges(updated);
  };

  const handleChildAgeChange = (index: number, val: number) => {
    const updated = [...childAges];
    updated[index] = val;
    setChildAges(updated);
  };

  // Валидация
  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; email?: string } = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Введите корректное имя (минимум 2 символа)';
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Введите корректный Email адрес (например, name@mail.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Бронирование
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!selectedDate) {
      alert('Пожалуйста, выберите дату экскурсии');
      return;
    }
    if (isHoldExpired) {
      alert('Время удержания мест истекло. Пожалуйста, выберите дату заново.');
      return;
    }
    if (!isSeatsAvailable) {
      alert(`К сожалению, на этот рейс доступно только ${remainingSeats} мест.`);
      return;
    }

    setIsSubmitting(true);
    const generatedId = `SA-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(generatedId);

    const guestsFormatted = `${adults} взр.${childrenCount > 0 ? `, ${childrenCount} дет.` : ''}`;
    const selectedOptionLabels = (tour.options || [])
      .filter(opt => selectedOptions.includes(getOptionKey(opt.name)))
      .map(opt => getLocalizedText(opt.name, currentLang));

    const voucherPayload: VoucherData = {
      id: generatedId,
      clientName: name,
      phone: `${phone} (${email})`,
      hotel: hotel || 'Не указан',
      tourTitle: title,
      date: formattedDateDisplay,
      departureTime: selectedTimeSlot,
      guests: guestsFormatted,
      totalPrice: totalPrice,
      paymentMethod: 'Наличными гиду в автобусе',
      isPaid: false,
      status: 'unconfirmed',
      transactionId: null,
    };

    setCurrentVoucher(voucherPayload);

    const newSeatsForThisSlot = Math.max(0, remainingSeats - totalGuests);

    // 1. Сохранение в Supabase (с contact_method и status unconfirmed)
    try {
      await supabase
        .from('orders')
        .insert([{
          id: generatedId,
          tour_id: tour.id,
          tour_title: title,
          client_name: `${name} [${email}]`,
          phone: phone,
          hotel: hotel || 'Не указан',
          tour_date: formattedDateStr,
          guests: guestsFormatted,
          total_price: totalPrice,
          status: 'unconfirmed',
          contact_method: contactMethod
        }]);
    } catch (err) {
      console.warn('Supabase order insert fallback:', err);
    }

    // 2. Локальное сохранение
    try {
      const newOrder = {
        ...voucherPayload,
        email,
        contactMethod,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${generatedId}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const existingOrders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
      localStorage.setItem('elina_orders_data', JSON.stringify([newOrder, ...existingOrders]));
      window.dispatchEvent(new Event('elina_orders_updated'));
      window.dispatchEvent(new CustomEvent('elina_tours_updated'));

      if (onBookingSuccess) {
        onBookingSuccess(tour.id, newSeatsForThisSlot);
      }
    } catch (err) {
      console.error('LocalStorage sync error:', err);
    }

    // 3. Отправка графического ваучера в Telegram
    try {
      await sendBookingToTelegram({
        bookingId: generatedId,
        tourTitle: title,
        date: formattedDateDisplay,
        time: selectedTimeSlot,
        adults: adults,
        adultAges: adultAges,
        childrenCount: childrenCount,
        childAges: childAges,
        preferredLang: preferredLang,
        contactMethod: contactMethod,
        paymentMethod: 'Наличными гиду в автобусе',
        name: name,
        phone: phone,
        email: email,
        hotel: hotel || 'Не указан',
        notes: notes,
        selectedOptions: selectedOptionLabels,
        totalPrice: totalPrice,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Telegram error:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCalendar = () => {
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const cleanDate = `${year}${month}${day}`;

    const startTime = `${cleanDate}T080000Z`;
    const endTime = `${cleanDate}T130000Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sharm and Adam Tours//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${title} (#${bookingId})`,
      `DESCRIPTION:Отель: ${hotel || 'Не указан'}.\\nГости: ${adults} взр, ${childrenCount} дет.\\nВремя: ${selectedTimeSlot}.\\nК оплате гиду: $${totalPrice}.`,
      `LOCATION:${location}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sharm-tour-${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative border border-slate-100">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmitBooking} noValidate className="flex flex-col h-full overflow-hidden">
              <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
                
                {/* Баннер */}
                <div className="relative h-56 sm:h-72 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-4 overflow-hidden">
                  <img
                    src={tour.images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-[#07111e]/40 to-transparent flex flex-col justify-end p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[#f5d77f] font-bold text-xs tracking-wider uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" /> {categoryLabel}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        remainingSeats > 5 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                          : remainingSeats > 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {remainingSeats > 0 ? `Свободно на рейс: ${remainingSeats}` : 'Все места заняты'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
                      {title}
                    </h2>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                      <span>⏱ {duration}</span>
                      <span>📍 {location}</span>
                      <span>🗓 {schedule}</span>
                    </div>
                  </div>
                </div>

                {/* Описание */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1.5">
                    {t('modal.about_tour', 'Об экскурсии')}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">{overview}</p>
                </div>

                {/* Включено / Взять с собой */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl">
                    <h4 className="font-bold text-emerald-900 text-xs sm:text-sm mb-2.5 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> 
                      {t('modal.included', 'В стоимость входит')}
                    </h4>
                    <ul className="space-y-1.5">
                      {tour.included.map((item, idx) => (
                        <li key={idx} className="text-xs text-emerald-800 flex items-start gap-1.5">
                          <span className="text-emerald-500">•</span>
                          <span>{getLocalizedText(item, currentLang)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {tour.whatToBring && (
                    <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-2xl">
                      <h4 className="font-bold text-amber-900 text-xs sm:text-sm mb-2.5 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> 
                        {t('modal.what_to_bring', 'Взять с собой')}
                      </h4>
                      <ul className="space-y-1.5">
                        {tour.whatToBring.map((item, idx) => (
                          <li key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                            <span className="text-amber-500">•</span>
                            <span>{getLocalizedText(item, currentLang)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* ДЕТАЛИ ПОЕЗДКИ */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-6">
                  <HoldTimer 
                    initialMinutes={10} 
                    seatsHeld={totalGuests}
                    onExpire={() => setIsHoldExpired(true)} 
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {t('modal.trip_details', 'Детали поездки и время')}
                    </h3>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 self-start sm:self-auto ${
                      isCheckingSeats ? 'bg-slate-200 text-slate-600' :
                      remainingSeats > 5 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      remainingSeats > 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {isCheckingSeats ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Проверка мест...</span>
                        </>
                      ) : remainingSeats > 0 ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Свободно: {remainingSeats} из {maxCapacity} мест</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>На этот выезд мест нет</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        {t('modal.tour_date', 'Дата экскурсии (активны дни проведения)')} *
                      </label>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                          setSelectedDate(date);
                          setIsHoldExpired(false);
                        }}
                        minDate={new Date()}
                        filterDate={(date) => availableDays.includes(date.getDay())}
                        dateFormat="d MMMM yyyy (EEEE)"
                        locale={dateLocaleMap[currentLang] || 'ru'}
                        customInput={<CustomDateInput />}
                        wrapperClassName="w-full"
                        calendarClassName="!font-sans !border-0 !rounded-2xl !shadow-2xl !p-3 !bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Время выезда трансфера *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              selectedTimeSlot === slot
                                ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{slot}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Гости */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div className="bg-white p-3.5 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {t('modal.adults', 'Взрослые')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ${tour.priceAdult} {t('modal.per_person', '/ чел')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAdults(Math.max(1, adults - 1));
                            setIsHoldExpired(false);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm text-slate-900">{adults}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (adults + childrenCount < remainingSeats) {
                              setAdults(adults + 1);
                              setIsHoldExpired(false);
                            } else {
                              alert(`На этот рейс доступно только ${remainingSeats} свободных мест.`);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-3.5 border border-slate-200/60 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {t('modal.children', 'Дети')}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ${tour.priceChild} {t('modal.per_person', '/ чел')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setChildrenCount(Math.max(0, childrenCount - 1));
                            setIsHoldExpired(false);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-sm text-slate-900">{childrenCount}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (adults + childrenCount < remainingSeats) {
                              setChildrenCount(childrenCount + 1);
                              setIsHoldExpired(false);
                            } else {
                              alert(`На этот рейс доступно только ${remainingSeats} свободных мест.`);
                            }
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Опции */}
                  {tour.options && tour.options.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700 block">
                        {t('modal.extra_options', 'Дополнительные опции (по желанию):')}
                      </span>
                      <div className="space-y-2">
                        {tour.options.map((opt, idx) => {
                          const optKey = getOptionKey(opt.name);
                          const optNameLocalized = getLocalizedText(opt.name, currentLang);
                          return (
                            <label
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl cursor-pointer hover:border-[#d4af37] transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={selectedOptions.includes(optKey)}
                                  onChange={() => toggleOption(optKey)}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 cursor-pointer"
                                />
                                <span className="text-xs font-medium text-slate-700">{optNameLocalized}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                {opt.price >= 0 ? `+$${opt.price}` : `-$${Math.abs(opt.price)}`}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Язык и связь */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4 text-[#d4af37]" /> 
                        {t('modal.spoken_lang', 'Разговорный язык')}
                      </label>
                      <select
                        value={preferredLang}
                        onChange={(e) => setPreferredLang(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-600" /> 
                        {t('modal.contact_method', 'Как лучше связаться?')}
                      </label>
                      <div className="flex rounded-xl bg-white border border-slate-200 p-1 gap-1">
                        {CONTACT_METHODS.map((method) => (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setContactMethod(method)}
                            className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              contactMethod === method
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {method}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Гарантия */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider block">
                        Оплата на месте без предоплаты
                      </span>
                      <p className="text-xs text-emerald-800 leading-relaxed mt-0.5">
                        Вы рассчитываетесь лично с гидом наличными при посадке в автобус (принимаются <b>USD, EUR, EGP</b> или перевод).
                      </p>
                    </div>
                  </div>

                  {/* Пояснение о подтверждении личности */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                    <PhoneCall className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-950 leading-relaxed">
                      Для подтверждения личности менеджер свяжется с вами по телефону или в {contactMethod}. Пожалуйста, будьте на связи.
                    </p>
                  </div>

                  {/* Контактные данные */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      Ваши контактные данные (обязательные поля) *
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="text"
                            required
                            placeholder="Ваше имя *"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (errors.name) setErrors({ ...errors, name: undefined });
                            }}
                            className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 ${
                              errors.name ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-400'
                            }`}
                          />
                        </div>
                        {errors.name && <span className="text-[10px] text-rose-500 font-bold mt-1 block">{errors.name}</span>}
                      </div>

                      <div>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="Телефон / Связь *"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              if (errors.phone) setErrors({ ...errors, phone: undefined });
                            }}
                            className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 ${
                              errors.phone ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-400'
                            }`}
                          />
                        </div>
                        {errors.phone && <span className="text-[10px] text-rose-500 font-bold mt-1 block">{errors.phone}</span>}
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          placeholder="Ваш Email (для отправки копии ваучера) *"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: undefined });
                          }}
                          className={`w-full bg-white border rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 ${
                            errors.email ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-400'
                          }`}
                        />
                      </div>
                      {errors.email && <span className="text-[10px] text-rose-500 font-bold mt-1 block">{errors.email}</span>}
                    </div>

                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Название отеля в Шарм-эль-Шейхе (опционально)"
                        value={hotel}
                        onChange={(e) => setHotel(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        placeholder="Комментарий / особые пожелания (детская коляска, трансфер и т.д.)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Подвал */}
              <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {t('modal.total', 'К оплате гиду при посадке:')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${totalPrice}</span>
                    <span className="text-xs text-emerald-600 font-bold ml-1.5">
                      • 0% Предоплаты
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isHoldExpired || !isSeatsAvailable || remainingSeats === 0}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] hover:brightness-110 text-[#07111e] font-black px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('modal.submitting', 'Оформление брони...')}</span>
                    </>
                  ) : remainingSeats === 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Мест нет на этот рейс</span>
                    </>
                  ) : (
                    <>
                      <span>Забронировать</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Экран успеха */
            <div className="p-8 text-center space-y-6 my-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full">
                  Бронь #{bookingId}
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-2">
                  Экскурсия забронирована!
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  Осталось только подтвердить личность через менеджера. Мы свяжемся с вами в течение 15 минут.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center gap-2.5 max-w-md mx-auto text-xs text-amber-900 font-medium">
                <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Для подтверждения личности менеджер свяжется с вами по телефону или в {contactMethod}. Пожалуйста, будьте на связи.</span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200/80 space-y-2.5 max-w-md mx-auto text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Экскурсия:</span>
                  <span className="font-bold text-slate-900">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Дата и рейс:</span>
                  <span className="font-bold text-slate-900">{formattedDateDisplay} ({selectedTimeSlot})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Клиент:</span>
                  <span className="font-bold text-slate-900">{name} ({phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Связь:</span>
                  <span className="font-bold text-[#d4af37]">{contactMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">К оплате гиду:</span>
                  <span className="font-bold text-emerald-600">${totalPrice} (Наличными)</span>
                </div>
              </div>

              <div className="space-y-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-[#07111e] font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer text-sm"
                >
                  <Check className="w-5 h-5" />
                  <span>Понятно</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVoucherOpen(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>QR-Билет</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCalendar}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>В календарь</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <VoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        voucher={currentVoucher}
      />
    </>
  );
};