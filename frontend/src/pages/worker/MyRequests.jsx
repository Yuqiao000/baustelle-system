import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Search, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

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

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200',
      confirmed: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
      preparing: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200',
      ready: 'bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200',
      shipped: 'bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200',
      completed: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      cancelled: 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200',
    }
    return styles[status] || 'bg-gray-50 border-gray-200'
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-400 text-yellow-900',
      confirmed: 'bg-blue-400 text-blue-900',
      preparing: 'bg-purple-400 text-purple-900',
      ready: 'bg-indigo-400 text-indigo-900',
      shipped: 'bg-cyan-400 text-cyan-900',
      completed: 'bg-green-400 text-green-900',
      cancelled: 'bg-red-400 text-red-900',
    }
    return badges[status] || 'bg-gray-400 text-gray-900'
  }

  const getStatusIcon = (status) => {
    if (status === 'completed') {
      return <CheckCircle className="w-4 h-4" />
    }
    return <Clock className="w-4 h-4" />
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ausstehend',
      confirmed: 'Bestätigt',
      preparing: 'Vorbereitung',
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
        <h1 className="text-3xl font-bold text-gray-800">Meine Anträge</h1>
        <p className="mt-1 text-gray-600">Verwalten Sie Ihre Materialanfragen</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
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
          </div>

          <div className="md:w-64">
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
              <option value="cancelled">Storniert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center">
          <p className="text-gray-600 mb-4">Keine Anfragen gefunden</p>
          <Link to="/worker/new-request" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
            Neue Anfrage erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              to={`/worker/requests/${request.id}`}
              className={`block border-2 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all ${getStatusStyle(request.status)}`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header with status */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-gray-800">{request.request_number}</h3>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status).toUpperCase()}
                      </span>
                      {request.priority === 'high' || request.priority === 'urgent' ? (
                        <span className="text-xs px-3 py-1.5 bg-red-400 text-red-900 rounded-full font-bold">
                          {request.priority === 'urgent' ? '⚡ DRINGEND' : '🔥 HOCH'}
                        </span>
                      ) : null}
                    </div>
                    {/* Baustelle name */}
                    {request.baustelle && (
                      <p className="text-sm font-semibold text-gray-700">
                        🏗️ {request.baustelle.name} {request.baustelle.city && `- ${request.baustelle.city}`}
                      </p>
                    )}
                  </div>

                  {/* Items Preview - Show what was requested */}
                  {request.items && request.items.length > 0 ? (
                    <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-600 mb-2">📦 ANGEFORDERTE ARTIKEL:</p>
                      <div className="space-y-1">
                        {request.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-800">
                              {item.item?.name || item.item_name || item.name || 'Material'}
                            </span>
                            <span className="font-bold text-blue-600">{item.quantity} {item.unit}</span>
                          </div>
                        ))}
                        {request.items.length > 3 && (
                          <p className="text-xs text-gray-600 font-medium pt-1">
                            + {request.items.length - 3} weitere Artikel...
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white bg-opacity-70 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-bold text-gray-600 mb-2">📸 SCHNELLANFRAGE (mit Bildern)</p>

                      {/* Show image thumbnails */}
                      {request.images && request.images.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex gap-2 overflow-x-auto">
                            {request.images.slice(0, 3).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.image_url}
                                alt={img.file_name}
                                className="h-16 w-16 object-cover rounded-lg border-2 border-gray-300 flex-shrink-0"
                              />
                            ))}
                            {request.images.length > 3 && (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-600">+{request.images.length - 3}</span>
                              </div>
                            )}
                          </div>
                          {request.notes && (
                            <p className="text-sm text-gray-700 font-medium line-clamp-2 italic">"{request.notes}"</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 italic">Keine Details verfügbar</p>
                      )}
                    </div>
                  )}

                  {/* Dates and info */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    <span className="font-medium">📅 Erstellt: {format(new Date(request.created_at), 'dd.MM.yyyy')}</span>
                    {request.needed_date && (
                      <span className="font-medium">⏰ Benötigt: {format(new Date(request.needed_date), 'dd.MM.yyyy')}</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-4">
                  <span className="inline-block px-4 py-2 bg-white text-blue-600 font-bold rounded-lg shadow-sm">
                    Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
