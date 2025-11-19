import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'
import { ArrowLeft, MapPin, Calendar, Clock, Package, Image as ImageIcon, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function LagerRequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [request, setRequest] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequestDetails()
  }, [id])

  const loadRequestDetails = async () => {
    try {
      setLoading(true)
      const [requestData, historyData] = await Promise.all([
        api.getRequest(id),
        api.getRequestHistory(id)
      ])
      setRequest(requestData)
      setHistory(historyData)
    } catch (error) {
      console.error('Load request details error:', error)
      alert('Fehler beim Laden der Anfrage')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.updateRequest(id, { status: newStatus }, user.id)
      await loadRequestDetails()
    } catch (error) {
      console.error('Update status error:', error)
      alert('Fehler beim Aktualisieren des Status')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      preparing: 'bg-purple-100 text-purple-800 border-purple-300',
      ready: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      shipped: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      completed: 'bg-gray-100 text-gray-600 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    }
    return badges[status] || 'bg-gray-100 text-gray-600 border-gray-300'
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

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    }
    return badges[priority] || 'bg-gray-100 text-gray-600'
  }

  const getPriorityText = (priority) => {
    const texts = {
      low: 'Niedrig',
      normal: 'Normal',
      high: 'Hoch',
      urgent: 'Dringend',
    }
    return texts[priority] || priority
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="card text-center">
        <p className="text-gray-600">Anfrage nicht gefunden</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/lager/requests')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.request_number}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${getStatusBadge(request.status)}`}>
                {getStatusText(request.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadge(request.priority)}`}>
                {getPriorityText(request.priority)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Action Buttons */}
        <div className="flex gap-2">
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('confirmed')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Bestätigen
              </button>
              <button
                onClick={() => handleStatusUpdate('preparing')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Vorbereiten
              </button>
            </>
          )}
          {request.status === 'confirmed' && (
            <button
              onClick={() => handleStatusUpdate('preparing')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Vorbereiten
            </button>
          )}
          {request.status === 'preparing' && (
            <button
              onClick={() => handleStatusUpdate('ready')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Bereit markieren
            </button>
          )}
          {request.status === 'ready' && (
            <button
              onClick={() => handleStatusUpdate('shipped')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Versenden
            </button>
          )}
        </div>
      </div>

      {/* Request Info */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Anfrage-Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Angefordert von</p>
              <p className="font-medium">{request.worker?.full_name || 'Unbekannt'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Baustelle</p>
              <p className="font-medium">{request.baustelle?.name || 'Keine Baustelle'}</p>
              {request.baustelle?.address && (
                <p className="text-sm text-gray-600">{request.baustelle.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Benötigt am</p>
              <p className="font-medium">
                {request.needed_date
                  ? format(new Date(request.needed_date), 'dd.MM.yyyy')
                  : 'Nicht angegeben'}
              </p>
              {request.delivery_time && (
                <p className="text-sm text-gray-600">Uhrzeit: {request.delivery_time}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Erstellt am</p>
              <p className="font-medium">
                {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {request.notes && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Bemerkungen</p>
                <p className="text-gray-600">{request.notes}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requested Items */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-6 w-6" />
          Angeforderte Materialien
        </h2>
        <div className="space-y-3">
          {request.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.item?.name || 'Unbekannt'}</p>
                {item.item?.barcode && (
                  <p className="text-sm text-gray-500">Barcode: {item.item.barcode}</p>
                )}
                {item.notes && (
                  <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Images */}
      {request.images && request.images.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="h-6 w-6" />
            Hochgeladene Bilder ({request.images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {request.images.map((img, index) => (
              <a
                key={index}
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative"
              >
                <img
                  src={img.image_url}
                  alt={img.file_name || `Material ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 font-medium text-sm bg-blue-600 px-3 py-1 rounded-full">
                    Vergrößern
                  </span>
                </div>
                {img.file_name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg truncate">
                    {img.file_name}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      {history.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statusverlauf</h2>
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(entry.status)}`}>
                      {getStatusText(entry.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(entry.changed_at), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    von {entry.changed_by?.full_name || 'System'}
                  </p>
                  {entry.notes && (
                    <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
