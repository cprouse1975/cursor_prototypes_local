import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import VisionPage from './pages/VisionPage';
import ProductEditorPage from './pages/ProductEditorPage';
import PricingTablePage from './pages/PricingTablePage';
import QuotePage from './pages/QuotePage';
import ProjectPage from './pages/ProjectPage';
import OrderTicketPage from './pages/OrderTicketPage';
import InvoicePage from './pages/InvoicePage';
import GapsPage from './pages/GapsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<VisionPage />} />
          <Route path="product-editor" element={<ProductEditorPage />} />
          <Route path="pricing-table" element={<PricingTablePage />} />
          <Route path="quote" element={<QuotePage />} />
          <Route path="project" element={<ProjectPage />} />
          <Route path="order" element={<OrderTicketPage />} />
          <Route path="invoice" element={<InvoicePage />} />
          <Route path="gaps" element={<GapsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
