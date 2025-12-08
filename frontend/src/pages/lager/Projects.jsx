import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Users, Calendar, FileText, Package } from 'lucide-react'
import api from '../../api/axios'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    project_number: '',
    description: '',
    start_date: '',
    end_date: '',
    bauleiter_id: '',
    is_active: true
  })
  const [bauleiterList, setBauleiterList] = useState([])
  const [filter, setFilter] = useState('all') // all, active, inactive

  useEffect(() => {
    fetchProjects()
    fetchBauleiterList()
  }, [filter])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter === 'active') params.is_active = true
      if (filter === 'inactive') params.is_active = false

      const response = await api.get('/projects', { params })
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBauleiterList = async () => {
    try {
      // Fetch users with bauleiter role
      const response = await api.get('/auth/users?role=bauleiter')
      setBauleiterList(response.data || [])
    } catch (error) {
      console.error('Error fetching bauleiter list:', error)
      setBauleiterList([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (selectedProject) {
        // Update existing project
        await api.patch(`/projects/${selectedProject.id}`, formData)
      } else {
        // Create new project
        await api.post('/projects', formData)
      }
      await fetchProjects()
      closeModal()
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Fehler beim Speichern des Projekts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Projekt deaktivieren möchten?')) {
      return
    }

    setLoading(true)
    try {
      await api.delete(`/projects/${projectId}`)
      await fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Fehler beim Löschen des Projekts')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (project = null) => {
    if (project) {
      setSelectedProject(project)
      setFormData({
        name: project.name,
        project_number: project.project_number || '',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        bauleiter_id: project.bauleiter_id || '',
        is_active: project.is_active
      })
    } else {
      setSelectedProject(null)
      setFormData({
        name: '',
        project_number: '',
        description: '',
        start_date: '',
        end_date: '',
        bauleiter_id: '',
        is_active: true
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedProject(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projekte</h1>
          <p className="text-gray-600 mt-1">Verwaltung aller Baustellen-Projekte</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Neues Projekt
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Alle Projekte
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Aktiv
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          Inaktiv
        </button>
      </div>

      {/* Projects Grid */}
      {loading && !showModal ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Lade Projekte...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Projekte gefunden</h3>
          <p className="text-gray-600">Erstellen Sie ein neues Projekt, um zu beginnen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.name}
                  </h3>
                  {project.project_number && (
                    <p className="text-sm text-gray-600">Nr: {project.project_number}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {project.is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                {project.bauleiter_name && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{project.bauleiter_name}</span>
                  </div>
                )}
                {project.start_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(project.start_date).toLocaleDateString('de-DE')}
                      {project.end_date && ` - ${new Date(project.end_date).toLocaleDateString('de-DE')}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => openModal(project)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Bearbeiten
                </button>
                {project.is_active && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedProject ? 'Projekt bearbeiten' : 'Neues Projekt'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projektname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. Neubau Bürogebäude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projektnummer
                </label>
                <input
                  type="text"
                  value={formData.project_number}
                  onChange={(e) => setFormData({ ...formData, project_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="z.B. PRJ-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Projektbeschreibung..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enddatum
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bauleiter
                </label>
                <select
                  value={formData.bauleiter_id}
                  onChange={(e) => setFormData({ ...formData, bauleiter_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Kein Bauleiter zugewiesen</option>
                  {bauleiterList.map((bauleiter) => (
                    <option key={bauleiter.id} value={bauleiter.id}>
                      {bauleiter.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Projekt ist aktiv
                </label>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Speichern...' : selectedProject ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
