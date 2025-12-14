// src/pages/Dashboard/Home/DashboardProspect.tsx
import { useTranslation } from "react-i18next";

const DashboardProspect = () => {
const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t('dashboard.prospectWelcome')}</h2>
      <p>{t('dashboard.prospectSubtitle')}</p>
    </div>
  );
};

export default DashboardProspect;
