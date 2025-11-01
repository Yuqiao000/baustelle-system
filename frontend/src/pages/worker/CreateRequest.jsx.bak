import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

export default function CreateRequest() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [baustellen, setBaustellen] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    baustelle_id: '',
    priority: 'normal',
    needed_date: '',
    delivery_time: '',
    notes: '',
    items: [],
  })

  const [currentItem, setCurrentItem] = useState({
    item_id: '',
    quantity: '',
    unit: '',
    notes: '',
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [baustellenData, itemsData] = await Promise.all([
        api.getBaustellen({ is_active: true }),
        api.getItems({ is_active: true }),
      ])
      setBaustellen(baustellenData)
      setItems(itemsData)
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!currentItem.item_id || !currentItem.quantity) {
      alert('Bitte wählen Sie ein Material/Maschine und geben Sie die Menge ein')
      return
    }

    const selectedItem = items.find((i) => i.id === currentItem.item_id)
    if (!selectedItem) return

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ...currentItem,
          unit: selectedItem.unit,
          item_name: selectedItem.name,
        },
      ],
    })

    setCurrentItem({
      item_id: '',
      quantity: '',
      unit: '',
      notes: '',
    })
  }

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.items.length === 0) {
      alert('Bitte fügen Sie mindestens ein Material/Maschine hinzu')
      return
    }

    if (!formData.baustelle_id) {
      alert('Bitte wählen Sie eine Baustelle aus')
      return
    }

    try {
      setSubmitting(true)

      const requestData = {
        baustelle_id: formData.baustelle_id,
        priority: formData.priority,
        needed_date: formData.needed_date || null,
        delivery_time: formData.delivery_time || null,
        notes: formData.notes || null,
        items: formData.items.map((item) => ({
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          notes: item.notes || null,
        })),
      }

      await api.createRequest(requestData, user.id)
      alert('Anfrage erfolgreich erstellt!')
      navigate('/worker/requests')
    } catch (error) {
      console.error('Create request error:', error)
      alert('Fehler beim Erstellen der Anfrage')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6 flex items-center">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Neue Anfrage erstellen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Baustelle Selection */}
          <div>
            <label className="label">Baustelle *</label>
            <select
              value={formData.baustelle_id}
              onChange={(e) => setFormData({ ...formData, baustelle_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Baustelle auswählen</option>
              {baustellen.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.city}
                </option>
              ))}
            </select>
          </div>

          {/* Priority and Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Priorität</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                <option value="low">Niedrig</option>
                <option value="normal">Normal</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>

            <div>
              <label className="label">Benötigt am</label>
              <input
                type="date"
                value={formData.needed_date}
                onChange={(e) => setFormData({ ...formData, needed_date: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Lieferzeit</label>
              <input
                type="text"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="input"
                placeholder="z.B. 8-12 Uhr"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Bemerkungen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Zusätzliche Hinweise..."
            ></textarea>
          </div>

          {/* Add Items Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Material / Maschinen hinzufügen</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="label">Material / Maschine</label>
                <select
                  value={currentItem.item_id}
                  onChange={(e) => setCurrentItem({ ...currentItem, item_id: e.target.value })}
                  className="input"
                >
                  <option value="">Auswählen...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type === 'material' ? 'Material' : 'Maschine'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="label">Menge</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-4">
                <label className="label">Bemerkung</label>
                <input
                  type="text"
                  value={currentItem.notes}
                  onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                  className="input"
                  placeholder="Optional..."
                />
              </div>

              <div className="md:col-span-1">
                <button type="button" onClick={handleAddItem} className="btn-primary w-full">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-6 space-y-2">
                <h4 className="font-medium text-gray-900">Hinzugefügte Artikel:</h4>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.item_name}</p>
                      <p className="text-sm text-gray-600">
                        Menge: {item.quantity} {item.unit}
                        {item.notes && ` - ${item.notes}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || formData.items.length === 0}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Wird erstellt...' : 'Anfrage erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
