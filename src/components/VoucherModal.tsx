import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, Printer, Calendar, Clock, 
  Users, CheckCircle2, ShieldCheck, Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface VoucherData {
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
  transactionId?: string | null;
}

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherData | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, voucher }) => {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !voucher) return null;

  // Данные, зашифрованные в QR-коде (гид при сканировании увидит эти данные)
  const qrPayload = JSON.stringify({
    ticket: voucher.id,
    name: voucher.clientName,
    tour: voucher.tourTitle,
    date: voucher.date,
    hotel: voucher.hotel,
    guests: voucher.guests,
    status: voucher.isPaid ? 'PAID' : 'CASH',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans print:p-0 print:bg-white">
      
      {/* Кнопка закрытия (скрыта при печати) */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-50 w-11 h-11 bg-white hover:bg-slate-100 text-slate-900 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer print:hidden"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-xl my-auto space-y-4">
        
        {/* Панель действий на смартфоне/ПК */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl print:hidden">
          <div>
            <h4 className="font-extrabold text-sm">
              {t('voucher.title', 'Электронный ваучер')}
            </h4>
            <p className="text-[11px] text-slate-400">
              {t('voucher.subtitle', 'Сохраните файл или предъявите гиду с экрана')}
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>{t('voucher.print_btn', 'Скачать / Печать')}</span>
          </button>
        </div>

        {/* 🎟 ТЕЛО БИЛЕТА (ПОСАДОЧНЫЙ ТАЛОН) */}
        <div 
          ref={printRef}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-slate-900 relative print:shadow-none print:border-2 print:border-black print:rounded-none"
        >
          {/* Верхний брендированный баннер */}
          <div className="bg-slate-950 text-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-md">
                  E
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight uppercase tracking-wider text-amber-400">
                    Elina Tours Egypt
                  </h3>
                  <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
                    {t('voucher.official_voucher', 'Official Excursion Voucher')}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {t('voucher.ticket_no', 'Номер билета')}
                </span>
                <span className="font-mono text-base font-black text-white">#{voucher.id}</span>
              </div>
            </div>
          </div>

          {/* Информация о поездке */}
          <div className="p-6 space-y-5">
            
            {/* Название экскурсии */}
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t('voucher.excursion_label', 'Экскурсия')}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{voucher.tourTitle}</h2>
            </div>

            {/* Сетка ключевой информации */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" /> {t('voucher.date_label', 'Дата выезда')}
                </span>
                <span className="font-extrabold text-slate-900 text-sm block">{voucher.date}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> {t('voucher.time_label', 'Время трансфера')}
                </span>
                <span className="font-extrabold text-slate-900 text-sm block">{voucher.departureTime}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" /> {t('voucher.hotel_label', 'Отель / Сбор')}
                </span>
                <span className="font-bold text-slate-900 block truncate">{voucher.hotel}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" /> {t('voucher.guests_label', 'Участники')}
                </span>
                <span className="font-bold text-slate-900 block">{voucher.guests}</span>
              </div>
            </div>

            {/* Данные туриста */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{t('voucher.client_name', 'Главный турист:')}</span>
                <span className="font-extrabold text-slate-900">{voucher.clientName}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">{t('voucher.phone', 'Телефон / WA:')}</span>
                <span className="font-mono font-bold text-slate-900">{voucher.phone}</span>
              </div>
            </div>

            {/* Перфорированная линия разделения билета */}
            <div className="relative my-6 -mx-6 flex items-center justify-between">
              <div className="w-6 h-6 bg-slate-950/80 rounded-full -ml-3 print:hidden" />
              <div className="border-b-2 border-dashed border-slate-200 w-full" />
              <div className="w-6 h-6 bg-slate-950/80 rounded-full -mr-3 print:hidden" />
            </div>

            {/* БЛОК С QR-КОДОМ И ОПЛАТОЙ */}
            <div className="flex items-center justify-between gap-4">
              
              <div className="space-y-2 flex-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    {t('voucher.total_price', 'К оплате:')}
                  </span>
                  <span className="text-2xl font-black text-slate-900">${voucher.totalPrice}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    {t('voucher.payment_status', 'Статус оплаты:')}
                  </span>
                  {voucher.isPaid ? (
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                      {t('voucher.paid', 'ОПЛАЧЕНО')}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                      {t('voucher.cash_to_guide', '🟡 Наличными гиду')}
                    </span>
                  )}
                </div>
              </div>

              {/* QR CODE ДЛЯ ГИДА */}
              <div className="bg-white p-2.5 rounded-2xl border-2 border-slate-900 shadow-md shrink-0 text-center">
                <QRCodeSVG value={qrPayload} size={110} level="M" />
                <span className="text-[9px] font-mono font-bold text-slate-400 block mt-1">
                  {t('voucher.scan_for_guide', 'СКАН ДЛЯ ГИДА')}
                </span>
              </div>

            </div>

            {/* Важное примечание внизу */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 font-medium flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {t(
                  'voucher.security_note',
                  'Пожалуйста, будьте у главного въезда в отель (Security Gate) за 10 минут до указанного времени.'
                )}
              </span>
            </div>

          </div>

          {/* Подвал билета */}
          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
            {t('voucher.footer', 'Elina Tours Egypt • Sharm El Sheikh • Поддержка 24/7 в WhatsApp')}
          </div>

        </div>
      </div>

    </div>
  );
};