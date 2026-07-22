import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: t('faq.q1', 'Нужно ли вносить предоплату при бронировании?'),
      answer: t(
        'faq.a1',
        'Нет, предоплата не требуется! Вы оплачиваете экскурсию гиду или водителю наличными прямо в автобусе/трансфере во время посадки.'
      )
    },
    {
      question: t('faq.q2', 'Откуда меня заберут на экскурсию?'),
      answer: t(
        'faq.a2',
        'Трансфер заберет вас прямо от главного входа (ресепшен) вашего отеля в Шарм-эль-Шейхе и привезет обратно после завершения программы.'
      )
    },
    {
      question: t('faq.q3', 'В какой валюте можно оплатить?'),
      answer: t(
        'faq.a3',
        'Мы принимаем оплату в долларах (USD), евро (EUR), египетских фунтах (EGP) или банковским переводом (по согласованному курсу).'
      )
    },
    {
      question: t('faq.q4', 'На каком языке говорят гиды?'),
      answer: t(
        'faq.a4',
        'Все наши гиды отлично владеют выбранным языком общения, проводят интересные и понятные инструктажи и экскурсии.'
      )
    },
    {
      question: t('faq.q5', 'Что делать, если у меня изменились планы или я заболел?'),
      answer: t(
        'faq.a5',
        'Отмена абсолютно бесплатная! Просто предупредите нас в WhatsApp за 2–3 часа до начала трансфера, чтобы мы сняли бронь.'
      )
    }
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold">
            <HelpCircle className="w-4 h-4 text-cyan-500" />
            <span>{t('faq.badge', 'Частые вопросы')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('faq.title', 'Всё, что вам нужно знать перед поездкой')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            {t('faq.subtitle', 'Отвечаем на основные вопросы туристов простым языком')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-amber-100 text-amber-700' : 'text-slate-500'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};