import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { FileText, Clock, Package, CheckCircle, AlertTriangle } from 'lucide-react'

export default function LagerDashboard() {
  const [stats, setStats] = useState(null)
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [dashboardStats, requests] = await Promise.all([
        api.getDashboardStats(),
        api.getRequests({ limit: 10 }),
      ])
      setStats(dashboardStats)
      setRecentRequests(requests.slice(0, 5))
    } catch (error) {
      console.error('Load dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      preparing: 'badge-preparing',
      ready: 'badge-ready',
      shipped: 'badge-shipped',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    }
    return badges[status] || 'badge'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      preparing: 'In Vorbereitung',
      ready: 'Bereit',
      shipped: 'Versandt',
      completed: 'Abgeschlossen',
      cancelled: 'Storniert',
    }
    return texts[status] || status
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lager Dashboard</h1>
        <p className="mt-1 text-gray-600">Übersicht über alle Anfragen und Lagerbestände</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_requests || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending_requests || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Bearbeitung</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats?.in_progress_requests || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Heute abgeschlossen</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed_today || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Neueste Anfragen</h2>
            <Link to="/lager/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Alle anzeigen →
            </Link>
          </div>

          <div className="space-y-3">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/lager/requests/${request.id}`}
                className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{request.request_number}</h3>
                      <span className={getStatusBadge(request.status)}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Niedrige Lagerbestände</h2>
            <Link to="/lager/inventory" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Lager verwalten →
            </Link>
          </div>

          {stats?.low_stock_items && stats.low_stock_items.length > 0 ? (
            <div className="space-y-3">
              {stats.low_stock_items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Aktuell: {item.stock_quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-red-600">Niedrig</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Alle Bestände sind ausreichend</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
