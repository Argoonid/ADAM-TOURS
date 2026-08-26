export type OrderStatus = 
  | 'unconfirmed'           // Ожидает паспорта (начальный)
  | 'in_progress'           // В работе (менеджер связался)
  | 'confirmed'             // Ожидает посадки (паспорт проверен, QR активен)
  | 'checked_in'            // Турист посажен в автобус
  | 'completed'             // Экскурсия успешно завершена
  | 'unconfirmed_failed'    // Не подтверждена (турист не дал паспорт / фейк)
  | 'cancelled_by_client'   // Отменена клиентом
  | 'no_show'               // Клиент не прибыл к трансферу
  | 'new';

export interface Order {
  id: string;
  tourId?: string;
  clientName: string;
  phone: string;
  email?: string;
  hotel: string;
  tourTitle: string;
  date: string;
  departureTime?: string;
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

export const REASON_OPTIONS: { label: string; status: OrderStatus; reason: string; icon: string; color: string }[] = [
  { label: 'Игнорирует сообщения', status: 'unconfirmed_failed', reason: 'Игнорирует сообщения', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Фейковый номер телефона', status: 'unconfirmed_failed', reason: 'Фейковый номер', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Отказ присылать паспорт', status: 'unconfirmed_failed', reason: 'Отказался давать паспорт', icon: '❌', color: 'text-rose-400 hover:bg-rose-500/10' },
  { label: 'Клиент передумал / заболел', status: 'cancelled_by_client', reason: 'Передумал / заболел', icon: '🚫', color: 'text-amber-400 hover:bg-amber-500/10' },
  { label: 'Другие планы у туриста', status: 'cancelled_by_client', reason: 'Изменились планы', icon: '🚫', color: 'text-amber-400 hover:bg-amber-500/10' },
  { label: 'Клиент не прибыл (No-Show)', status: 'no_show', reason: 'Не вышел к трансферу (No-Show)', icon: '⚠️', color: 'text-slate-300 hover:bg-white/10' },
];

export const getSafeDate = (val?: string): Date => {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
};