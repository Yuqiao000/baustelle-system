import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { api } from '../../lib/api'
import { Plus, Trash2, ArrowLeft, CheckCircle, Camera, Image as ImageIcon, X } from 'lucide-react'

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
    images: [],
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (files.length > 5) {
      alert('Maximal 5 Bilder hochladen')
      return
    }

    setSubmitting(true)
    const uploadFormData = new FormData()
    files.forEach(file => uploadFormData.append('files', file))

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/images`, {
        method: 'POST',
        body: uploadFormData
      })
      const data = await response.json()

      if (data.success && data.uploaded) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...data.uploaded]
        }))
        alert(`${data.success_count} Bild(er) erfolgreich hochgeladen`)
      } else {
        alert('Upload fehlgeschlagen')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload fehlgeschlagen')
    } finally {
      setSubmitting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
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

      const newRequest = await api.createRequest(requestData, user.id)

      // If images were uploaded, save them to the database
      if (formData.images.length > 0 && newRequest?.id) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL}/api/uploads/request-images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              request_id: newRequest.id,
              images: formData.images,
              user_id: user.id
            })
          })
        } catch (imgError) {
          console.error('Failed to save image references:', imgError)
          // Continue anyway - request was created successfully
        }
      }

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Plus className="h-8 w-8 text-blue-600" />
          Neuer Antrag
        </h1>
        <p className="text-gray-500 mb-8">Füllen Sie das Formular aus, um eine neue Materialanfrage zu erstellen</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Baustelle Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Baustelle *</label>
            <select
              value={formData.baustelle_id}
              onChange={(e) => setFormData({ ...formData, baustelle_id: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Benötigt am</label>
              <input
                type="date"
                value={formData.needed_date}
                onChange={(e) => setFormData({ ...formData, needed_date: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lieferzeit</label>
              <input
                type="text"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
                placeholder="z.B. 8-12 Uhr"
              />
            </div>
          </div>

          {/* Add Items Section */}
          <div className="border-t-2 border-gray-100 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Material / Maschinen hinzufügen</h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Material / Maschine</label>
                <select
                  value={currentItem.item_id}
                  onChange={(e) => setCurrentItem({ ...currentItem, item_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm font-medium"
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Menge</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm font-medium"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bemerkung</label>
                <input
                  type="text"
                  value={currentItem.notes}
                  onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm font-medium"
                  placeholder="Optional..."
                />
              </div>

              <div className="md:col-span-1">
                <button type="button" onClick={handleAddItem} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items List */}
            {formData.items.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Hinzugefügte Artikel:</h4>
                <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.item_name}</p>
                        <p className="text-sm text-gray-600">
                          Menge: <span className="font-bold text-blue-600">{item.quantity} {item.unit}</span>
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
              </div>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="border-t-2 border-gray-100 pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Camera className="inline h-5 w-5 mr-2" />
              Bilder hochladen (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Wenn Sie den Namen des Materials nicht wissen, laden Sie ein Bild hoch
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={submitting}
            />

            <label
              htmlFor="image-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 transition-all ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ImageIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">Bilder auswählen</span>
            </label>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Hochgeladene Bilder ({formData.images.length}/5):
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={img.filename}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                        {img.filename}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bemerkungen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 font-medium"
              rows="3"
              placeholder="Zusätzliche Hinweise..."
            ></textarea>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-xl shadow-md hover:bg-gray-300 hover:shadow-lg transition-all">
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={submitting || formData.items.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              {submitting ? 'Wird erstellt...' : 'Antrag einreichen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
