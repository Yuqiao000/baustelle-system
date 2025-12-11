import React, { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, DollarSign, ArrowUpDown, Download, FileSpreadsheet, ChevronDown, ChevronRight } from 'lucide-react'
import FilterBar from '../../components/FilterBar'
import Pagination from '../../components/Pagination'
import { api } from '../../lib/api'

export default function MaterialienNew() {
  const [activeTab, setActiveTab] = useState('lagerbestand')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    projekt: null,
    sub: null,
    kategorie: null,
    zeitraum: '30days',
    status: 'all',
    lagerstand: 'all',
    search: ''
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const [totalItems, setTotalItems] = useState(0)

  // Data state
  const [materials, setMaterials] = useState([])
  const [movements, setMovements] = useState([])
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalValue: 0,
    pendingRequests: 0,
    lowStock: 0
  })

  // Collapsible groups state
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  useEffect(() => {
    loadData()
  }, [filters, currentPage, itemsPerPage, activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'lagerbestand':
          await loadMaterials()
          break
        case 'bewegungen':
          await loadMovements()
          break
        case 'anfragen':
          await loadRequests()
          break
        case 'statistik':
          await loadStatistics()
          break
      }
      await loadQuickStats()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildQueryParams = () => {
    const params = new URLSearchParams()
    params.append('page', currentPage)
    params.append('limit', itemsPerPage)

    if (filters.projekt) params.append('projekt_id', filters.projekt)
    if (filters.sub) params.append('sub_id', filters.sub)
    if (filters.kategorie) params.append('kategorie', filters.kategorie)
    if (filters.status !== 'all') params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)

    // Zeitraum handling
    const now = new Date()
    let startDate = null
    switch (filters.zeitraum) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30))
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }
    if (startDate) {
      params.append('start_date', startDate.toISOString())
    }

    return params.toString()
  }

  const loadMaterials = async () => {
    const query = buildQueryParams()
    const data = await api.request(`/items?${query}`)

    setMaterials(Array.isArray(data) ? data : data.items || [])
    setTotalItems(data.total || (Array.isArray(data) ? data.length : 0))
  }

  const loadMovements = async () => {
    const query = buildQueryParams()
    // Combine all incoming and outgoing records
    const [requestsData, returnsData, transfersData] = await Promise.all([
      api.request(`/requests?${query}`),
      api.request(`/returns?${query}`),
      api.request(`/transfers?${query}`)
    ])

    // Merge and label types
    const allMovements = [
      ...(requestsData.items || requestsData || []).map(r => ({ ...r, type: 'ausgang', typeLabel: 'Ausgang' })),
      ...(returnsData.items || returnsData || []).map(r => ({ ...r, type: 'rückgabe', typeLabel: 'Rückgabe' })),
      ...(transfersData.items || transfersData || []).map(t => ({ ...t, type: 'transfer', typeLabel: 'Transfer' }))
    ]

    // Sort by time
    allMovements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setMovements(allMovements)
    setTotalItems(allMovements.length)
  }

  const loadRequests = async () => {
    const query = buildQueryParams()
    const data = await api.request(`/requests?${query}`)

    setRequests(Array.isArray(data) ? data : data.items || [])
    setTotalItems(data.total || (Array.isArray(data) ? data.length : 0))
  }

  const loadStatistics = async () => {
    // Load statistics data
    const query = buildQueryParams()
    const data = await api.request(`/statistics?${query}`)
    // TODO: Process statistics data
  }

  const loadQuickStats = async () => {
    try {
      const data = await api.request('/dashboard/stats')
      setStats({
        totalMaterials: data.total_materials || 0,
        totalValue: data.total_value || 0,
        pendingRequests: data.pending_requests || 0,
        lowStock: data.low_stock_count || 0
      })
    } catch (error) {
      console.error('Error loading quick stats:', error)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleExport = async () => {
    try {
      const query = buildQueryParams()
      const response = await fetch(`/api/export/${activeTab}?${query}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Exportfehler. Bitte versuchen Sie es erneut.')
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items)
    setCurrentPage(1)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    const labels = {
      pending: 'Wartend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      completed: 'Abgeschlossen'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  // Group materials by base name (e.g., "Fähnchen" or "Rohrverbund")
  const groupMaterials = (materialsList) => {
    const groups = {}

    materialsList.forEach(material => {
      // Extract base name (before " - " or color indicators)
      let baseName = material.name

      // Check if name contains color or specification after a separator
      const separators = [' - ', ' Blau', ' Grün', ' Lila', ' Orange', ' Rot', ' Schwarz', ' Gelb', ' Weiß']
      for (const sep of separators) {
        if (material.name.includes(sep)) {
          baseName = material.name.split(sep)[0]
          break
        }
      }

      if (!groups[baseName]) {
        groups[baseName] = {
          baseName,
          items: [],
          totalQuantity: 0,
          totalValue: 0,
          minQuantity: 0,
          unit: material.unit,
          isLowStock: false
        }
      }

      groups[baseName].items.push(material)
      groups[baseName].totalQuantity += (material.stock_quantity || material.current_quantity || 0)
      groups[baseName].totalValue += ((material.stock_quantity || material.current_quantity || 0) * (material.unit_price || 0))
      groups[baseName].minQuantity += (material.min_stock_level || material.min_quantity || 0)

      if ((material.stock_quantity || material.current_quantity || 0) <= (material.min_stock_level || material.min_quantity || 0)) {
        groups[baseName].isLowStock = true
      }
    })

    return Object.values(groups)
  }

  const toggleGroup = (baseName) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(baseName)) {
      newExpanded.delete(baseName)
    } else {
      newExpanded.add(baseName)
    }
    setExpandedGroups(newExpanded)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materialien</h1>
          <p className="mt-1 text-sm text-gray-500">
            Zentrale Materialverwaltung mit Filter-Funktionen
          </p>
        </div>
      </div>


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamte Materialien</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalMaterials}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gesamtwert</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Wartende Anfragen</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Niedriger Bestand</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.lowStock}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onExport={handleExport}
        showExport={true}
      />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('lagerbestand')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lagerbestand'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Lagerbestand
            </button>
            <button
              onClick={() => setActiveTab('bewegungen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bewegungen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bewegungen
            </button>
            <button
              onClick={() => setActiveTab('anfragen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'anfragen'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Anfragen
            </button>
            <button
              onClick={() => setActiveTab('statistik')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'statistik'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Statistik
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Laden...</p>
            </div>
          ) : (
            <>
              {/* Lagerbestand Tab */}
              {activeTab === 'lagerbestand' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bestand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Einheit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Min. Bestand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupMaterials(materials).map((group) => {
                        const isExpanded = expandedGroups.has(group.baseName)
                        const hasMultipleItems = group.items.length > 1

                        return (
                          <React.Fragment key={group.baseName}>
                            {/* Group summary row */}
                            <tr
                              className={`${group.isLowStock ? 'bg-red-50' : ''} ${hasMultipleItems ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                              onClick={() => hasMultipleItems && toggleGroup(group.baseName)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {hasMultipleItems && (
                                    <div className="mr-2">
                                      {isExpanded ? (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                      ) : (
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {group.baseName}
                                      {hasMultipleItems && <span className="text-xs text-gray-500 ml-2">({group.items.length} Varianten)</span>}
                                    </div>
                                    {!hasMultipleItems && group.items[0].description && (
                                      <div className="text-sm text-gray-500">{group.items[0].description}</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-semibold">
                                  {hasMultipleItems ? group.totalQuantity.toFixed(1) : (group.items[0].stock_quantity || group.items[0].current_quantity || 0)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {group.unit || 'Stk'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {group.minQuantity || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {group.isLowStock ? (
                                  <span className="flex items-center text-red-600">
                                    <AlertTriangle className="h-4 w-4 mr-1" />
                                    Niedrig
                                  </span>
                                ) : (
                                  <span className="text-green-600">Ausreichend</span>
                                )}
                              </td>
                            </tr>

                            {/* Expanded detail rows */}
                            {hasMultipleItems && isExpanded && group.items.map((material) => {
                              const itemQuantity = material.stock_quantity || material.current_quantity || 0
                              const itemMinQuantity = material.min_stock_level || material.min_quantity || 0
                              const isItemLowStock = itemQuantity <= itemMinQuantity
                              const itemValue = itemQuantity * (material.unit_price || 0)

                              // Extract color/variant name
                              let variantName = material.name.replace(group.baseName, '').trim()
                              if (variantName.startsWith('-')) variantName = variantName.substring(1).trim()

                              return (
                                <tr key={material.id} className="bg-gray-50">
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="flex items-center pl-10">
                                      <div>
                                        <div className="text-sm text-gray-700">{variantName || material.name}</div>
                                        {material.description && (
                                          <div className="text-xs text-gray-500">{material.description}</div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-700">{itemQuantity}</div>
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {material.unit || 'Stk'}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {itemMinQuantity}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap">
                                    {isItemLowStock ? (
                                      <span className="flex items-center text-red-600 text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Niedrig
                                      </span>
                                    ) : (
                                      <span className="text-green-600 text-xs">Ausreichend</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </React.Fragment>
                        )
                      })}
                    </tbody>
                  </table>

                  {materials.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Keine Materialien gefunden</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bewegungen Tab */}
              {activeTab === 'bewegungen' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Material
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Menge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projekt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sub
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movements.map((movement, index) => (
                        <tr key={`${movement.type}-${movement.id}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(movement.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              movement.type === 'ausgang' ? 'bg-blue-100 text-blue-800' :
                              movement.type === 'rückgabe' ? 'bg-green-100 text-green-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {movement.typeLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {movement.item_name || movement.material_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-semibold ${
                              movement.type === 'ausgang' ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {movement.type === 'ausgang' ? '-' : '+'}{movement.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.project_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {movement.subcontractor_name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(movement.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {movements.length === 0 && (
                    <div className="text-center py-12">
                      <ArrowUpDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Keine Bewegungen gefunden</p>
                    </div>
                  )}
                </div>
              )}

              {/* Anfragen Tab */}
              {activeTab === 'anfragen' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Anfrage Nr.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Antragsteller
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Projekt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materialien
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{request.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.user_name || request.created_by}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.project_name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {request.items_count || 1} Material(ien)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {requests.length === 0 && (
                    <div className="text-center py-12">
                      <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Keine Anfragen gefunden</p>
                    </div>
                  )}
                </div>
              )}

              {/* Statistik Tab */}
              {activeTab === 'statistik' && (
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Statistiken</h3>
                  <p className="text-gray-500">Statistik-Ansicht wird bald verfügbar sein</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalItems > 0 && activeTab !== 'statistik' && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>
    </div>
  )
}
