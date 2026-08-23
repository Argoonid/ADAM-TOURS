import React, { useState } from 'react';
import { 
  ChevronDown, QrCode, FileCheck, Banknote, 
  RotateCcw, Bus, ShieldCheck, HelpCircle, Sparkles 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FAQItem {
  id: string;
  icon: React.ReactNode;
  question: string;
  answer: string;
  badge?: string;
}

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      id: 'qr',
      icon: <QrCode className="w-5 h-5 text-amber-600" />,
      question: t('faq.q_qr', 'Как работает электронный QR-код при посадке на экскурсию?'),
      answer: t(
        'faq.a_qr',
        'Сразу после оформления брони на сайте вы получаете электронный ваучер с персональным QR-кодом. Распечатывать его не нужно — достаточно показать экран смартфона. В начале поездки гид сканирует ваш QR-код служебным приложением: система мгновенно сверяет данные брони, подтверждает посадку (Check-In) и фиксирует оплату наличными.'
      ),
      badge: 'Мгновенный Check-In со смартфона'
    },
    {
      id: 'passport',
      icon: <FileCheck className="w-5 h-5 text-amber-600" />,
      question: t('faq.q_passport', 'Зачем отправлять фото паспорта менеджеру в мессенджере?'),
      answer: t(
        'faq.a_passport',
        'Брать с собой оригинал паспорта и переживать за его сохранность не требуется! Фото главной страницы загранпаспорта нужно отправить менеджеру в WhatsApp/Telegram после оформления заявки. Это необходимо для заблаговременной регистрации в Туристической полиции Египта и оформления официальных разрешений на выезд транспорта и выход морских судов.'
      ),
      badge: 'Только фото в мессенджер • Оригинал брать не нужно'
    },
    {
      id: 'payment',
      icon: <Banknote className="w-5 h-5 text-emerald-600" />,
      question: t('faq.q_payment', 'Нужно ли вносить предоплату и как производится расчет?'),
      answer: t(
        'faq.a_payment',
        'Никакой предоплаты на сайте нет — бронирование на 100% бесплатное и безопасное. Полная оплата передается наличными гиду или водителю прямо во время посадки в автобус. К оплате принимаются доллары (USD), евро (EUR), египетские фунты (EGP) или банковский перевод по согласованному курсу.'
      ),
      badge: '0% Предоплаты • Оплата при посадке'
    },
    {
      id: 'cancel',
      icon: <RotateCcw className="w-5 h-5 text-rose-600" />,
      question: t('faq.q_cancel', 'Что делать, если изменились планы или нужно отменить поездку?'),
      answer: t(
        'faq.a_cancel',
        'Отмена или перенос даты поездки абсолютно бесплатные. Если у вас поменялись планы, вы заболели или хотите выбрать другой день — просто напишите менеджеру в WhatsApp минимум за 2–3 часа до времени трансфера, и мы снимем бронь без комиссий и штрафов.'
      ),
      badge: 'Бесплатная отмена в 1 клик'
    },
    {
      id: 'transfer',
      icon: <Bus className="w-5 h-5 text-sky-600" />,
      question: t('faq.q_transfer', 'Откуда забирает трансфер и входит ли он в стоимость?'),
      answer: t(
        'faq.a_transfer',
        'Трансфер в обе стороны уже включен в стоимость всех экскурсий. Комфортабельный автобус или микроавтобус с кондиционером заберет вас прямо от ворот вашего отеля (Security Gate / ресепшен) в Шарм-эль-Шейхе и привезет обратно после завершения программы.'
      ),
      badge: 'Трансфер от ворот отеля включен'
    },
    {
      id: 'bring',
      icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />,
      question: t('faq.q_bring', 'Что взять с собой на экскурсию?'),
      answer: t(
        'faq.a_bring',
        'Питьевую воду, солнцезащитный крем, очки и головной убор. Для морских прогулок возьмите купальные принадлежности и пляжные полотенца из отеля. Для пустынного сафари — удобную обувь и арафатку (платок от песка). Для поездок в Каир или восхождения на Синай — теплую кофту.'
      )
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-xs">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>{t('faq.badge', 'База знаний путешественника')}</span>
        </div>
        
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          {t('faq.title', 'Часто задаваемые вопросы')}
        </h2>
        
        <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          {t('faq.subtitle', 'Всё об оформлении разрешений, системе электронных QR-билетов и правилах безопасного отдыха')}
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={item.id}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'bg-white border-amber-300 shadow-md shadow-amber-500/5' 
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-colors ${
                    isOpen 
                      ? 'bg-amber-50 border-amber-200 shadow-xs' 
                      : 'bg-slate-100 border-slate-200/80'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {item.question}
                  </span>
                </div>

                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                  isOpen 
                    ? 'rotate-180 bg-amber-500 text-slate-950' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 space-y-3">
                  <p>{item.answer}</p>
                  
                  {item.badge && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-bold text-[11px] px-3 py-1 rounded-xl border border-amber-200">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.badge}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};