import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import { enUS } from 'date-fns/locale/en-US';
import { it } from 'date-fns/locale/it';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';

import { 
  X, Calendar, Check, AlertCircle, Plus, Minus, 
  CalendarPlus, CheckCircle2, ShieldCheck, User, Phone, Building2,
  Globe2, MessageCircle, CreditCard, FileText, Send, Loader2, Ticket
} from 'lucide-react';
import { getLocalizedText } from '../data/tours';
import type { Tour } from '../data/tours';
import { HoldTimer } from './HoldTimer';
import { PaymentModal } from './PaymentModal';
import { VoucherModal, type VoucherData } from './VoucherModal';

registerLocale('ru', ru);
registerLocale('en', enUS);
registerLocale('it', it);

const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '1261138294';

interface TourModalProps {
  tour: Tour | null;
  onClose: () => void;
}

const LANGUAGES = ['Русский', 'English', 'Italiano', 'Deutsch', 'Other'];
const CONTACT_METHODS = ['WhatsApp', 'Telegram', 'Call'];

const CustomDateInput = React.forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="w-full bg-white border border-slate-200 hover:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 flex items-center justify-between transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
    >
      <span className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-cyan-600" />
        {value || t('modal.select_date', 'Выберите дату')}
      </span>
      <span className="text-[10px] text-cyan-600 font-semibold bg-cyan-50 px-2 py-0.5 rounded-md">
        {t('modal.change', 'Изменить')}
      </span>
    </button>
  );
});

