import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Filter, Search } from 'lucide-react'

export default function MyRequests() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadRequests()
  }, [user, statusFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const params = { worker_id: user.id }
      if (statusFilter) {
        params.status = statusFilter
      }
      const data = await api.getRequests(params)
      setRequests(data)
    } catch (error) {
      console.error('Load requests error:', error)
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

  const filteredRequests = requests.filter((request) =>
    request.request_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meine Anfragen</h1>
        <p className="mt-1 text-gray-600">Verwalten Sie Ihre Materialanfragen</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nach Anfragenummer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="md:w-64">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">Alle Status</option>
              <option value="pending">Ausstehend</option>
              <option value="confirmed">Bestätigt</option>
              <option value="preparing">In Vorbereitung</option>
              <option value="ready">Bereit</option>
              <option value="shipped">Versandt</option>
              <option value="completed">Abgeschlossen</option>
              <option value="cancelled">Storniert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Keine Anfragen gefunden</p>
          <Link to="/worker/new-request" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Neue Anfrage erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              to={`/worker/requests/${request.id}`}
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{request.request_number}</h3>
                    <span className={getStatusBadge(request.status)}>
                      {getStatusText(request.status)}
                    </span>
                    {request.priority === 'high' || request.priority === 'urgent' ? (
                      <span className="badge bg-red-100 text-red-800">
                        {request.priority === 'urgent' ? 'Dringend' : 'Hoch'}
                      </span>
                    ) : null}
                  </div>

                  {request.notes && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}</span>
                    {request.needed_date && (
                      <span>Benötigt: {new Date(request.needed_date).toLocaleDateString('de-DE')}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <span className="text-primary-600 font-medium">Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
