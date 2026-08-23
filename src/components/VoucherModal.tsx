import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, Printer, Calendar, Clock, 
  Users, CheckCircle2, ShieldCheck, Building2, AlertTriangle, PhoneCall, Ban
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface VoucherData {
  id: string;
  clientName: string;
  phone: string;
  hotel: string;
  tourTitle: string;
  date: string;
  departureTime?: string;
  guests: string;
  totalPrice: number;
  paymentMethod: string;
  isPaid?: boolean;
  status?: 
    | 'unconfirmed' 
    | 'in_progress' 
    | 'confirmed' 
    | 'checked_in' 
    | 'completed' 
    | 'unconfirmed_failed' 
    | 'cancelled_by_client' 
    | 'no_show' 
    | 'cancelled' 
    | 'new' 
    | string;
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

  const qrPayload = JSON.stringify({
    ticket: voucher.id,
    name: voucher.clientName,
    tour: voucher.tourTitle,
    date: voucher.date,
    time: voucher.departureTime || '08:00',
    hotel: voucher.hotel,
    guests: voucher.guests,
    price: voucher.totalPrice,
    status: voucher.status || 'unconfirmed'
  });

  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = voucher.status === 'confirmed' || voucher.status === 'checked_in' || voucher.status === 'completed';
  const isCancelled = voucher.status === 'unconfirmed_failed' || voucher.status === 'cancelled_by_client' || voucher.status === 'no_show' || voucher.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans print:p-0 print:bg-white">
      {/* Кнопка закрытия */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-5 right-5 z-50 w-11 h-11 bg-white hover:bg-slate-100 text-slate-900 rounded-full flex items-center justify-center shadow-2xl transition-all cursor-pointer print:hidden"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-xl my-auto space-y-4">
        {/* Верхняя плашка управления */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl print:hidden">
          <div>
            <h4 className="font-extrabold text-sm">
              {t('voucher.title', 'Электронный ваучер')}
            </h4>
            <p className="text-[11px] text-slate-400">
              Предъявите гиду с экрана смартфона при посадке
            </p>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg"
          >
            <Printer className="w-4 h-4" />
            <span>{t('voucher.print_btn', 'Печать / Сохранить')}</span>
          </button>
        </div>

        {/* Тело ваучера */}
        <div 
          ref={printRef}
          className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 text-slate-900 relative print:shadow-none print:border-2 print:border-black print:rounded-none"
        >
          {/* Баннер шапки */}
          <div className="bg-[#07111e] text-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f5d77f] to-[#d4af37] text-[#07111e] font-black flex items-center justify-center text-xl shadow-md">
                  S
                </div>
                <div>
                  <h3 className="font-black text-lg leading-tight uppercase tracking-wider text-[#f5d77f]">
                    SHARM & ADAM TOURS
                  </h3>
                  <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
                    Official Excursion Voucher
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Номер билета
                </span>
                <span className="font-mono text-base font-black text-[#f5d77f]">#{voucher.id}</span>
              </div>
            </div>
          </div>

          {/* Статус верификации */}
          <div className={`p-3.5 px-6 border-b text-xs font-bold flex items-center justify-between ${
            isConfirmed
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : isCancelled
              ? 'bg-rose-50 text-rose-900 border-rose-200'
              : 'bg-amber-50 text-amber-900 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Личность подтверждена • QR-билет активен</span>
                </>
              ) : isCancelled ? (
                <>
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Бронь аннулирована</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span>Ожидает подтверждения паспорта менеджером</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-white/80 border">
              TTL: 24h
            </span>
          </div>

          {/* Информация о поездке */}
          <div className="p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Экскурсия
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">{voucher.tourTitle}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#d4af37]" /> Дата выезда
                </span>
                <span className="font-extrabold text-slate-900 text-sm block">{voucher.date}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#d4af37]" /> Время трансфера
                </span>
                <span className="font-extrabold text-slate-900 text-sm block">{voucher.departureTime || '08:00'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#d4af37]" /> Отель / Сбор
                </span>
                <span className="font-bold text-slate-900 block truncate">{voucher.hotel || 'Не указан'}</span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#d4af37]" /> Гости
                </span>
                <span className="font-bold text-slate-900 block">{voucher.guests}</span>
              </div>
            </div>

            {/* Контакты клиента */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Главный турист:</span>
                <span className="font-extrabold text-slate-900">{voucher.clientName}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">Телефон / Связь:</span>
                <span className="font-mono font-bold text-slate-900">{voucher.phone}</span>
              </div>
            </div>

            {/* Перфорация */}
            <div className="relative my-6 -mx-6 flex items-center justify-between">
              <div className="w-6 h-6 bg-slate-950/80 rounded-full -ml-3 print:hidden" />
              <div className="border-b-2 border-dashed border-slate-200 w-full" />
              <div className="w-6 h-6 bg-slate-950/80 rounded-full -mr-3 print:hidden" />
            </div>

            {/* QR-код и расчёт */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">
                    К оплате гиду при посадке:
                  </span>
                  <span className="text-2xl font-black text-slate-900">${voucher.totalPrice}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                    Способ оплаты:
                  </span>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-lg inline-block">
                    🟡 {voucher.paymentMethod || 'Наличными гиду в автобусе'}
                  </span>
                </div>
              </div>

              {/* QR-код */}
              <div className="bg-white p-2.5 rounded-2xl border-2 border-[#07111e] shadow-md shrink-0 text-center">
                <QRCodeSVG value={qrPayload} size={110} level="M" />
                <span className="text-[9px] font-mono font-bold text-slate-500 block mt-1">
                  СКАН ДЛЯ ГИДА
                </span>
              </div>
            </div>

            {/* Информационная плашка */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-medium flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Отправьте фото паспорта менеджеру в WhatsApp. Будьте у главного въезда в отель (Security Gate) за 10 минут до трансфера.
              </span>
            </div>
          </div>

          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 text-center text-[10px] text-slate-400 font-semibold">
            SHARM & ADAM TOURS • Sharm El Sheikh • Поддержка в WhatsApp 24/7
          </div>
        </div>
      </div>
    </div>
  );
};