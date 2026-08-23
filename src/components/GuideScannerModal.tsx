import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  X, Camera, CheckCircle2, AlertTriangle, 
  Search, User, Building2, MapPin, Send, RefreshCw, ShieldAlert 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../services/supabase';

const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '-1004414245980';

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

  useEffect(() => {
    if (!isOpen || scannedOrder) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      (decodedText) => {
        handleProcessQrData(decodedText);
        scanner.clear().catch(err => console.error(err));
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [isOpen, scannedOrder]);

  if (!isOpen) return null;

  const handleProcessQrData = async (rawData: string) => {
    setScanError(null);
    let extractedId = rawData.trim();

    try {
      const parsed = JSON.parse(rawData);
      if (parsed.ticket) extractedId = parsed.ticket;
      if (parsed.id) extractedId = parsed.id;
    } catch {
      // Использован raw ID
    }

    // 1. Поиск в Supabase
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', extractedId).single();
      if (data) {
        setScannedOrder({
          id: data.id,
          clientName: data.client_name,
          phone: data.phone,
          hotel: data.hotel,
          tourTitle: data.tour_title,
          date: data.tour_date,
          guests: data.guests,
          totalPrice: data.total_price,
          status: data.status,
        });
        setCheckInSuccess(data.status === 'checked_in');
        return;
      }
    } catch (err) {
      console.warn('Supabase scanner lookup fallback:', err);
    }

    // 2. Fallback в localStorage
    const orders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
    const found = orders.find((o: any) => o.id.toLowerCase() === extractedId.toLowerCase());

    if (found) {
      setScannedOrder(found);
      setCheckInSuccess(found.status === 'checked_in');
    } else {
      setScanError(`Заказ с номером "${extractedId}" не найден в системе!`);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketId) return;
    handleProcessQrData(manualTicketId);
  };

  // Подтверждение посадки (Check-In)
  const handleConfirmCheckIn = async () => {
    if (!scannedOrder) return;
    setIsUpdating(true);

    try {
      // 1. Обновление в Supabase
      await supabase
        .from('orders')
        .update({ status: 'checked_in' })
        .eq('id', scannedOrder.id);

      // 2. Обновление в LocalStorage
      const orders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
      const updatedOrders = orders.map((o: any) => {
        if (o.id === scannedOrder.id) {
          return { ...o, status: 'checked_in', checkedInAt: new Date().toLocaleTimeString() };
        }
        return o;
      });

      localStorage.setItem('elina_orders_data', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('elina_orders_updated'));

      // 3. Уведомление в Telegram
      const tgMessage = `
🚌 <b>ТУРИСТ ПОСАЖЕН В АВТОБУС (Check-In)</b>

🎟 <b>Билет:</b> #${scannedOrder.id}
👤 <b>Турист:</b> ${scannedOrder.clientName}
📍 <b>Экскурсия:</b> ${scannedOrder.tourTitle}
🏨 <b>Отель:</b> ${scannedOrder.hotel}
👥 <b>Гости:</b> ${scannedOrder.guests}
💵 <b>Оплата:</b> 🟡 НАЛИЧНЫМИ ($${scannedOrder.totalPrice})

⏰ <i>Время отметки: ${new Date().toLocaleTimeString()}</i>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-full flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-[#07111e] text-white p-6 pb-5">
          <div className="flex items-center gap-2.5 mb-1">
            <Camera className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-extrabold text-lg text-white">
              Сканер Гида • Check-In
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Наведите камеру на QR-код ваучера туриста
          </p>
        </div>

        <div className="p-6 space-y-6">
          {!scannedOrder ? (
            <>
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

              <form onSubmit={handleManualSearch} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">
                  Или введите номер ваучера вручную:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Например: SA-8492"
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#07111e] hover:bg-slate-800 text-white font-bold px-4 rounded-xl text-xs cursor-pointer"
                  >
                    Найти
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-5">
              {/* Предупреждение, если паспорт еще не подтвержден */}
              {scannedOrder.status === 'unconfirmed' || scannedOrder.status === 'new' ? (
                <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <b>Внимание: Паспорт еще не был проверен менеджером.</b>
                    <p className="mt-0.5 text-[11px] text-amber-800">
                      Убедитесь, что у туриста есть фото загранпаспорта для передачи диспетчеру.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold block">
                    Билет #{scannedOrder.id}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-base">{scannedOrder.tourTitle}</h4>
                </div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                  💵 Принять: ${scannedOrder.totalPrice}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Турист:</span>
                  <span className="font-extrabold text-slate-900">{scannedOrder.clientName} ({scannedOrder.phone})</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Отель:</span>
                  <span className="font-bold text-slate-900">{scannedOrder.hotel}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Состав:</span>
                  <span className="font-bold text-slate-900">{scannedOrder.guests}</span>
                </div>
              </div>

              {checkInSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-black text-emerald-900 text-sm">
                    ПОСАДКА ПОДТВЕРЖДЕНА (CHECK-IN)
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Статус обновлен в базе Supabase и отправлен диспетчерам.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleConfirmCheckIn}
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isUpdating ? 'Обновление базы...' : 'Подтвердить посадку (Check-In)'}
                  </span>
                </button>
              )}

              <button
                onClick={handleResetScanner}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Сканировать следующий билет</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};