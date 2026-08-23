import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import en from './locales/en.json';
import it from './locales/it.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      en: { translation: en },
      it: { translation: it },
    },
    fallbackLng: 'ru',
    lng: 'ru',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Отключает блокировку рендера в React 19
    },
  });

export default i18n;