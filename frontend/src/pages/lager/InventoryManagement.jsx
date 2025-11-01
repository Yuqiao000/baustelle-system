import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Package, Search, Plus, Edit, AlertTriangle } from 'lucide-react'

export default function InventoryManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)

  useEffect(() => {
    loadItems()
  }, [typeFilter, showLowStock])

  const loadItems = async () => {
    try {
      setLoading(true)
      const params = { is_active: true }
      if (typeFilter) params.type = typeFilter
      if (showLowStock) params.low_stock = true

      const data = await api.getItems(params)
      setItems(data)
    } catch (error) {
      console.error('Load items error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isLowStock = (item) => {
    return parseFloat(item.stock_quantity) <= parseFloat(item.min_stock_level)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lagerbestand</h1>
          <p className="mt-1 text-gray-600">Verwalten Sie Materialien und Maschinen</p>
        </div>
        <button className="btn-primary flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Neues Element
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Namen suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input"
          >
            <option value="">Alle Typen</option>
            <option value="material">Material</option>
            <option value="maschine">Maschine</option>
          </select>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Nur niedrige Bestände</span>
          </label>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Keine Artikel gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card ${
                isLowStock(item) ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {isLowStock(item) && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                    {item.type === 'material' ? 'Material' : 'Maschine'}
                  </span>
                </div>
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded">
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Aktueller Bestand:</span>
                  <span className={`font-medium ${isLowStock(item) ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stock_quantity} {item.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min. Bestand:</span>
                  <span className="font-medium text-gray-900">
                    {item.min_stock_level} {item.unit}
                  </span>
                </div>
              </div>

              {isLowStock(item) && (
                <div className="mt-4 p-2 bg-red-100 rounded text-xs text-red-700 font-medium">
                  Niedriger Bestand - Nachbestellen!
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
