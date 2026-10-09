import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import OverviewPage from './pages/OverviewPage';
import ClassLibraryPage from './pages/ClassLibraryPage';
import AdmixClassPage from './pages/AdmixClassPage';
import CementClassPage from './pages/CementClassPage';
import CoarseFineAggPage from './pages/CoarseFineAggPage';
import ExposurePage from './pages/ExposurePage';
import DesignMethodPage from './pages/DesignMethodPage';
import MixBuilderPage from './pages/MixBuilderPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="class-library" element={<ClassLibraryPage />} />
          <Route path="admix" element={<AdmixClassPage />} />
          <Route path="cement" element={<CementClassPage />} />
          <Route path="coarse-fine" element={<CoarseFineAggPage />} />
          <Route path="exposure" element={<ExposurePage />} />
          <Route path="design-method" element={<DesignMethodPage />} />
          <Route path="mix-builder" element={<MixBuilderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
