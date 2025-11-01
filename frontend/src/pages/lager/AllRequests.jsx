import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Filter, Search } from 'lucide-react'

export default function AllRequests() {
  const { user } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadRequests()
  }, [statusFilter, priorityFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (priorityFilter) params.priority = priorityFilter

      console.log('Loading requests with params:', params)
      const data = await api.getRequests(params)
      console.log('Received requests:', data)
      setRequests(data)
    } catch (error) {
      console.error('Load requests error:', error)
      console.error('Error details:', error.message, error.stack)
      alert(`Fehler beim Laden der Anfragen: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      await api.updateRequest(requestId, { status: newStatus }, user.id)
      await loadRequests()
    } catch (error) {
      console.error('Update status error:', error)
      alert('Fehler beim Aktualisieren des Status')
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-600',
      normal: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600',
    }
    return colors[priority] || 'text-gray-600'
  }

  const filteredRequests = requests.filter((request) =>
    request.request_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alle Anfragen</h1>
        <p className="mt-1 text-gray-600">Verwalten Sie alle Materialanfragen</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="">Alle Prioritäten</option>
            <option value="low">Niedrig</option>
            <option value="normal">Normal</option>
            <option value="high">Hoch</option>
            <option value="urgent">Dringend</option>
          </select>
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
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="card hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 mb-4 lg:mb-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <Link
                      to={`/lager/requests/${request.id}`}
                      className="text-lg font-semibold text-primary-600 hover:text-primary-700"
                    >
                      {request.request_number}
                    </Link>
                    <span className={getStatusBadge(request.status)}>
                      {getStatusText(request.status)}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                  </div>

                  {request.notes && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{request.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}</span>
                    {request.needed_date && (
                      <span>Benötigt: {new Date(request.needed_date).toLocaleDateString('de-DE')}</span>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Bestätigen
                    </button>
                  )}
                  {request.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'preparing')}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Vorbereiten
                    </button>
                  )}
                  {request.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'ready')}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Bereit
                    </button>
                  )}
                  {request.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'shipped')}
                      className="px-3 py-1 text-sm bg-cyan-600 text-white rounded hover:bg-cyan-700"
                    >
                      Versenden
                    </button>
                  )}
                  {request.status === 'shipped' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'completed')}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Abschließen
                    </button>
                  )}
                  <Link
                    to={`/lager/requests/${request.id}`}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
