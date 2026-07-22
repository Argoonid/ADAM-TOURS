import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  X, Camera, CheckCircle2, AlertTriangle, 
  Search, User, Building2, MapPin, Send, RefreshCw 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '1261138294';

interface GuideScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideScannerModal: React.FC<GuideScannerModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [scannedOrder, setScannedOrder] = useState<any | null>(null);
  const [manualTicketId, setManualTicketId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  // Инициализация камеры при открытии
  useEffect(() => {
    if (!isOpen || scannedOrder) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        handleProcessQrData(decodedText);
        scanner.clear().catch(err => console.error(err));
      },
      (_errorMessage) => {
        // Игнорируем стандартные ошибки кадров сканера
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOpen, scannedOrder]);

  if (!isOpen) return null;

  // Обработка данных скана (JSON или ID)
  const handleProcessQrData = (rawData: string) => {
    setScanError(null);
    let extractedId = rawData.trim();

    // Если в QR-коде передавался JSON
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.ticket) extractedId = parsed.ticket;
      if (parsed.id) extractedId = parsed.id;
    } catch (e) {
      // Обычная строка / ID
    }

    // Ищем билет в локальной CRM базе
    const orders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
    const found = orders.find((o: any) => o.id.toLowerCase() === extractedId.toLowerCase());

    if (found) {
      setScannedOrder(found);
      setCheckInSuccess(found.status === 'checked_in');
    } else {
      setScanError(
        t('scanner.not_found', `Заказ с номером "${extractedId}" не найден в системе!`, { id: extractedId })
      );
    }
  };

  // Ручной поиск по ID билета
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketId) return;
    handleProcessQrData(manualTicketId);
  };

  // 🔥 ПОДТВЕРЖДЕНИЕ ПОСАДКИ В АВТОБУС (CHECK-IN)
  const handleConfirmCheckIn = async () => {
    if (!scannedOrder) return;
    setIsUpdating(true);

    try {
      // 1. Обновляем статус в localStorage CRM
      const orders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
      const updatedOrders = orders.map((o: any) => {
        if (o.id === scannedOrder.id) {
          return { ...o, status: 'checked_in', checkedInAt: new Date().toLocaleTimeString() };
        }
        return o;
      });

      localStorage.setItem('elina_orders_data', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('elina_orders_updated'));

      // 2. Отправляем уведомление в Telegram о посадке
      const tgMessage = `
🚌 <b>ТУРИСТ ПОСАЖЕН В АВТОБУС (Check-In)</b>

🎟 <b>Билет:</b> #${scannedOrder.id}
👤 <b>Турист:</b> ${scannedOrder.clientName}
📍 <b>Экскурсия:</b> ${scannedOrder.tourTitle}
🏨 <b>Отель:</b> ${scannedOrder.hotel}
👥 <b>Гости:</b> ${scannedOrder.guests}
💳 <b>Оплата:</b> ${scannedOrder.isPaid ? '🟢 ОПЛАЧЕНО' : `🟡 НАЛИЧНЫМИ ($${scannedOrder.totalPrice})`}

⏰ <i>Время посадки: ${new Date().toLocaleTimeString()}</i>
      `.trim();

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: tgMessage,
          parse_mode: 'HTML',
        }),
      });

      setCheckInSuccess(true);
      setScannedOrder((prev: any) => ({ ...prev, status: 'checked_in' }));
    } catch (err) {
      console.error('Ошибка чек-ина:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetScanner = () => {
    setScannedOrder(null);
    setScanError(null);
    setCheckInSuccess(false);
    setManualTicketId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-100 font-sans relative">
        
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Шапка */}
        <div className="bg-slate-900 text-white p-6 pb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg">
              {t('scanner.title', 'Сканер Гида • Check-In')}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {t('scanner.subtitle', 'Наведите камеру на QR-код билета или введите номер вручную')}
          </p>
        </div>

        <div className="p-6 space-y-6">
          
          {!scannedOrder ? (
            <>
              {/* ВИДОИСКАТЕЛЬ КАМЕРЫ */}
              <div className="space-y-3">
                <div 
                  id="qr-reader" 
                  className="w-full rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 [&_video]:rounded-2xl"
                />
                
                {scanError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{scanError}</span>
                  </div>
                )}
              </div>

              {/* РУЧНОЙ ВВОД HОМЕРА БИЛЕТА */}
              <form onSubmit={handleManualSearch} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  {t('scanner.manual_label', 'Или введите номер билета вручную:')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder={t('scanner.manual_placeholder', 'Например: EL-8492')}
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {t('scanner.search_btn', 'Найти')}
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* КАРТОЧКА НАЙДЕННОГО БИЛЕТА ДЛЯ ПРОВЕРКИ */
            <div className="space-y-5">
              
              {/* Статус оплаты */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    {t('scanner.ticket_no', 'Билет #')}{scannedOrder.id}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base">{scannedOrder.tourTitle}</h4>
                </div>
                {scannedOrder.isPaid ? (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                    {t('scanner.paid', 'ОПЛАЧЕНО')}
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                    💵 {t('scanner.collect_cash', 'ВЗЯТЬ НАЛИЧНЫМИ:')} ${scannedOrder.totalPrice}
                  </span>
                )}
              </div>

              {/* Детали клиента */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-400">{t('scanner.tourist', 'Турист:')}</span>
                  <span className="font-extrabold text-slate-900">{scannedOrder.clientName} ({scannedOrder.phone})</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-400">{t('scanner.hotel', 'Отель:')}</span>
                  <span className="font-bold text-slate-900">{scannedOrder.hotel}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-400">{t('scanner.guests', 'Состав:')}</span>
                  <span className="font-bold text-slate-900">{scannedOrder.guests}</span>
                </div>
              </div>

              {/* КНОПКА ДЕЙСТВИЯ */}
              {checkInSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-black text-emerald-900 text-sm">
                    {t('scanner.checkin_confirmed', 'ПОСАДКА ПОДТВЕРЖДЕНА!')}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    {t('scanner.checkin_desc', 'Статус обновлен в CRM и отправлен в Telegram.')}
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isUpdating}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isUpdating 
                      ? t('scanner.updating', 'Обновление...') 
                      : t('scanner.confirm_checkin', 'Подтвердить посадку (Check-In)')}
                  </span>
                </button>
              )}

              {/* Сканировать еще один */}
              <button
                onClick={handleResetScanner}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('scanner.scan_next', 'Сканировать следующий билет')}</span>
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};