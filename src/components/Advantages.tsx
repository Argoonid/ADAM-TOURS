import React from 'react';
import { Wallet, Bus, UserCheck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Advantages: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    {
      icon: <Wallet className="w-7 h-7 text-amber-500" />,
      title: t('advantages.item1_title', 'Оплата на месте'),
      desc: t(
        'advantages.item1_desc',
        'Никаких рисков и предоплат. Вы оплачиваете экскурсию гиду или водителю прямо во время посадки.'
      )
    },
    {
      icon: <Bus className="w-7 h-7 text-cyan-500" />,
      title: t('advantages.item2_title', 'Заберем прямо из отеля'),
      desc: t(
        'advantages.item2_desc',
        'Комфортабельные трансферы с кондиционером заберут вас от ресепшен отеля и привезут обратно.'
      )
    },
    {
      icon: <UserCheck className="w-7 h-7 text-emerald-500" />,
      title: t('advantages.item3_title', 'Русскоязычные гиды'),
      desc: t(
        'advantages.item3_desc',
        'Все наши гиды отлично говорят по-русски и знают историю и секретные места Египта наизусть.'
      )
    },
    {
      icon: <Clock className="w-7 h-7 text-purple-500" />,
      title: t('advantages.item4_title', 'Быстрая отмена'),
      desc: t(
        'advantages.item4_desc',
        'Планы изменились? Просто напишите нам за пару часов — отмена брони абсолютно бесплатная.'
      )
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            {t('advantages.title', 'Почему туристы выбирают ELINA TOURS')}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            {t('advantages.subtitle', 'Заботимся о вашем комфорте и безопасности на каждом этапе отдыха')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-3xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-5 border border-slate-100">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};