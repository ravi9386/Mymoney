import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './state/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AssetsPage from './pages/Assets'
import LiabilitiesPage from './pages/Liabilities'
import ProjectionsPage from './pages/Projections'
import RetirementPage from './pages/Retirement'
import SettingsPage from './pages/Settings'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="liabilities" element={<LiabilitiesPage />} />
          <Route path="projections" element={<ProjectionsPage />} />
          <Route path="retirement" element={<RetirementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
