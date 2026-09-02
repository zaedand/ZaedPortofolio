import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import id from './locales/id.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id }
  },
  lng: 'en', // bahasa default
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React sudah otomatis escape, tidak perlu escape ganda
  }
});

export default i18n;