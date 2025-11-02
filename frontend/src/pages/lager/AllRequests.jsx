import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Search, Bell } from 'lucide-react'
import { format } from 'date-fns'

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

      const data = await api.getRequests(params)
      setRequests(data)
    } catch (error) {
      console.error('Load requests error:', error)
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

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500',
      confirmed: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500',
      preparing: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-500',
      ready: 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-500',
      shipped: 'bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-500',
      completed: 'bg-gradient-to-r from-green-50 to-emerald-50 border-gray-300',
      cancelled: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-500',
    }
    return styles[status] || 'bg-gray-50 border-gray-300'
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-cyan-100 text-cyan-800',
      completed: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'NEU',
      confirmed: 'BESTÄTIGT',
      preparing: 'VORBEREITUNG',
      ready: 'BEREIT',
      shipped: 'VERSANDT',
      completed: 'ABGESCHLOSSEN',
      cancelled: 'STORNIERT',
    }
    return texts[status] || status.toUpperCase()
  }

  const filteredRequests = requests.filter((request) =>
    request.request_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingRequests = filteredRequests.filter(r => r.status === 'pending')
  const activeRequests = filteredRequests.filter(r => ['confirmed', 'preparing', 'ready', 'shipped'].includes(r.status))
  const completedRequests = filteredRequests.filter(r => ['completed', 'cancelled'].includes(r.status))

  return (
    <div className="space-y-6">
      {/* Header with Alert */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Alle Anfragen</h1>
        <p className="mt-1 text-gray-600">Verwalten Sie alle Materialanfragen</p>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6 text-red-600" />
            <span className="font-bold text-red-800 text-lg">{pendingRequests.length} neue Anfragen</span>
          </div>
          <p className="text-sm text-red-700 font-medium">Heute zu bearbeiten</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Anfragenummer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-600">Keine Anfragen gefunden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`border-l-4 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all ${getStatusStyle(request.status)}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-800">{request.request_number}</h3>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase ${getStatusBadge(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                    {request.priority === 'high' || request.priority === 'urgent' ? (
                      <span className="text-xs px-3 py-1.5 bg-red-400 text-red-900 rounded-full font-bold">
                        {request.priority === 'urgent' ? '⚡ DRINGEND' : '🔥 HOCH'}
                      </span>
                    ) : null}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-semibold mb-1">👷 {request.worker?.full_name || 'Unbekannt'}</p>
                    <p className="text-xs text-gray-500">{request.baustelle?.name || 'Keine Baustelle'}</p>
                  </div>

                  {request.notes && (
                    <p className="text-sm text-gray-700 mb-3 font-medium">{request.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="font-medium">📅 Erstellt: {format(new Date(request.created_at), 'dd.MM.yyyy')}</span>
                    {request.needed_date && (
                      <span className="font-medium">📆 Benötigt: {format(new Date(request.needed_date), 'dd.MM.yyyy')}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'confirmed')}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        ✓ Bestätigen
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request.id, 'preparing')}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                        📦 Vorbereiten
                      </button>
                    </>
                  )}
                  {request.status === 'preparing' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'ready')}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                      >
                      ✓ Bereit
                    </button>
                  )}
                  {request.status === 'ready' && (
                    <button
                      onClick={() => handleStatusUpdate(request.id, 'shipped')}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      🚚 Versenden
                    </button>
                  )}
                  <Link
                    to={`/lager/requests/${request.id}`}
                    className="px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-center"
                  >
                    Details →
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
