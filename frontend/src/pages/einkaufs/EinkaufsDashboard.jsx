import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Package, TrendingUp, AlertTriangle, Users, FileText } from 'lucide-react'

export default function EinkaufsDashboard() {
  const [stats, setStats] = useState({
    pending_orders: 0,
    active_suppliers: 0,
    low_stock_items: 0,
    total_orders_this_month: 0
  })
  const [lowStockItems, setLowStockItems] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Implement API calls when backend is ready
      // For now, using mock data
      setStats({
        pending_orders: 5,
        active_suppliers: 12,
        low_stock_items: 8,
        total_orders_this_month: 23
      })

      setLowStockItems([
        { id: 1, name: 'Zement Portland', current_stock: 50, min_stock: 200, unit: 'Sack' },
        { id: 2, name: 'Bewehrungsstahl 10mm', current_stock: 15, min_stock: 50, unit: 'Stück' },
        { id: 3, name: 'Fähnchen - Rot', current_stock: 1, min_stock: 5, unit: 'Beutel' }
      ])

      setRecentOrders([
        { id: 1, order_number: 'PO-20250120-001', supplier: 'Baumarkt Schmidt', status: 'ordered', total: 1250.50 },
        { id: 2, order_number: 'PO-20250120-002', supplier: 'Werkzeug Meyer', status: 'shipping', total: 3400.00 },
        { id: 3, order_number: 'PO-20250119-003', supplier: 'Material Express', status: 'delivered', total: 890.25 }
      ])
    } catch (error) {
      console.error('Load dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      ordered: 'bg-blue-100 text-blue-700',
      shipping: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    }
    return badges[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusText = (status) => {
    const texts = {
      draft: 'Entwurf',
      ordered: 'Bestellt',
      shipping: 'Versand',
      delivered: 'Geliefert',
      cancelled: 'Storniert'
    }
    return texts[status] || status
  }

  const getStockLevel = (current, min) => {
    const ratio = current / min
    if (ratio <= 0) return { level: 'out_of_stock', color: 'red', text: 'Ausverkauft' }
    if (ratio < 0.5) return { level: 'critical', color: 'red', text: 'Kritisch' }
    if (ratio < 1) return { level: 'low', color: 'yellow', text: 'Niedrig' }
    return { level: 'normal', color: 'green', text: 'Normal' }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Einkaufs Dashboard</h1>
        <p className="mt-1 text-gray-600">Übersicht über Bestellungen, Lieferanten und Lagerbestände</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ausstehende Bestellungen</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.pending_orders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktive Lieferanten</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.active_suppliers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Niedrige Bestände</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.low_stock_items}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Diesen Monat</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.total_orders_this_month}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/einkaufs/orders/new"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all"
          >
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Neue Bestellung</p>
              <p className="text-sm text-gray-600">Bestellung erstellen</p>
            </div>
          </Link>

          <Link
            to="/einkaufs/suppliers"
            className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all"
          >
            <div className="p-2 bg-purple-600 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Lieferanten</p>
              <p className="text-sm text-gray-600">Verwalten</p>
            </div>
          </Link>

          <Link
            to="/einkaufs/orders"
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all"
          >
            <div className="p-2 bg-green-600 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Alle Bestellungen</p>
              <p className="text-sm text-gray-600">Anzeigen</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Niedrige Lagerbestände</h2>
            <Link to="/einkaufs/low-stock" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Alle anzeigen →
            </Link>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => {
                const stockLevel = getStockLevel(item.current_stock, item.min_stock)
                return (
                  <div
                    key={item.id}
                    className={`p-3 border-2 rounded-lg ${
                      stockLevel.color === 'red'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            stockLevel.color === 'red' ? 'text-red-600' : 'text-yellow-600'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            Aktuell: {item.current_stock} {item.unit} | Min: {item.min_stock} {item.unit}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          stockLevel.color === 'red'
                            ? 'bg-red-600 text-white'
                            : 'bg-yellow-600 text-white'
                        }`}
                      >
                        {stockLevel.text}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Alle Bestände sind ausreichend</p>
            </div>
          )}
        </div>

        {/* Recent Purchase Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Aktuelle Bestellungen</h2>
            <Link to="/einkaufs/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Alle anzeigen →
            </Link>
          </div>

          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/einkaufs/orders/${order.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{order.order_number}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{order.supplier}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        €{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Keine aktuellen Bestellungen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
