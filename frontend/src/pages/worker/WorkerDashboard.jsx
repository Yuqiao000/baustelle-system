import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Package, FileText, Clock, CheckCircle, Plus } from 'lucide-react'

export default function WorkerDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // 获取用户的所有申请
      const requests = await api.getRequests({ worker_id: user.id, limit: 10 })

      // 计算统计数据
      const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === 'pending').length,
        inProgress: requests.filter((r) =>
          ['confirmed', 'preparing', 'ready', 'shipped'].includes(r.status)
        ).length,
        completed: requests.filter((r) => r.status === 'completed').length,
      }

      setStats(stats)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-gray-600">Willkommen zurück!</p>
        </div>
        <Link to="/worker/new-request" className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Neue Anfrage
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
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
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
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
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abgeschlossen</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Letzte Anfragen</h2>
          <Link to="/worker/requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Alle anzeigen →
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Noch keine Anfragen</p>
            <Link to="/worker/new-request" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              Erstellen Sie Ihre erste Anfrage
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/worker/requests/${request.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900">{request.request_number}</h3>
                      <span className={getStatusBadge(request.status)}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{request.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(request.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
