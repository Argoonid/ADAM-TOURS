import React, { useState, useEffect } from 'react';
import { Timer, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HoldTimerProps {
  initialMinutes?: number;
  onExpire?: () => void;
  seatsHeld: number;
}

export const HoldTimer: React.FC<HoldTimerProps> = ({ 
  initialMinutes = 10, 
  onExpire,
  seatsHeld 
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    // Сбрасываем таймер обратно на 10 минут, если меняется количество удерживаемых мест
    setTimeLeft(initialMinutes * 60);
  }, [seatsHeld, initialMinutes]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 120; // Меньше 2 минут

  const formatTime = (val: number) => String(val).padStart(2, '0');

  if (timeLeft <= 0) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl flex items-center gap-3 text-xs font-semibold animate-pulse">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold block">
            {t('holdTimer.expired_title', 'Время удержания мест истекло')}
          </span>
          <span className="text-slate-500 text-[11px]">
            {t(
              'holdTimer.expired_desc', 
              'Места возвращены в общую систему. Пожалуйста, обновите страницу или выберите дату заново.'
            )}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-bold ${
      isLowTime 
        ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-sm' 
        : 'bg-amber-50/90 border-amber-200/90 text-amber-950'
    }`}>
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLowTime ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLowTime ? 'bg-rose-600' : 'bg-amber-500'}`}></span>
        </span>
        <span>
          {t('holdTimer.freeze_label', 'Временная заморозка:')}{' '}
          <span className="underline decoration-amber-400 decoration-2">
            {t('holdTimer.seats_count', '{{count}} чел.', { count: seatsHeld })}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-xs border border-amber-200/60 self-end sm:self-auto">
        <Timer className={`w-4 h-4 ${isLowTime ? 'text-rose-600 animate-spin' : 'text-amber-600'}`} />
        <span className="font-mono text-xs sm:text-sm tracking-tight">
          {t('holdTimer.timer_label', 'Бронь держится:')}{' '}
          <strong className="text-slate-900">{formatTime(minutes)}:{formatTime(seconds)}</strong>
        </span>
      </div>
    </div>
  );
};