export const TourModal: React.FC<TourModalProps> = ({ tour, onClose }) => {
  if (!tour) return null;

  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Извлекаем локализованные тексты экскурсии
  const title = getLocalizedText(tour.title, currentLang);
  const categoryLabel = getLocalizedText(tour.categoryLabel, currentLang);
  const location = getLocalizedText(tour.location, currentLang);
  const duration = getLocalizedText(tour.duration, currentLang);
  const schedule = getLocalizedText(tour.schedule, currentLang);
  const departureTime = getLocalizedText(tour.departureTime, currentLang);
  const overview = getLocalizedText(tour.overview, currentLang);

  const PAYMENT_METHODS = [
    { id: 'cash', label: t('modal.pay_cash', 'Наличными гиду') },
    { id: 'card', label: t('modal.pay_card', 'Картой на сайте') },
    { id: 'transfer', label: t('modal.pay_transfer', 'Переводом') },
  ];

  const [adults, setAdults] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  
  const [adultAges, setAdultAges] = useState<number[]>([25]);
  const [childAges, setChildAges] = useState<number[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    new Date(Date.now() + 86400000)
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [preferredLang, setPreferredLang] = useState('Русский');
  const [contactMethod, setContactMethod] = useState('WhatsApp');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [hotel, setHotel] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  
  // Состояния эквайринга
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingOrderPayload, setPendingOrderPayload] = useState<any>(null);

  // 🎟 Состояния ваучера с QR-кодом
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  // Состояние заморозки мест
  const [isHoldExpired, setIsHoldExpired] = useState(false);

  const totalGuests = adults + childrenCount;

  useEffect(() => {
    setAdultAges(prev => {
      if (prev.length < adults) {
        return [...prev, ...Array(adults - prev.length).fill(25)];
      }
      return prev.slice(0, adults);
    });
  }, [adults]);

  useEffect(() => {
    setChildAges(prev => {
      if (prev.length < childrenCount) {
        return [...prev, ...Array(childrenCount - prev.length).fill(7)];
      }
      return prev.slice(0, childrenCount);
    });
  }, [childrenCount]);

  const dateLocaleMap: Record<string, string> = {
    ru: 'ru',
    en: 'en',
    it: 'it'
  };

  const formattedDateText = selectedDate
    ? selectedDate.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : currentLang === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : t('modal.no_date', 'Дата не выбрана');

  const basePrice = (adults * tour.priceAdult) + (childrenCount * tour.priceChild);

  // Считаем доп. опции по ключу ru/en
  const getOptionKey = (optName: any) => optName.ru || optName.en || '';
  const optionsPrice = (tour.options || [])
    .filter(opt => selectedOptions.includes(getOptionKey(opt.name)))
    .reduce((sum, opt) => sum + opt.price, 0);

  const totalPrice = basePrice + optionsPrice;

  const toggleOption = (optKey: string) => {
    setSelectedOptions(prev => 
      prev.includes(optKey) ? prev.filter(item => item !== optKey) : [...prev, optKey]
    );
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

  // 🔥 ОБРАБОТЧИК КЛИКА «ПОДТВЕРДИТЬ БРОНИРОВАНИЕ»
  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert(t('modal.alert_select_date', 'Пожалуйста, выберите дату экскурсии'));
      return;
    }

    if (isHoldExpired) {
      alert(t('modal.alert_hold_expired', 'Время удержания мест истекло. Пожалуйста, обновите выбранную дату.'));
      return;
    }

    const generatedId = `EL-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingId(generatedId);

    const paymentLabel = PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label || 'Наличными гиду';

    // Для телеграма берем названия опций на русском
    const selectedOptionLabels = (tour.options || [])
      .filter(opt => selectedOptions.includes(getOptionKey(opt.name)))
      .map(opt => getLocalizedText(opt.name, currentLang));

    const orderPayload = {
      generatedId,
      paymentLabel,
      totalPrice,
      adults,
      adultAges,
      childrenCount,
      childAges,
      totalGuests,
      formattedDateText,
      preferredLang,
      name,
      phone,
      contactMethod,
      hotel,
      selectedOptions: selectedOptionLabels,
      notes,
    };

    // Если выбрана Онлайн Оплата (Картой или Переводом) -> открываем шлюз
    if (paymentMethod === 'card' || paymentMethod === 'transfer') {
      setPendingOrderPayload(orderPayload);
      setIsPaymentOpen(true);
    } else {
      // Если наличные -> сохраняем сразу
      await finalizeOrderSubmission(orderPayload, false);
    }
  };

  // 🔥 ОКОНЧАТЕЛЬНОЕ СОХРАНЕНИЕ В БАЗУ И ОТПРАВКА В TELEGRAM
  const finalizeOrderSubmission = async (payload: any, isPaidOnline: boolean, txId?: string) => {
    setIsSubmitting(true);

    const guestsFormatted = `${payload.adults} ${t('modal.adult_short', 'взр.')}${payload.childrenCount > 0 ? `, ${payload.childrenCount} ${t('modal.child_short', 'дет.')}` : ''}`;

    // 🎟 Подготавливаем объект ваучера
    setCurrentVoucher({
      id: payload.generatedId,
      clientName: payload.name,
      phone: payload.phone,
      hotel: payload.hotel || t('modal.not_specified', 'Не указан'),
      tourTitle: title,
      date: payload.formattedDateText,
      departureTime: departureTime,
      guests: guestsFormatted,
      totalPrice: payload.totalPrice,
      paymentMethod: payload.paymentLabel,
      isPaid: isPaidOnline,
      transactionId: txId || null,
    });

    const optionsText = payload.selectedOptions.length > 0 
      ? `\n🧩 <b>Доп. опции:</b> ${payload.selectedOptions.join(', ')}` 
      : '';
    const childText = payload.childrenCount > 0 
      ? `\n  • Дети (${payload.childrenCount}): ${payload.childAges.map((a: any) => `${a} лет`).join(', ')}` 
      : '';
    const notesText = payload.notes.trim() ? `\n📝 <b>Примечание:</b> ${payload.notes}` : '';
    const paymentStatusBadge = isPaidOnline ? `🟢 <b>ОПЛАЧЕНО ОНЛАЙН (Чек #${txId})</b>` : `🟡 ${payload.paymentLabel}`;

    const message = `
🔥 <b>НОВАЯ ЗАЯВКА #${payload.generatedId}</b>

📍 <b>Экскурсия:</b> ${title}
📅 <b>Дата:</b> ${payload.formattedDateText} (${departureTime})
💳 <b>Статус оплаты:</b> ${paymentStatusBadge} (<b>$${payload.totalPrice}</b>)

👥 <b>Состав гостей (${payload.totalGuests} чел):</b>
  • Взрослые (${payload.adults}): ${payload.adultAges.map((a: any) => `${a} лет`).join(', ')}${childText}
🗣 <b>Язык общения:</b> ${payload.preferredLang}

👤 <b>Имя:</b> ${payload.name}
📞 <b>Контакт:</b> <code>${payload.phone}</code> (Способ связи: ${payload.contactMethod})
🏨 <b>Отель:</b> ${payload.hotel || 'Не указан'}${optionsText}${notesText}

───
🌐 <i>Заявка с сайта elinatoursegypt.com (Locale: ${currentLang.toUpperCase()})</i>
    `.trim();

    // СОХРАНЯЕМ В ЛОКАЛЬНУЮ БАЗУ CRM
    try {
      const newOrder = {
        id: payload.generatedId,
        clientName: payload.name,
        phone: payload.phone,
        hotel: payload.hotel || t('modal.not_specified', 'Не указан'),
        tourTitle: title,
        date: payload.formattedDateText,
        guests: guestsFormatted,
        totalPrice: payload.totalPrice,
        paymentMethod: payload.paymentLabel,
        isPaid: isPaidOnline,
        transactionId: txId || null,
        status: isPaidOnline ? 'confirmed' : 'new',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const existingOrders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
      localStorage.setItem('elina_orders_data', JSON.stringify([newOrder, ...existingOrders]));
      window.dispatchEvent(new Event('elina_orders_updated'));
    } catch (err) {
      console.error('Ошибка сохранения заказа в CRM:', err);
    }

    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      setIsSuccess(true);
    } catch (err) {
      console.error('Ошибка сети:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
      setIsPaymentOpen(false);
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

    const optionsText = selectedOptions.length > 0 
      ? `\\nExtra: ${selectedOptions.join(', ')}` 
      : '';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Elina Tours Egypt//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${title} (#${bookingId})`,
      `DESCRIPTION:Hotel pickup: ${hotel || 'Not specified'}.\\nGuests: ${adults} adults, ${childrenCount} kids.${optionsText}\\nTotal: $${totalPrice}.`,
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
    link.setAttribute('download', `elina-tour-${bookingId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative border border-slate-100">
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSuccess ? (
            <form onSubmit={handleSubmitBooking} className="flex flex-col h-full overflow-hidden">
              <div className="overflow-y-auto p-5 sm:p-8 space-y-6">
                
                {/* Шапка / Баннер */}
                <div className="relative h-56 sm:h-72 -mx-5 sm:-mx-8 -mt-5 sm:-mt-8 mb-4 overflow-hidden">
                  <img
                    src={tour.images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                    <span className="text-amber-400 font-bold text-xs tracking-wider uppercase mb-1">
                      {categoryLabel}
                    </span>
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

                {/* КАЛЬКУЛЯТОР И ПОЛЯ ЗАЯВКИ */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-6">
                  
                  {/* ВАДЖЕТ ТАЙМЕРА ЗАМОРОЗКИ МЕСТ */}
                  <HoldTimer 
                    initialMinutes={10} 
                    seatsHeld={totalGuests}
                    onExpire={() => setIsHoldExpired(true)} 
                  />

                  <h3 className="font-extrabold text-slate-900 text-base">
                    {t('modal.trip_details', 'Детали поездки')}
                  </h3>

                  {/* Выбор даты */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t('modal.tour_date', 'Дата экскурсии')}
                    </label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => {
                        setSelectedDate(date);
                        setIsHoldExpired(false);
                      }}
                      minDate={new Date()}
                      dateFormat="d MMMM yyyy (EEEE)"
                      locale={dateLocaleMap[currentLang] || 'ru'}
                      customInput={<CustomDateInput />}
                      wrapperClassName="w-full"
                      calendarClassName="!font-sans !border-0 !rounded-2xl !shadow-2xl !p-3 !bg-white"
                    />
                  </div>

                  {/* Выбор участников */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            setAdults(adults + 1);
                            setIsHoldExpired(false);
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
                            setChildrenCount(childrenCount + 1);
                            setIsHoldExpired(false);
                          }}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Возраст участников */}
                  <div className="space-y-3 pt-2 border-t border-slate-200/60">
                    <span className="text-xs font-bold text-slate-700 block">
                      {t('modal.enter_ages', 'Укажите возраст участников (лет):')}
                    </span>
                    
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        {t('modal.adults', 'Взрослые')}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {adultAges.map((age, idx) => (
                          <div key={`adult-${idx}`} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                            <span className="text-[11px] text-slate-400">#{idx + 1}:</span>
                            <input
                              type="number"
                              min={18}
                              max={99}
                              value={age}
                              onChange={(e) => handleAdultAgeChange(idx, parseInt(e.target.value) || 18)}
                              className="w-12 text-xs font-bold text-slate-900 focus:outline-none text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {childrenCount > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          {t('modal.children', 'Дети')}:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {childAges.map((age, idx) => (
                            <div key={`child-${idx}`} className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                              <span className="text-[11px] text-slate-400">#{idx + 1}:</span>
                              <input
                                type="number"
                                min={0}
                                max={17}
                                value={age}
                                onChange={(e) => handleChildAgeChange(idx, parseInt(e.target.value) || 0)}
                                className="w-12 text-xs font-bold text-slate-900 focus:outline-none text-center"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Дополнительные опции */}
                  {tour.options && tour.options.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700 block">
                        {t('modal.extra_options', 'Дополнительные опции:')}
                      </span>
                      <div className="space-y-2">
                        {tour.options.map((opt, idx) => {
                          const optKey = getOptionKey(opt.name);
                          const optNameLocalized = getLocalizedText(opt.name, currentLang);
                          return (
                            <label
                              key={idx}
                              className="flex items-center justify-between p-3 bg-white border border-slate-200/60 rounded-xl cursor-pointer hover:border-cyan-300 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={selectedOptions.includes(optKey)}
                                  onChange={() => toggleOption(optKey)}
                                  className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-slate-300 cursor-pointer"
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

                  {/* Язык и способ связи */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4 text-cyan-600" /> 
                        {t('modal.spoken_lang', 'Разговорный язык')}
                      </label>
                      <select
                        value={preferredLang}
                        onChange={(e) => setPreferredLang(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
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

                  {/* Способ оплаты */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-500" /> 
                      {t('modal.payment_method', 'Способ оплаты')}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPaymentMethod(p.id)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                            paymentMethod === p.id
                              ? 'bg-amber-500/10 border-amber-500 text-amber-900'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Поля контактов */}
                  <div className="pt-2 border-t border-slate-200/60 space-y-3">
                    <span className="text-xs font-bold text-slate-700 block">
                      {t('modal.your_contacts', 'Ваши контакты')}
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder={t('modal.name_placeholder', 'Ваше имя *')}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>

                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="tel"
                          required
                          placeholder={t('modal.phone_placeholder', 'Телефон / WhatsApp *')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder={t('modal.hotel_placeholder', 'Название отеля в Шарм-эль-Шейхе')}
                        value={hotel}
                        onChange={(e) => setHotel(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div className="relative">
                      <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <textarea
                        rows={2}
                        placeholder={t('modal.notes_placeholder', 'Примечания (детская коляска, особые пожелания и т.д.)')}
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
                    {t('modal.total', 'Итого к оплате:')}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${totalPrice}</span>
                    <span className="text-xs text-emerald-600 font-bold ml-1.5">
                      {paymentMethod === 'cash' 
                        ? t('modal.no_prepayment', '• Без предоплаты') 
                        : t('modal.online_payment', '• Онлайн эквайринг')}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isHoldExpired}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('modal.submitting', 'Отправка заявки...')}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'cash' 
                          ? t('modal.confirm_booking', 'Подтвердить бронирование') 
                          : t('modal.pay_online', 'Перейти к оплате онлайн')}
                      </span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ЭКРАН УСПЕХА С ВАУЧЕРОМ И КАЛЕНДАРЕМ */
            <div className="p-8 text-center space-y-6 my-auto">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                  {t('modal.booking_id', 'Заявка #')}{bookingId}
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-2">
                  {t('modal.success_title', 'Вы успешно забронировали место!')}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed pt-1">
                  {t('modal.success_desc', 'Спасибо!')} <span className="font-semibold text-slate-900">{name}</span>. {t('modal.success_sub', 'Заявка передана менеджеру. Ваш билет с QR-кодом готов к предъявлению гиду.')}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200/80 space-y-2.5 max-w-md mx-auto text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.tour', 'Экскурсия:')}</span>
                  <span className="font-bold text-slate-900">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.tour_date', 'Дата проведения:')}</span>
                  <span className="font-bold text-slate-900">{formattedDateText} ({departureTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.guests', 'Состав гостей:')}</span>
                  <span className="font-bold text-slate-900">
                    {adults} {t('modal.adult_short', 'взр.')} ({adultAges.join(', ')} {t('modal.years_short', 'л')})
                    {childrenCount > 0 && `, ${childrenCount} ${t('modal.child_short', 'дет.')} (${childAges.join(', ')} ${t('modal.years_short', 'л')})`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('modal.spoken_lang', 'Язык общения:')}</span>
                  <span className="font-bold text-slate-900">{preferredLang}</span>
                </div>
                {selectedOptions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('modal.extra_options', 'Опции:')}</span>
                    <span className="font-bold text-slate-900">{selectedOptions.join(', ')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm">
                  <span className="font-bold text-slate-700">{t('modal.total', 'Итоговая сумма:')}</span>
                  <span className="font-black text-emerald-600">${totalPrice}</span>
                </div>
              </div>

              {/* БЛОК КНОПОК ДЕЙСТВИЯ (ВАУЧЕР + КАЛЕНДАРЬ) */}
              <div className="space-y-3 max-w-md mx-auto pt-2">
                <button
                  type="button"
                  onClick={() => setIsVoucherOpen(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer text-sm"
                >
                  <Ticket className="w-5 h-5" />
                  <span>{t('modal.view_voucher', 'Посмотреть электронный билет (QR)')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2.5 shadow-md active:scale-95 cursor-pointer text-xs"
                >
                  <CalendarPlus className="w-4 h-4 text-amber-400" />
                  <span>{t('modal.add_calendar', 'Сохранить в календарь (iOS / Android)')}</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t('modal.voucher_notice', 'Ваучер сохранится в вашей истории и доступен для гида')}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 💳 МОДАЛЬНОЕ ОКНО ПЛАТЕЖНОГО ШЛЮЗА */}
      {pendingOrderPayload && (
        <PaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          amount={totalPrice}
          orderId={pendingOrderPayload.generatedId}
          tourTitle={title}
          paymentMethod={paymentMethod}
          onSuccess={({ transactionId }) => {
            finalizeOrderSubmission(pendingOrderPayload, true, transactionId);
          }}
        />
      )}

      {/* 🎟 МОДАЛЬНОЕ ОКНО ЭЛЕКТРОННОГО ВАУЧЕРА С QR-КОДОМ */}
      <VoucherModal
        isOpen={isVoucherOpen}
        onClose={() => setIsVoucherOpen(false)}
        voucher={currentVoucher}
      />
    </>
  );
};