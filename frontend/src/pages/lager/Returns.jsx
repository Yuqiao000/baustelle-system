import { useState, useEffect } from 'react'
import { PackageMinus, CheckCircle, XCircle, Calendar, User, FileText, Clock } from 'lucide-react'
import api from '../../api/axios'

export default function Returns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending') // all, pending, approved, rejected
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchReturns()
  }, [filter])

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const params = {}
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

  const handleApprove = async (returnId) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Rückgabe genehmigen möchten?')) {
      return
    }

    setActionLoading(true)
    try {
      await api.patch(`/returns/${returnId}/approve`)
      alert('Rückgabe erfolgreich genehmigt')
      await fetchReturns()
    } catch (error) {
      console.error('Error approving return:', error)
      alert('Fehler beim Genehmigen der Rückgabe')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Bitte geben Sie einen Ablehnungsgrund an')
      return
    }

    setActionLoading(true)
    try {
      await api.patch(`/returns/${selectedReturn.id}/reject`, {
        rejection_reason: rejectionReason
      })
      alert('Rückgabe erfolgreich abgelehnt')
      closeModal()
      await fetchReturns()
    } catch (error) {
      console.error('Error rejecting return:', error)
      alert('Fehler beim Ablehnen der Rückgabe')
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectModal = (returnRequest) => {
    setSelectedReturn(returnRequest)
    setRejectionReason('')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedReturn(null)
    setRejectionReason('')
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <PackageMinus className="h-8 w-8 mr-3 text-blue-600" />
          Rückgaben-Verwaltung
        </h1>
        <p className="text-gray-600 mt-1">Verwalten Sie Materialrückgaben von Arbeitern</p>
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
          <p className="text-gray-600">Es gibt keine Rückgaben mit dem ausgewählten Filter</p>
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

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {returnRequest.worker_name || 'Unbekannt'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(returnRequest.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>

                  {returnRequest.project_name && (
                    <p className="text-sm text-gray-600 mt-1">
                      Projekt: {returnRequest.project_name}
                    </p>
                  )}

                  {returnRequest.reason && (
                    <p className="text-sm text-gray-600 mt-1">
                      Grund: {returnRequest.reason.replace(/_/g, ' ')}
                    </p>
                  )}
                </div>
              </div>

              {returnRequest.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Bemerkungen:</p>
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
                  <p className="text-sm font-medium text-gray-700 mb-3">Materialien:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {returnRequest.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {item.item?.name || 'Unbekanntes Material'}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.quantity} {item.item?.unit}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-gray-500 mt-1">{item.notes}</p>
                          )}
                        </div>
                        {item.condition && (
                          <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                            item.condition === 'good' ? 'bg-green-100 text-green-800' :
                            item.condition === 'damaged' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.condition === 'good' ? 'Gut' :
                             item.condition === 'damaged' ? 'Beschädigt' : 'Defekt'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {returnRequest.status === 'pending' && (
                <div className="mt-4 flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(returnRequest.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Genehmigen
                  </button>
                  <button
                    onClick={() => openRejectModal(returnRequest)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Ablehnen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Rückgabe ablehnen</h2>
              <p className="text-sm text-gray-600 mt-1">
                {selectedReturn.return_number}
              </p>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ablehnungsgrund *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Bitte geben Sie den Grund für die Ablehnung an..."
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={closeModal}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Ablehnen...' : 'Ablehnen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
