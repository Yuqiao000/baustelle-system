import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Package, Search, Plus, Edit, AlertTriangle, Grid3x3, List, Filter, Download, BarChart3, RefreshCw } from 'lucide-react'

export default function InventoryManagement() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [sortBy, setSortBy] = useState('name') // 'name', 'stock', 'category'

  useEffect(() => {
    loadItems()
    loadCategories()
  }, [typeFilter, showLowStock, categoryFilter])

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

  const loadCategories = async () => {
    try {
      const data = await api.getCategories()
      // Extract unique category names from the data
      const categoryNames = [...new Set(data.map(cat => cat.name))]
      setCategories(categoryNames)
    } catch (error) {
      console.error('Load categories error:', error)
      setCategories([]) // Set empty array on error to prevent crashes
    }
  }

  const filteredItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return parseFloat(a.stock_quantity) - parseFloat(b.stock_quantity)
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const isLowStock = (item) => {
    return parseFloat(item.stock_quantity) <= parseFloat(item.min_stock_level)
  }

  const stats = {
    total: items.length,
    lowStock: items.filter(isLowStock).length,
    materials: items.filter(item => item.type === 'material').length,
    machines: items.filter(item => item.type === 'maschine').length
  }

  const exportToCSV = () => {
    // Prepare CSV data
    const headers = ['Name', 'Typ', 'Kategorie', 'Beschreibung', 'Aktueller Bestand', 'Min. Bestand', 'Einheit', 'Status']
    const csvData = filteredItems.map(item => [
      item.name,
      item.type === 'material' ? 'Material' : 'Maschine',
      item.category || '',
      item.description || '',
      item.stock_quantity,
      item.min_stock_level,
      item.unit,
      isLowStock(item) ? 'Niedrig' : 'OK'
    ])

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `lagerbestand_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lagerbestand</h1>
          <p className="mt-1 text-gray-600">Verwalten Sie Materialien und Maschinen</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadItems}
            className="btn-secondary flex items-center"
            title="Aktualisieren"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={exportToCSV}
            className="btn-secondary flex items-center"
            disabled={filteredItems.length === 0}
          >
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Neues Element
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-white border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-white border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Materialien</p>
              <p className="text-2xl font-bold text-gray-900">{stats.materials}</p>
            </div>
            <Package className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-white border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Maschinen</p>
              <p className="text-2xl font-bold text-gray-900">{stats.machines}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-white border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niedriger Bestand</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filter & Suche</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Grid Ansicht"
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              title="Tabellen Ansicht"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Namen oder Beschreibung suchen..."
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

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">Alle Kategorien</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
          >
            <option value="name">Sortieren: Name</option>
            <option value="stock">Sortieren: Bestand</option>
            <option value="category">Sortieren: Kategorie</option>
          </select>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Nur niedrige Bestände anzeigen</span>
          </label>

          {(searchTerm || typeFilter || categoryFilter || showLowStock) && (
            <button
              onClick={() => {
                setSearchTerm('')
                setTypeFilter('')
                setCategoryFilter('')
                setShowLowStock(false)
              }}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Alle Filter zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredItems.length} {filteredItems.length === 1 ? 'Artikel' : 'Artikel'} gefunden
        </p>
      </div>

      {/* Items Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Keine Artikel gefunden</p>
          <p className="text-sm text-gray-500 mt-2">
            Versuchen Sie, die Filter anzupassen
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card transition-all hover:shadow-lg ${
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
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                      {item.type === 'material' ? 'Material' : 'Maschine'}
                    </span>
                    {item.category && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
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
                <div className="mt-4 p-2 bg-red-100 rounded text-xs text-red-700 font-medium flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Niedriger Bestand - Nachbestellen!
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bestand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min. Bestand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${isLowStock(item) ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                      {item.type === 'material' ? 'Material' : 'Maschine'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${isLowStock(item) ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stock_quantity} {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.min_stock_level} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isLowStock(item) ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Niedrig
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
