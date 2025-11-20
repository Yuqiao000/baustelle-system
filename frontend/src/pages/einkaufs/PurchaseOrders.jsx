import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, Download, FileText } from 'lucide-react'

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const loadOrders = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call when backend is ready
      // For now, using mock data
      const mockOrders = [
        {
          id: '1',
          order_number: 'PO-20250120-001',
          supplier: { name: 'Baumarkt Schmidt GmbH', id: 's1' },
          status: 'ordered',
          total_amount: 1250.50,
          ordered_at: '2025-01-20T10:30:00Z',
          expected_delivery_date: '2025-01-25',
          item_count: 5,
          total_quantity: 150
        },
        {
          id: '2',
          order_number: 'PO-20250120-002',
          supplier: { name: 'Werkzeug Meyer AG', id: 's2' },
          status: 'shipping',
          total_amount: 3400.00,
          ordered_at: '2025-01-20T14:15:00Z',
          expected_delivery_date: '2025-01-24',
          item_count: 8,
          total_quantity: 320
        },
        {
          id: '3',
          order_number: 'PO-20250119-003',
          supplier: { name: 'Material Express', id: 's3' },
          status: 'delivered',
          total_amount: 890.25,
          ordered_at: '2025-01-19T09:00:00Z',
          expected_delivery_date: '2025-01-23',
          actual_delivery_date: '2025-01-22',
          item_count: 3,
          total_quantity: 75
        },
        {
          id: '4',
          order_number: 'PO-20250118-001',
          supplier: { name: 'Baumarkt Schmidt GmbH', id: 's1' },
          status: 'draft',
          total_amount: 0,
          item_count: 0,
          total_quantity: 0
        }
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error('Load orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.order_number.toLowerCase().includes(term) ||
        order.supplier.name.toLowerCase().includes(term)
      )
    }

    setFilteredOrders(filtered)
  }

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      ordered: 'bg-blue-100 text-blue-700 border-blue-300',
      shipping: 'bg-purple-100 text-purple-700 border-purple-300',
      delivered: 'bg-green-100 text-green-700 border-green-300',
      cancelled: 'bg-red-100 text-red-700 border-red-300'
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
          <h1 className="text-3xl font-bold text-gray-900">Bestellungen</h1>
          <p className="mt-1 text-gray-600">Alle Einkaufsbestellungen verwalten</p>
        </div>
        <Link
          to="/einkaufs/orders/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Neue Bestellung</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Bestellung oder Lieferant suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="all">Alle Status</option>
              <option value="draft">Entwurf</option>
              <option value="ordered">Bestellt</option>
              <option value="shipping">Versand</option>
              <option value="delivered">Geliefert</option>
              <option value="cancelled">Storniert</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredOrders.length} von {orders.length} Bestellungen
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Bestellungen gefunden</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Versuchen Sie einen anderen Suchbegriff oder Filter'
                : 'Erstellen Sie Ihre erste Bestellung'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link to="/einkaufs/orders/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Neue Bestellung erstellen</span>
              </Link>
            )}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Link
              key={order.id}
              to={`/einkaufs/orders/${order.id}`}
              className="card hover:border-primary-300 hover:shadow-md transition-all block"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Lieferant: <span className="font-medium">{order.supplier.name}</span>
                  </p>
                  {order.ordered_at && (
                    <p className="text-xs text-gray-500">
                      Bestellt am: {new Date(order.ordered_at).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Order Details */}
                <div className="flex flex-col md:flex-row gap-6 md:items-center">
                  {/* Items */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{order.item_count}</p>
                    <p className="text-xs text-gray-600">Artikel</p>
                  </div>

                  {/* Quantity */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{order.total_quantity}</p>
                    <p className="text-xs text-gray-600">Menge</p>
                  </div>

                  {/* Total Amount */}
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      €{order.total_amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">Gesamt</p>
                  </div>

                  {/* Delivery Date */}
                  <div className="text-center min-w-[120px]">
                    {order.actual_delivery_date ? (
                      <>
                        <p className="text-sm font-semibold text-green-600">
                          {new Date(order.actual_delivery_date).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-xs text-gray-600">Geliefert</p>
                      </>
                    ) : order.expected_delivery_date ? (
                      <>
                        <p className="text-sm font-semibold text-blue-600">
                          {new Date(order.expected_delivery_date).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-xs text-gray-600">Erwartet</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-500">Kein Datum</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
