import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  X, Camera, CheckCircle2, AlertTriangle, 
  Search, User, Building2, MapPin, Send, RefreshCw, 
  ShieldAlert, Flashlight, Wifi, WifiOff, Check
} from 'lucide-react';
import { supabase } from '../services/supabase';

const TELEGRAM_BOT_TOKEN = '8553491781:AAEfADkl8ssgDZcqb7tW2T9ww7FCq7nNLVk';
const TELEGRAM_CHAT_ID = '-1004414245980';

interface GuideScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Звуковой сигнал при сканировании (Web Audio API)
const playBeep = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Без звука, если контекст заблокирован
  }
};

export const GuideScannerModal: React.FC<GuideScannerModalProps> = ({ isOpen, onClose }) => {
  const [scannedOrder, setScannedOrder] = useState<any | null>(null);
  const [manualTicketId, setManualTicketId] = useState('');
  const [scanError, setScanError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  
  // Состояния камеры и сети
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Отслеживание онлайна и синхронизация
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updatePendingCount = () => {
    const queue = JSON.parse(localStorage.getItem('elina_checkin_queue') || '[]');
    setPendingSyncCount(queue.length);
  };

  // Фоновая синхронизация накопленных офлайн-чекинов
  const processOfflineQueue = async () => {
    const queue: any[] = JSON.parse(localStorage.getItem('elina_checkin_queue') || '[]');
    if (queue.length === 0) return;

    const remaining: any[] = [];

    for (const item of queue) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'checked_in' })
          .eq('id', item.id);

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `🚌 <b>ОФЛАЙН-ЧЕКИН СИНХРОНИЗИРОВАН</b>\n\n🎟 #${item.id} • ${item.clientName}\n📍 ${item.tourTitle}\n🏨 ${item.hotel}\n💵 $${item.totalPrice}`,
            parse_mode: 'HTML',
          }),
        });
      } catch (err) {
        remaining.push(item);
      }
    }

    localStorage.setItem('elina_checkin_queue', JSON.stringify(remaining));
    updatePendingCount();
  };

  // Инициализация камеры
  useEffect(() => {
    if (!isOpen || scannedOrder) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, scannedOrder]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const scanner = new Html5Qrcode('custom-qr-reader');
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          playBeep();
          if ('vibrate' in navigator) navigator.vibrate([80, 40, 80]);
          handleProcessQrData(decodedText);
          stopCamera();
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Ошибка запуска камеры:', err);
      setIsCameraActive(false);
      setCameraError('Камера недоступна. Разрешите доступ к камере или введите номер билета вручную.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Игнорируем ошибку остановки
      }
    }
    setIsCameraActive(false);
  };

  const toggleTorch = async () => {
    try {
      if (html5QrCodeRef.current && isCameraActive) {
        await html5QrCodeRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn } as any]
        });
        setTorchOn(!torchOn);
      }
    } catch (e) {
      console.warn('Фонарик не поддерживается данным устройством');
    }
  };

  if (!isOpen) return null;

  // Обработка данных билета
  const handleProcessQrData = async (rawData: string) => {
    setScanError(null);
    let extractedId = rawData.trim();

    try {
      const parsed = JSON.parse(rawData);
      if (parsed.ticket) extractedId = parsed.ticket;
      if (parsed.id) extractedId = parsed.id;
    } catch {
      // Использован plain text ID
    }

    // 1. Быстрый поиск в локальном кэше (0ms)
    const localOrders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
    const foundLocal = localOrders.find((o: any) => o.id.toLowerCase() === extractedId.toLowerCase());

    if (foundLocal) {
      setScannedOrder(foundLocal);
      setCheckInSuccess(foundLocal.status === 'checked_in');
      return;
    }

    // 2. Если в локалке нет и есть сеть — ищем в Supabase
    if (navigator.onLine) {
      try {
        const { data } = await supabase.from('orders').select('*').eq('id', extractedId).single();
        if (data) {
          const formatted = {
            id: data.id,
            clientName: data.client_name,
            phone: data.phone,
            hotel: data.hotel,
            tourTitle: data.tour_title,
            date: data.tour_date,
            guests: data.guests,
            totalPrice: data.total_price,
            status: data.status,
          };
          setScannedOrder(formatted);
          setCheckInSuccess(data.status === 'checked_in');
          return;
        }
      } catch (err) {
        console.warn('Supabase lookup fallback:', err);
      }
    }

    setScanError(`Билет "${extractedId}" не найден в базе данных!`);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketId) return;
    handleProcessQrData(manualTicketId);
  };

  // Подтверждение посадки
  const handleConfirmCheckIn = async () => {
    if (!scannedOrder) return;
    setIsUpdating(true);

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Мгновенное локальное сохранение (независимо от сети)
    const orders = JSON.parse(localStorage.getItem('elina_orders_data') || '[]');
    const updatedOrders = orders.map((o: any) => {
      if (o.id === scannedOrder.id) {
        return { ...o, status: 'checked_in', checkedInAt: checkInTime };
      }
      return o;
    });

    localStorage.setItem('elina_orders_data', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('elina_orders_updated'));
    window.dispatchEvent(new CustomEvent('elina_tours_updated'));

    setCheckInSuccess(true);
    setScannedOrder((prev: any) => ({ ...prev, status: 'checked_in' }));

    // 2. Сетевая синхронизация или постановка в офлайн-очередь
    if (navigator.onLine) {
      try {
        await supabase
          .from('orders')
          .update({ status: 'checked_in' })
          .eq('id', scannedOrder.id);

        const tgMessage = `
🚌 <b>ТУРИСТ ПОСАЖЕН В АВТОБУС (Check-In)</b>

🎟 <b>Билет:</b> #${scannedOrder.id}
👤 <b>Турист:</b> ${scannedOrder.clientName}
📍 <b>Экскурсия:</b> ${scannedOrder.tourTitle}
🏨 <b>Отель:</b> ${scannedOrder.hotel}
👥 <b>Гости:</b> ${scannedOrder.guests}
💵 <b>Оплата гиду:</b> $${scannedOrder.totalPrice}

⏰ <i>Отметка: ${checkInTime}</i>
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
      } catch (err) {
        console.warn('Сетевой сбой при чекине, добавляем в очередь:', err);
        queueCheckIn(scannedOrder);
      }
    } else {
      queueCheckIn(scannedOrder);
    }

    setIsUpdating(false);
  };

  const queueCheckIn = (order: any) => {
    const queue = JSON.parse(localStorage.getItem('elina_checkin_queue') || '[]');
    if (!queue.some((q: any) => q.id === order.id)) {
      queue.push(order);
      localStorage.setItem('elina_checkin_queue', JSON.stringify(queue));
      updatePendingCount();
    }
  };

  const handleResetScanner = () => {
    setScannedOrder(null);
    setScanError(null);
    setCheckInSuccess(false);
    setManualTicketId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-[#0d223a] w-full max-w-md rounded-3xl border-2 border-[#d4af37]/30 shadow-2xl overflow-hidden my-auto relative text-white">
        
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 bg-[#07111e] hover:bg-white/10 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Шапка модалки */}
        <div className="p-5 border-b border-white/10 bg-[#07111e]">
          <div className="flex items-center justify-between pr-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#f5d77f]">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">
                  Сканер Гида • Check-In
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {isOnline ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <Wifi className="w-3 h-3" /> Онлайн
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                      <WifiOff className="w-3 h-3" /> Офлайн-режим
                    </span>
                  )}
                  {pendingSyncCount > 0 && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      В очереди: {pendingSyncCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="p-5 space-y-5">
          {!scannedOrder ? (
            <>
              {/* Зона видоискателя камеры */}
              <div className="relative rounded-2xl overflow-hidden bg-[#07111e] border border-white/15 aspect-square flex flex-col items-center justify-center">
                
                <div id="custom-qr-reader" className="w-full h-full [&_video]:object-cover" />

                {/* Кастомный оверлей сканирования */}
                {isCameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* Затемненный фон вокруг центрального окна */}
                    <div className="w-56 h-56 relative rounded-2xl border-2 border-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center justify-center">
                      {/* Уголки */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#f5d77f]" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#f5d77f]" />
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#f5d77f]" />
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#f5d77f]" />

                      {/* Анимированный лазер сканера */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#f5d77f] to-transparent animate-pulse shadow-[0_0_8px_#d4af37]" />
                    </div>

                    <span className="absolute bottom-4 font-mono text-[11px] text-[#f5d77f] bg-[#07111e]/80 px-3 py-1 rounded-full border border-[#d4af37]/30 backdrop-blur-md">
                      Наведите на QR-код билета
                    </span>
                  </div>
                )}

                {/* Ошибка камеры */}
                {cameraError && (
                  <div className="p-6 text-center space-y-3">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300 leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="bg-[#d4af37] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer active:scale-95"
                    >
                      Повторить запуск
                    </button>
                  </div>
                )}

                {/* Кнопка фонарика */}
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={toggleTorch}
                    className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                      torchOn ? 'bg-[#d4af37] text-slate-950 border-[#d4af37]' : 'bg-[#07111e]/70 text-white border-white/20'
                    }`}
                    title="Фонарик"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Сообщение об ошибке поиска */}
              {scanError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{scanError}</span>
                </div>
              )}

              {/* Ручной ввод номера билета */}
              <form onSubmit={handleManualSearch} className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-[#f5d77f] block">
                  Или найдите ваучер по номеру:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Например: SA-8492"
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      className="w-full bg-[#07111e] border border-white/15 focus:border-[#d4af37] rounded-2xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-white outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#07111e] hover:bg-white/10 text-[#f5d77f] border border-white/15 font-bold px-4 rounded-2xl text-xs cursor-pointer transition-colors active:scale-95"
                  >
                    Найти
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* КАРТОЧКА НАЙДЕННОГО ТУРИСТА */
            <div className="space-y-4">
              
              {/* Предупреждение о паспорте */}
              {(scannedOrder.status === 'unconfirmed' || scannedOrder.status === 'new') && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <b className="text-amber-200">Паспорт не был проверен менеджером</b>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      Сверьте оригинал паспорта туриста перед посадкой.
                    </p>
                  </div>
                </div>
              )}

              {/* Сводка по туру и сумме */}
              <div className="p-4 rounded-2xl bg-[#07111e] border border-white/10 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#f5d77f] block">
                    Билет #{scannedOrder.id}
                  </span>
                  <h4 className="font-black text-white text-sm mt-0.5">{scannedOrder.tourTitle}</h4>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-xs px-3 py-1.5 rounded-xl text-right shrink-0">
                  ${scannedOrder.totalPrice}
                  <span className="text-[9px] block text-emerald-400/80 font-sans font-normal">к оплате</span>
                </div>
              </div>

              {/* Детали туриста */}
              <div className="bg-[#07111e] p-4 rounded-2xl border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Турист:</span>
                  <span className="font-bold text-white truncate">{scannedOrder.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Отель:</span>
                  <span className="font-bold text-white truncate">{scannedOrder.hotel || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
                  <span className="text-slate-400">Состав:</span>
                  <span className="font-bold text-white">{scannedOrder.guests}</span>
                </div>
              </div>

              {/* Кнопка или подтверждение посадки */}
              {checkInSuccess ? (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-center space-y-1.5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 mx-auto" />
                  <p className="font-black text-emerald-300 text-sm">
                    ТУРИСТ ПОСАЖЕН В АВТОБУС
                  </p>
                  <p className="text-[10px] text-emerald-400/80">
                    Статус зафиксирован локально и отправлен диспетчерам.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmCheckIn}
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-[#e5c158] via-[#d4af37] to-[#aa7c11] text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isUpdating ? 'Сохранение...' : 'Подтвердить посадку (Check-In)'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={handleResetScanner}
                className="w-full bg-[#07111e] hover:bg-white/10 text-slate-300 font-bold py-3 rounded-2xl transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/10"
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