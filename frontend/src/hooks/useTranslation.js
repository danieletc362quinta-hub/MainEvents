import { useLanguage } from '../contexts/UnifiedLanguageContext';

export const useTranslation = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  return { t, currentLanguage, changeLanguage };
};
