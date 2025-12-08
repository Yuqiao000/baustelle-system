import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageMinus, Plus, Trash2, AlertCircle } from 'lucide-react'
import api from '../../api/axios'
import { useAuthStore } from '../../store/authStore'

export default function CreateReturn() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [projects, setProjects] = useState([])
  const [returnItems, setReturnItems] = useState([{
    item_id: '',
    quantity: '',
    condition: 'good',
    notes: ''
  }])
  const [formData, setFormData] = useState({
    project_id: '',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    fetchItems()
    fetchProjects()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await api.get('/items')
      setItems(response.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects?is_active=true')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const addReturnItem = () => {
    setReturnItems([...returnItems, {
      item_id: '',
      quantity: '',
      condition: 'good',
      notes: ''
    }])
  }

  const removeReturnItem = (index) => {
    if (returnItems.length > 1) {
      setReturnItems(returnItems.filter((_, i) => i !== index))
    }
  }

  const updateReturnItem = (index, field, value) => {
    const updated = [...returnItems]
    updated[index][field] = value
    setReturnItems(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate return items
    const validItems = returnItems.filter(item => item.item_id && item.quantity > 0)
    if (validItems.length === 0) {
      alert('Bitte fügen Sie mindestens ein Material hinzu')
      return
    }

    setLoading(true)
    try {
      const requestData = {
        ...formData,
        worker_id: user.id,
        items: validItems.map(item => ({
          item_id: item.item_id,
          quantity: parseFloat(item.quantity),
          condition: item.condition,
          notes: item.notes || null
        }))
      }

      await api.post('/returns', requestData)
      alert('Rückgabe-Anfrage erfolgreich erstellt')
      navigate('/worker/returns')
    } catch (error) {
      console.error('Error creating return:', error)
      alert('Fehler beim Erstellen der Rückgabe-Anfrage')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <PackageMinus className="h-8 w-8 mr-3 text-blue-600" />
          Materialrückgabe erstellen
        </h1>
        <p className="text-gray-600 mt-2">Füllen Sie das Formular aus, um Material zurückzugeben</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Allgemeine Informationen</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projekt
              </label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Optional - Projekt auswählen</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rückgabegrund
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Grund auswählen</option>
                <option value="nicht_mehr_benötigt">Nicht mehr benötigt</option>
                <option value="überschuss">Überschuss</option>
                <option value="defekt">Defekt</option>
                <option value="falsch_bestellt">Falsch bestellt</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bemerkungen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Zusätzliche Bemerkungen zur Rückgabe..."
            />
          </div>
        </div>

        {/* Return Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Materialien</h2>
            <button
              type="button"
              onClick={addReturnItem}
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Material hinzufügen
            </button>
          </div>

          <div className="space-y-4">
            {returnItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Material {index + 1}</span>
                  {returnItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeReturnItem(index)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Material *
                    </label>
                    <select
                      value={item.item_id}
                      onChange={(e) => updateReturnItem(index, 'item_id', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Material auswählen</option>
                      {items.map(material => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Menge *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateReturnItem(index, 'quantity', e.target.value)}
                      required
                      min="0.01"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Zustand
                    </label>
                    <select
                      value={item.condition}
                      onChange={(e) => updateReturnItem(index, 'condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="good">Gut</option>
                      <option value="damaged">Beschädigt</option>
                      <option value="defective">Defekt</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Bemerkungen
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => updateReturnItem(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-start p-3 bg-blue-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Hinweis: Nach dem Absenden wird Ihre Rückgabe-Anfrage vom Lager überprüft und genehmigt.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/worker/returns')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : 'Rückgabe erstellen'}
          </button>
        </div>
      </form>
    </div>
  )
}
