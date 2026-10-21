import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import { ConfigProvider } from './context/ConfigContext.jsx';
import BatchPage from './pages/BatchPage.jsx';
import CompanyPage from './pages/CompanyPage.jsx';
import DispatchPage from './pages/DispatchPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import PlantsPage from './pages/PlantsPage.jsx';

export default function App() {
  return (
    <ConfigProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="company" element={<CompanyPage />} />
          <Route path="plants" element={<PlantsPage />} />
          <Route path="batch" element={<BatchPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}
