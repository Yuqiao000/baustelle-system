import { useState, useEffect } from 'react'
import { ArrowRightLeft, Plus, CheckCircle, XCircle, Calendar, User, FileText, Clock, Truck } from 'lucide-react'
import { api } from '../../lib/api'

export default function Transfers() {
  const [transfers, setTransfers] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('pending')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projects, setProjects] = useState([])
  const [items, setItems] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

  // Create transfer form
  const [formData, setFormData] = useState({
    from_project_id: '',
    to_project_id: '',
    notes: ''
  })
  const [transferItems, setTransferItems] = useState([{
    item_id: '',
    quantity: '',
    notes: ''
  }])

  useEffect(() => {
    fetchTransfers()
    fetchProjects()
    fetchItems()
  }, [filter])

  const fetchTransfers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter !== 'all') {
        params.status = filter
      }

      const response = await api.get('/transfers', { params })
      setTransfers(response.data)
    } catch (error) {
      console.error('Error fetching transfers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects?is_active=true')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await api.get('/items')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const handleCreateTransfer = async (e) => {
    e.preventDefault()

    if (formData.from_project_id === formData.to_project_id) {
      alert('Quell- und Zielprojekt dürfen nicht identisch sein')
      return
    }

    const validItems = transferItems.filter(item => item.item_id && item.quantity > 0)
    if (validItems.length === 0) {
      alert('Bitte fügen Sie mindestens ein Material hinzu')
      return
    }

    setActionLoading(true)
    try {
      const requestData = {
        ...formData,
        items: validItems.map(item => ({
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          notes: item.notes || null
        }))
      }

      // Use a dummy operator_id - in real app, get from user session
      await api.post('/transfers?operator_id=dummy', requestData)
      alert('Transfer erfolgreich erstellt')
      closeCreateModal()
      await fetchTransfers()
    } catch (error) {
      console.error('Error creating transfer:', error)
      alert('Fehler beim Erstellen des Transfers')
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (transferId) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Transfer genehmigen möchten?')) {
      return
    }

    setActionLoading(true)
    try {
      // Use a dummy bauleiter_id - in real app, get from user session
      await api.patch(`/transfers/${transferId}/approve?bauleiter_id=dummy`)
      alert('Transfer erfolgreich genehmigt')
      await fetchTransfers()
    } catch (error) {
      console.error('Error approving transfer:', error)
      alert('Fehler beim Genehmigen des Transfers')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async (transferId) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Transfer abschließen möchten?')) {
      return
    }

    setActionLoading(true)
    try {
      // Use a dummy operator_id - in real app, get from user session
      await api.patch(`/transfers/${transferId}/complete?operator_id=dummy`)
      alert('Transfer erfolgreich abgeschlossen')
      await fetchTransfers()
    } catch (error) {
      console.error('Error completing transfer:', error)
      alert('Fehler beim Abschließen des Transfers')
    } finally {
      setActionLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({ from_project_id: '', to_project_id: '', notes: '' })
    setTransferItems([{ item_id: '', quantity: '', notes: '' }])
    setShowCreateModal(true)
  }

  const closeCreateModal = () => {
    setShowCreateModal(false)
  }

  const addTransferItem = () => {
    setTransferItems([...transferItems, { item_id: '', quantity: '', notes: '' }])
  }

  const removeTransferItem = (index) => {
    if (transferItems.length > 1) {
      setTransferItems(transferItems.filter((_, i) => i !== index))
    }
  }

  const updateTransferItem = (index, field, value) => {
    const updated = [...transferItems]
    updated[index][field] = value
    setTransferItems(updated)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
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
      case 'completed':
        return <Truck className="h-4 w-4" />
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
      case 'completed':
        return 'Abgeschlossen'
      default:
        return status
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ArrowRightLeft className="h-8 w-8 mr-3 text-blue-600" />
            Material-Transfers
          </h1>
          <p className="text-gray-600 mt-1">Verwaltung von Material-Transfers zwischen Projekten</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neuer Transfer
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
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Abgeschlossen
        </button>
      </div>

      {/* Transfers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Lade Transfers...</p>
        </div>
      ) : transfers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <ArrowRightLeft className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Transfers gefunden</h3>
          <p className="text-gray-600 mb-4">Erstellen Sie einen neuen Transfer</p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neuer Transfer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <div key={transfer.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {transfer.transfer_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span className="ml-1">{getStatusText(transfer.status)}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                    <span className="font-medium">{transfer.from_project_name || 'Unbekannt'}</span>
                    <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{transfer.to_project_name || 'Unbekannt'}</span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Operator: {transfer.operator_name || 'Unbekannt'}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(transfer.created_at).toLocaleDateString('de-DE')}
                    </div>
                  </div>

                  {transfer.bauleiter_approved && transfer.bauleiter_name && (
                    <p className="text-sm text-green-700 mt-1">
                      Genehmigt von: {transfer.bauleiter_name}
                    </p>
                  )}
                </div>
              </div>

              {transfer.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{transfer.notes}</p>
                </div>
              )}

              {transfer.items && transfer.items.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Materialien:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {transfer.items.map((item, idx) => (
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {transfer.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleApprove(transfer.id)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Transfer genehmigen
                  </button>
                </div>
              )}

              {transfer.status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleComplete(transfer.id)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Transfer abschließen
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Neuer Material-Transfer</h2>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Von Projekt *
                  </label>
                  <select
                    required
                    value={formData.from_project_id}
                    onChange={(e) => setFormData({ ...formData, from_project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Projekt auswählen</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zu Projekt *
                  </label>
                  <select
                    required
                    value={formData.to_project_id}
                    onChange={(e) => setFormData({ ...formData, to_project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Projekt auswählen</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id} disabled={project.id === formData.from_project_id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bemerkungen
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Materialien</h3>
                  <button
                    type="button"
                    onClick={addTransferItem}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Material hinzufügen
                  </button>
                </div>

                <div className="space-y-3">
                  {transferItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <select
                            required
                            value={item.item_id}
                            onChange={(e) => updateTransferItem(index, 'item_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Material auswählen</option>
                            {items.map(material => (
                              <option key={material.id} value={material.id}>
                                {material.name} ({material.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex space-x-2">
                          <input
                            type="number"
                            required
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateTransferItem(index, 'quantity', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Menge"
                          />
                          {transferItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTransferItem(index)}
                              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Erstellen...' : 'Transfer erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
