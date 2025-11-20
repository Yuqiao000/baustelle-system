import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { ArrowLeft, MapPin, Calendar, Clock, Package, Image as ImageIcon } from 'lucide-react'

export default function RequestDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
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
        api.getRequestHistory(id),
      ])
      setRequest(requestData)
      setHistory(historyData)
    } catch (error) {
      console.error('Load request details error:', error)
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Anfrage nicht gefunden</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4">
          Zurück
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="btn-secondary flex items-center">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </button>

      {/* Request Header */}
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{request.request_number}</h1>
            <p className="text-gray-600 mt-1">
              Erstellt am {new Date(request.created_at).toLocaleString('de-DE')}
            </p>
          </div>
          <span className={getStatusBadge(request.status)}>
            {getStatusText(request.status)}
          </span>
        </div>

        {/* Request Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Baustelle</p>
              <p className="text-gray-900">{request.baustelle?.name}</p>
              <p className="text-sm text-gray-600">
                {request.baustelle?.address}, {request.baustelle?.city}
              </p>
            </div>
          </div>

          {request.needed_date && (
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Benötigt am</p>
                <p className="text-gray-900">
                  {new Date(request.needed_date).toLocaleDateString('de-DE')}
                </p>
              </div>
            </div>
          )}

          {request.delivery_time && (
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700">Lieferzeit</p>
                <p className="text-gray-900">{request.delivery_time}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">Priorität</p>
              <p className="text-gray-900 capitalize">{request.priority}</p>
            </div>
          </div>
        </div>

        {request.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-1">Bemerkungen</p>
            <p className="text-gray-900">{request.notes}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bestellte Artikel</h2>
        <div className="space-y-3">
          {request.items?.map((requestItem) => (
            <div key={requestItem.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{requestItem.item?.name || 'Unbekannt'}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Typ: {requestItem.item?.type === 'material' ? 'Material' : 'Maschine'}
                  </p>
                  {requestItem.notes && (
                    <p className="text-sm text-gray-600 mt-1">Hinweis: {requestItem.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {requestItem.quantity} {requestItem.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Images */}
      {request.images && request.images.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ImageIcon className="h-6 w-6 mr-2" />
            Hochgeladene Bilder ({request.images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
              <div key={entry.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-primary-600"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900">{getStatusText(entry.status)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString('de-DE')}
                    </p>
                  </div>
                  {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
