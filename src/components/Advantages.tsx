import React from 'react';
import { Wallet, Bus, UserCheck, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Advantages: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    {
      icon: <Wallet className="w-7 h-7 text-amber-600" />,
      badgeBg: 'bg-amber-50 border-amber-200/80',
      title: t('advantages.item1_title', 'Оплата на месте'),
      desc: t(
        'advantages.item1_desc',
        'Никаких рисков и предоплат. Вы оплачиваете экскурсию гиду или водителю прямо во время посадки.'
      )
    },
    {
      icon: <Bus className="w-7 h-7 text-sky-600" />,
      badgeBg: 'bg-sky-50 border-sky-200/80',
      title: t('advantages.item2_title', 'Заберем прямо из отеля'),
      desc: t(
        'advantages.item2_desc',
        'Комфортабельные трансферы с кондиционером заберут вас от ресепшен отеля и привезут обратно.'
      )
    },
    {
      icon: <UserCheck className="w-7 h-7 text-emerald-600" />,
      badgeBg: 'bg-emerald-50 border-emerald-200/80',
      title: t('advantages.item3_title', 'Русскоязычные гиды'),
      desc: t(
        'advantages.item3_desc',
        'Все наши гиды отлично говорят по-русски и знают историю и секретные места Египта наизусть.'
      )
    },
    {
      icon: <Clock className="w-7 h-7 text-rose-600" />,
      badgeBg: 'bg-rose-50 border-rose-200/80',
      title: t('advantages.item4_title', 'Быстрая отмена'),
      desc: t(
        'advantages.item4_desc',
        'Планы изменились? Просто напишите нам за пару часов — отмена брони абсолютно бесплатная.'
      )
    }
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 inline-block mb-3">
            Наши преимущества
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {t('advantages.title', 'Почему туристы выбирают SHARM & ADAM TOURS')}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {t('advantages.subtitle', 'Заботимся о вашем комфорте и безопасности на каждом этапе отдыха')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-7 rounded-3xl bg-[#fafbfc] border border-slate-200/80 hover:border-amber-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className={`w-14 h-14 rounded-2xl ${item.badgeBg} border shadow-xs flex items-center justify-center mb-6`}>
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};