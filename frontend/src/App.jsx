import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useNotificationStore } from './store/notificationStore'

// Pages
import LoginPage from './pages/LoginPage'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import CreateRequest from './pages/worker/CreateRequest'
import MyRequests from './pages/worker/MyRequests'
import RequestDetails from './pages/worker/RequestDetails'
import LagerDashboard from './pages/lager/LagerDashboard'
import AllRequests from './pages/lager/AllRequests'
import InventoryManagement from './pages/lager/InventoryManagement'
import InventoryScan from './pages/lager/InventoryScan'
import Statistics from './pages/lager/Statistics'
import Layout from './components/Layout'

function App() {
  const { user, profile, loading, initialize } = useAuthStore()
  const { initialize: initNotifications, cleanup: cleanupNotifications } = useNotificationStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user?.id) {
      initNotifications(user.id)
      return () => cleanupNotifications()
    }
  }, [user?.id, initNotifications, cleanupNotifications])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  // 根据角色重定向到不同的首页
  const getDefaultRoute = () => {
    if (!profile) return '/worker'
    return profile.role === 'worker' ? '/worker' : '/lager'
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* 工人端路由 */}
        <Route path="/worker" element={<WorkerDashboard />} />
        <Route path="/worker/new-request" element={<CreateRequest />} />
        <Route path="/worker/requests" element={<MyRequests />} />
        <Route path="/worker/requests/:id" element={<RequestDetails />} />

        {/* 仓库端路由 */}
        <Route path="/lager" element={<LagerDashboard />} />
        <Route path="/lager/requests" element={<AllRequests />} />
        <Route path="/lager/requests/:id" element={<RequestDetails />} />
        <Route path="/lager/inventory" element={<InventoryManagement />} />
        <Route path="/lager/scan" element={<InventoryScan />} />
        <Route path="/lager/statistics" element={<Statistics />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Layout>
  )
}

export default App
