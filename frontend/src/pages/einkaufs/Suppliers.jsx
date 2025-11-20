import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2, Star, Mail, Phone, MapPin, User } from 'lucide-react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    filterSuppliers()
  }, [searchTerm, suppliers])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call when backend is ready
      // For now, using mock data
      const mockSuppliers = [
        {
          id: 's1',
          name: 'Baumarkt Schmidt GmbH',
          contact_person: 'Hans Schmidt',
          email: 'schmidt@baumarkt.de',
          phone: '+49 30 12345678',
          address: 'Berliner Str. 123',
          city: 'Berlin',
          postal_code: '10115',
          rating: 5,
          is_active: true,
          notes: 'Zuverlässiger Lieferant für Baustoffe'
        },
        {
          id: 's2',
          name: 'Werkzeug Meyer AG',
          contact_person: 'Anna Meyer',
          email: 'meyer@werkzeug.de',
          phone: '+49 89 87654321',
          address: 'Münchner Weg 45',
          city: 'München',
          postal_code: '80331',
          rating: 5,
          is_active: true,
          notes: 'Spezialisiert auf Werkzeuge und Maschinen'
        },
        {
          id: 's3',
          name: 'Material Express',
          contact_person: 'Peter Wagner',
          email: 'wagner@material-express.de',
          phone: '+49 40 55566677',
          address: 'Hamburger Allee 67',
          city: 'Hamburg',
          postal_code: '20095',
          rating: 4,
          is_active: true,
          notes: 'Schnelle Lieferung, gute Preise'
        }
      ]
      setSuppliers(mockSuppliers)
    } catch (error) {
      console.error('Load suppliers error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSuppliers = () => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(term) ||
      supplier.city.toLowerCase().includes(term) ||
      (supplier.contact_person && supplier.contact_person.toLowerCase().includes(term))
    )
    setFilteredSuppliers(filtered)
  }

  const handleDelete = async (id) => {
    if (!confirm('Möchten Sie diesen Lieferanten wirklich löschen?')) {
      return
    }

    try {
      // TODO: Implement API call when backend is ready
      console.log('Delete supplier:', id)
      setSuppliers(suppliers.filter(s => s.id !== id))
    } catch (error) {
      console.error('Delete supplier error:', error)
      alert('Fehler beim Löschen des Lieferanten')
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lieferanten</h1>
          <p className="mt-1 text-gray-600">Alle Lieferanten verwalten</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Neuer Lieferant</span>
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Lieferant suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {filteredSuppliers.length} von {suppliers.length} Lieferanten
          </p>
        </div>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="card text-center py-12">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Lieferanten gefunden</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Versuchen Sie einen anderen Suchbegriff'
              : 'Fügen Sie Ihren ersten Lieferanten hinzu'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Lieferant hinzufügen</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
                  {renderStars(supplier.rating)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSupplier(supplier)
                      setShowAddModal(true)
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {supplier.contact_person && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{supplier.contact_person}</span>
                  </div>
                )}
                {supplier.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-blue-600">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-blue-600">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div>{supplier.address}</div>
                      <div>
                        {supplier.postal_code} {supplier.city}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {supplier.notes && (
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600 italic">{supplier.notes}</p>
                </div>
              )}

              {/* Status */}
              <div className="pt-3 border-t border-gray-200 mt-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    supplier.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {supplier.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal - Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingSupplier ? 'Lieferant bearbeiten' : 'Neuer Lieferant'}
              </h2>
              <p className="text-gray-600 mb-4">
                Formular wird in der nächsten Phase implementiert
              </p>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSupplier(null)
                }}
                className="btn-secondary"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
