import { useTranslation } from "react-i18next";
// src/pages/Dashboard/Home/DashboardAgent.tsx
const DashboardAgent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{t('dashboard.agentWelcome')}</h2>
      <p>{t('dashboard.agentSubtitle')}</p>
    </div>
  );
};

export default DashboardAgent;
