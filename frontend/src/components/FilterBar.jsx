import { useState, useEffect } from 'react'
import { X, Filter, Download } from 'lucide-react'
import { api } from '../lib/api'

export default function FilterBar({ filters, onFilterChange, onExport, showExport = false }) {
  const [projects, setProjects] = useState([])
  const [subs, setSubs] = useState([])
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(true)

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      // 加载项目列表
      const projectsData = await api.request('/projects?is_active=true')
      setProjects(projectsData)

      // 加载 Subs 列表
      const subsData = await api.request('/subcontractors?is_active=true')
      setSubs(subsData)

      // 材料类别 - 可以从 API 获取或硬编码
      setCategories([
        { id: 'werkzeuge', name: 'Werkzeuge' },
        { id: 'baumaterialien', name: 'Baumaterialien' },
        { id: 'elektro', name: 'Elektro' },
        { id: 'sanitaer', name: 'Sanitär' },
        { id: 'other', name: 'Sonstige' }
      ])
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      projekt: null,
      sub: null,
      kategorie: null,
      zeitraum: '30days',
      status: 'all',
      lagerstand: 'all',
      search: ''
    })
  }

  const activeFilterCount = Object.values(filters).filter(v =>
    v && v !== 'all' && v !== '30days' && v !== ''
  ).length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filter</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
              {activeFilterCount} aktiv
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Exportieren</span>
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {showFilters ? 'Ausblenden' : 'Einblenden'}
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Projekt Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Projekt
              </label>
              <select
                value={filters.projekt || ''}
                onChange={(e) => handleFilterChange('projekt', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Projekte</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Sub Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subunternehmen
              </label>
              <select
                value={filters.sub || ''}
                onChange={(e) => handleFilterChange('sub', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Subs</option>
                {subs.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Kategorie Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategorie
              </label>
              <select
                value={filters.kategorie || ''}
                onChange={(e) => handleFilterChange('kategorie', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Kategorien</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Zeitraum Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zeitraum
              </label>
              <select
                value={filters.zeitraum}
                onChange={(e) => handleFilterChange('zeitraum', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Heute</option>
                <option value="week">Diese Woche</option>
                <option value="30days">Letzte 30 Tage</option>
                <option value="month">Dieser Monat</option>
                <option value="all">Alle</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle Status</option>
                <option value="pending">Wartend</option>
                <option value="approved">Genehmigt</option>
                <option value="rejected">Abgelehnt</option>
                <option value="completed">Abgeschlossen</option>
              </select>
            </div>

            {/* Lagerstand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lagerstand
              </label>
              <select
                value={filters.lagerstand}
                onChange={(e) => handleFilterChange('lagerstand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Alle</option>
                <option value="sufficient">Ausreichend</option>
                <option value="low">Niedrig</option>
                <option value="out">Nicht vorrätig</option>
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suche
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Material suchen..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Active Filters & Clear */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.projekt && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                    Projekt: {projects.find(p => p.id === filters.projekt)?.name}
                    <button
                      onClick={() => handleFilterChange('projekt', null)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.sub && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                    Sub: {subs.find(s => s.id === filters.sub)?.name}
                    <button
                      onClick={() => handleFilterChange('sub', null)}
                      className="ml-2 hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.kategorie && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                    {categories.find(c => c.id === filters.kategorie)?.name}
                    <button
                      onClick={() => handleFilterChange('kategorie', null)}
                      className="ml-2 hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Alle Filter löschen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
