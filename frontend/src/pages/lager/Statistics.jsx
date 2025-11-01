import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BarChart3, TrendingUp, Package } from 'lucide-react'

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    loadStatistics()
  }, [selectedMonth, selectedYear])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const data = await api.getMonthlyStats(selectedYear, selectedMonth)
      setStats(data)
    } catch (error) {
      console.error('Load statistics error:', error)
    } finally {
      setLoading(false)
    }
  }

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiken</h1>
        <p className="mt-1 text-gray-600">Analysieren Sie Materialverbrauch und Anfragen</p>
      </div>

      {/* Date Selection */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Zeitraum:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input w-auto"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>
                {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input w-auto"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt Anfragen</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.total_requests || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehend</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending_requests || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Abgeschlossen</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed_requests || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Material Usage */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Materialverbrauch</h2>

        {stats?.material_usage && stats.material_usage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    Material / Maschine
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Gesamtmenge
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    Anzahl Anfragen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.material_usage.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.total_quantity} {item.unit}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {item.request_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Keine Daten für diesen Zeitraum</p>
          </div>
        )}
      </div>
    </div>
  )
}
