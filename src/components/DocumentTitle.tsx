import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const DocumentTitle = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('title');
  }, [t]);

  return null;
};
