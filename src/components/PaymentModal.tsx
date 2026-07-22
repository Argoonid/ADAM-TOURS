import React, { useState } from 'react';
import { 
  X, CreditCard, ShieldCheck, Lock, CheckCircle2, 
  Loader2, ArrowRight, Building2, Copy, Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderId: string;
  tourTitle: string;
  paymentMethod: string; // 'card' | 'transfer'
  onSuccess: (paymentInfo: { transactionId: string; methodLabel: string }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderId,
  tourTitle,
  paymentMethod,
  onSuccess,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Поля карты
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Состояния эквайринга: 'form' | '3ds' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | '3ds' | 'processing' | 'success'>('form');
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Форматирование номера карты
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Форматирование срока действия
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.slice(0, 2)}/${val.slice(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Старт процесса оплаты
  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'card') {
      setStep('3ds');
    } else {
      // Для перевода сразу на процессинг
      setStep('processing');
      setTimeout(() => {
        setStep('success');
      }, 2500);
    }
  };

  // Подтверждение SMS (3D-Secure)
  const handleVerify3DS = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode === '1111' || smsCode.length === 4) {
      setSmsError(false);
      setStep('processing');
      setTimeout(() => {
        setStep('success');
      }, 2500);
    } else {
      setSmsError(true);
    }
  };

  const handleFinish = () => {
    const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const label = paymentMethod === 'card' 
      ? t('payment.method_card', 'Картой (Онлайн)') 
      : t('payment.method_transfer', 'Переводом (СБП/InstaPay)');
    onSuccess({ transactionId: txId, methodLabel: label });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative my-auto animate-fade-in">
        
        {/* Кнопка закрытия */}
        {step !== 'processing' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ШАПКА ШЛЮЗА */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-base">
                E
              </div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-amber-400">
                Elina Pay <span className="text-xs text-slate-400">{t('payment.hub_subtitle', 'Egypt Hub')}</span>
              </span>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {t('payment.ssl', 'SSL 256-bit')}
            </span>
          </div>

          <div className="flex justify-between items-end pt-2">
            <div>
              <span className="text-slate-400 text-xs block font-medium">
                {t('payment.amount_label', 'Сумма к оплате:')}
              </span>
              <span className="text-3xl font-black text-white">${amount}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[11px] block">
                {t('payment.order_label', 'Заказ #')}{orderId}
              </span>
              <span className="text-xs font-bold text-amber-300 max-w-[180px] truncate block">{tourTitle}</span>
            </div>
          </div>
        </div>

        {/* 1. ФОРМА ОПЛАТЫ КАРТОЙ / ПЕРЕВОДОМ */}
        {step === 'form' && (
          <div className="p-6 space-y-6">
            {paymentMethod === 'card' ? (
              <form onSubmit={handleStartPayment} className="space-y-4">
                
                {/* Поддерживаемые системы */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-[11px] font-bold text-slate-600">
                  <span>{t('payment.accept_label', 'Принимаем:')}</span>
                  <div className="flex gap-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black">МИР</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-black">VISA</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">MC</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black">Т-Банк</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('payment.card_number', 'Номер карты')}
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t('payment.expiry', 'Срок действия')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      {t('payment.cvc', 'CVC / CVV')}
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="•••"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    {t('payment.cardholder', 'Имя держателя карты (ENG)')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CARDHOLDER NAME"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95 mt-2"
                >
                  <span>{t('payment.pay_btn', 'Оплатить ${{amount}}', { amount })}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Оплата Переводом (СБП / InstaPay) */
              <div className="space-y-5">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span>{t('payment.transfer_title', 'Быстрый перевод без комиссии (СБП / InstaPay)')}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {t('payment.transfer_desc', 'Перевод поступает напрямую гиду на египетский или рублевый счет.')}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t('payment.card_sbp_number', 'Номер карты / СБП (РФ):')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">2202 2024 8812 9014</span>
                      <button 
                        type="button" 
                        onClick={() => handleCopy('2202202488129014')}
                        className="text-amber-600 hover:text-amber-700 cursor-pointer p-1"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-400">{t('payment.bank_label', 'Банк:')}</span>
                    <span className="font-bold text-slate-900">Т-Банк / Сбербанк</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-400">{t('payment.recipient_label', 'Получатель:')}</span>
                    <span className="font-bold text-slate-900">{t('payment.recipient_name', 'Elina T. (Официальный гид)')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer text-sm active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('payment.transferred_btn', 'Я перевел(а) ${{amount}}', { amount })}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. ЭКРАН 3D-SECURE (SMS) */}
        {step === '3ds' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-lg">
                {t('payment.3ds_title', '3D Secure Подтверждение')}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {t('payment.3ds_desc', 'Мы отправили SMS с одноразовым кодом на ваш номер телефона.')}
              </p>
              <span className="inline-block bg-slate-100 text-slate-600 font-mono text-[11px] px-2 py-0.5 rounded-md mt-2">
                {t('payment.test_code', 'Тестовый код: 1111')}
              </span>
            </div>

            <form onSubmit={handleVerify3DS} className="space-y-4 max-w-xs mx-auto">
              <div>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1 1 1 1"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 text-center tracking-[1em] font-mono text-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {smsError && (
                  <span className="text-[11px] font-bold text-rose-600 block mt-1">
                    {t('payment.sms_error', 'Неверный код. Введите 1111')}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-extrabold py-3.5 rounded-2xl transition-all cursor-pointer text-xs active:scale-95"
              >
                {t('payment.confirm_charge', 'Подтвердить списание')}
              </button>
            </form>
          </div>
        )}

        {/* 3. ЭКРАН ПРОЦЕССИНГА */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4 my-auto">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <div>
              <h3 className="font-black text-slate-900 text-base">
                {t('payment.processing_title', 'Обработка транзакции...')}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {t('payment.processing_desc', 'Связываемся с Центральным Банком Египта')}
              </p>
            </div>
          </div>
        )}

        {/* 4. ЧЕК ОБ УСПЕШНОЙ ОПЛАТЕ */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-md">
                {t('payment.paid_status', 'Оплачено 🟢')}
              </span>
              <h3 className="text-xl font-black text-slate-900 pt-2">
                {t('payment.success_title', 'Платеж успешно проведен!')}
              </h3>
              <p className="text-slate-500 text-xs mt-1">
                {t('payment.success_desc', 'Электронный чек сгенерирован и прикреплен к вашей брони.')}
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-4 rounded-2xl transition-all cursor-pointer text-xs shadow-lg active:scale-95"
            >
              {t('payment.continue_btn', 'Перейти к подтверждению заказа')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};