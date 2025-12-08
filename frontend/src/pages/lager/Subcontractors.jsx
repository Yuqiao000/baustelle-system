import { useState, useEffect } from 'react'
import { Users, Plus, Edit2, Trash2, Phone, Mail, Building } from 'lucide-react'
import api from '../../api/axios'

export default function Subcontractors() {
  const [subcontractors, setSubcontractors] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedSub, setSelectedSub] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, inactive
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    contact_person: '',
    phone: '',
    email: '',
    is_active: true
  })

  useEffect(() => {
    fetchSubcontractors()
  }, [filter])

  const fetchSubcontractors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'active') params.is_active = true
      if (filter === 'inactive') params.is_active = false

      const response = await api.get('/subcontractors', { params })
      setSubcontractors(response.data)
    } catch (error) {
      console.error('Error fetching subcontractors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedSub) {
        await api.patch(`/subcontractors/${selectedSub.id}`, formData)
      } else {
        await api.post('/subcontractors', formData)
      }
      await fetchSubcontractors()
      closeModal()
    } catch (error) {
      console.error('Error saving subcontractor:', error)
      alert('Fehler beim Speichern des Subunternehmers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (subId) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Subunternehmer deaktivieren möchten?')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/subcontractors/${subId}`)
      await fetchSubcontractors()
    } catch (error) {
      console.error('Error deleting subcontractor:', error)
      alert('Fehler beim Löschen des Subunternehmers')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (sub = null) => {
    if (sub) {
      setSelectedSub(sub)
      setFormData({
        name: sub.name,
        company_name: sub.company_name || '',
        contact_person: sub.contact_person || '',
        phone: sub.phone || '',
        email: sub.email || '',
        is_active: sub.is_active
      })
    } else {
      setSelectedSub(null)
      setFormData({
        name: '',
        company_name: '',
        contact_person: '',
        phone: '',
        email: '',
        is_active: true
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedSub(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Subunternehmer
          </h1>
          <p className="text-gray-600 mt-1">Verwaltung von Subunternehmern und externen Partnern</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neuer Subunternehmer
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
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Aktiv
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Inaktiv
        </button>
      </div>

      {/* Subcontractors Grid */}
      {loading && !showModal ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Lade Subunternehmer...</p>
        </div>
      ) : subcontractors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Subunternehmer gefunden</h3>
          <p className="text-gray-600 mb-4">Erstellen Sie einen neuen Subunternehmer</p>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Neuer Subunternehmer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subcontractors.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {sub.name}
                  </h3>
                  {sub.company_name && (
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Building className="h-4 w-4 mr-1" />
                      {sub.company_name}
                    </div>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    sub.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {sub.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {sub.contact_person && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{sub.contact_person}</span>
                  </div>
                )}
                {sub.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${sub.phone}`} className="hover:text-blue-600">
                      {sub.phone}
                    </a>
                  </div>
                )}
                {sub.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${sub.email}`} className="hover:text-blue-600 truncate">
                      {sub.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openModal(sub)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </button>
                {sub.is_active && (
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSub ? 'Subunternehmer bearbeiten' : 'Neuer Subunternehmer'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Müller GmbH Sub"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firmenname
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vollständiger Firmenname"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ansprechpartner
                </label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Name des Ansprechpartners"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+49 123 456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Subunternehmer ist aktiv
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Speichern...' : selectedSub ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
