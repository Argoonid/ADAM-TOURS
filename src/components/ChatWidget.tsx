import React, { useState } from 'react';
import { MessageCircle, X, Send, Bot, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ChatWidget: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Список частых вопросов с локализацией
  const quickQuestions = [
    {
      q: t('chat.q1', 'Нужна ли предоплата?'),
      a: t('chat.a1', 'Нет, предоплата не требуется! Вы оплачиваете экскурсию наличными гиду прямо при посадке.')
    },
    {
      q: t('chat.q2', 'Заберут ли меня из отеля?'),
      a: t('chat.a2', 'Да, трансфер из вашего отеля в Шарм-эль-Шейхе и обратно входит в стоимость абсолютно всех туров.')
    },
    {
      q: t('chat.q3', 'Что брать с собой на море?'),
      a: t('chat.a3', 'Паспорт (оригинал), купальник, полотенце, солнцезащитный крем и хорошее настроение!')
    },
    {
      q: t('chat.q4', 'Как связаться с гидом?'),
      a: t('chat.a4', 'Напишите нам напрямую в WhatsApp (+20 100 000 00 00). Мы на связи 24/7!')
    }
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 font-sans">
      {/* Плавающая кнопка */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer relative"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-2 border-white animate-pulse" />
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Окно чат-бота */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-80 sm:w-96 overflow-hidden flex flex-col animate-fade-in-up">
          {/* Шапка чата */}
          <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {t('chat.assistant_title', 'Помощник SHARM Tours')}
                </h4>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" /> 
                  {t('chat.online_status', 'Онлайн 24/7')}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Содержимое */}
          <div className="p-4 space-y-4 max-h-80 overflow-y-auto bg-slate-50 text-xs">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <p className="font-bold text-slate-900">
                {t('chat.greeting_title', '👋 Здравствуйте!')}
              </p>
              <p className="text-slate-600">
                {t('chat.greeting_desc', 'Нажмите на вопрос ниже или перейдите в живой чат WhatsApp.')}
              </p>
            </div>

            {selectedAnswer && (
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-emerald-900 space-y-1 animate-fade-in">
                <p className="font-extrabold text-[10px] text-emerald-700 uppercase tracking-wider">
                  {t('chat.bot_answer', 'Ответ бота:')}
                </p>
                <p className="font-medium leading-relaxed">{selectedAnswer}</p>
              </div>
            )}

            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> {t('chat.faq_title', 'Частые вопросы:')}
              </span>
              {quickQuestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAnswer(item.a)}
                  className="w-full text-left bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 p-2.5 rounded-xl font-bold text-slate-700 transition-all text-xs cursor-pointer"
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Быстрый переход в WA */}
          <div className="p-3 bg-white border-t border-slate-100">
            <a
              href="https://wa.me/201000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('chat.whatsapp_btn', 'Задать вопрос в WhatsApp')}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};