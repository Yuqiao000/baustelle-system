import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageMinus, Plus, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuthStore } from '../../store/authStore'

export default function MyReturns() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected

  useEffect(() => {
    fetchReturns()
  }, [filter])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const params = { worker_id: user.id }
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await api.get('/returns', { params })
      setReturns(response.data)
    } catch (error) {
      console.error('Error fetching returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ausstehend'
      case 'approved':
        return 'Genehmigt'
      case 'rejected':
        return 'Abgelehnt'
      default:
        return status
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PackageMinus className="h-8 w-8 mr-3 text-blue-600" />
            Meine Rückgaben
          </h1>
          <p className="text-gray-600 mt-1">Übersicht Ihrer Materialrückgaben</p>
        </div>
        <button
          onClick={() => navigate('/worker/returns/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neue Rückgabe
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Ausstehend
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Genehmigt
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'rejected'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Abgelehnt
        </button>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Lade Rückgaben...</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <PackageMinus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Rückgaben gefunden</h3>
          <p className="text-gray-600 mb-4">Erstellen Sie eine neue Rückgabe-Anfrage</p>
          <button
            onClick={() => navigate('/worker/returns/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neue Rückgabe
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnRequest) => (
            <div key={returnRequest.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {returnRequest.return_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(returnRequest.status)}`}>
                      {getStatusIcon(returnRequest.status)}
                      <span className="ml-1">{getStatusText(returnRequest.status)}</span>
                    </span>
                  </div>

                  {returnRequest.project_name && (
                    <p className="text-sm text-gray-600">
                      Projekt: {returnRequest.project_name}
                    </p>
                  )}

                  {returnRequest.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Grund: {returnRequest.reason.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>

                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(returnRequest.created_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
              </div>

              {returnRequest.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{returnRequest.notes}</p>
                </div>
              )}

              {returnRequest.rejection_reason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Ablehnungsgrund:</p>
                  <p className="text-sm text-red-700 mt-1">{returnRequest.rejection_reason}</p>
                </div>
              )}

              {returnRequest.items && returnRequest.items.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Materialien:</p>
                  <div className="space-y-2">
                    {returnRequest.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-900">
                          {item.item?.name || 'Unbekanntes Material'}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">
                            {item.quantity} {item.item?.unit}
                          </span>
                          {item.condition && (
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              item.condition === 'good' ? 'bg-green-100 text-green-800' :
                              item.condition === 'damaged' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.condition === 'good' ? 'Gut' :
                               item.condition === 'damaged' ? 'Beschädigt' : 'Defekt'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
