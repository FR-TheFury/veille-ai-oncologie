
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from '@/locales/en/common.json';
import frCommon from '@/locales/fr/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  fr: {
    common: frCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    
    interpolation: {
      escapeValue: false,
      // Ensure interpolation works correctly
      format: function(value, format, lng) {
        if (format === 'number') return new Intl.NumberFormat(lng).format(value);
        return value;
      }
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Enable debug mode to see interpolation issues
    debug: false,
    
    // Ensure variables are properly processed
    returnObjects: false,
  });

export default i18n;
