import { useState, useEffect } from 'react'
import { Package, Search, Plus, Edit, Trash2, Tag, Image as ImageIcon, X } from 'lucide-react'

export default function MaterialManagement() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [showAliasModal, setShowAliasModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [newAlias, setNewAlias] = useState('')
  const [newImageUrl, setNewImageUrl] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadMaterials()
  }, [])

  const loadMaterials = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/items?is_active=true`)
      const data = await response.json()
      setMaterials(data)
    } catch (error) {
      console.error('Load materials error:', error)
      alert('Fehler beim Laden der Materialien')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (term) => {
    setSearchTerm(term)

    if (!term || term.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    try {
      setIsSearching(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/materials/search?q=${encodeURIComponent(term)}`
      )
      const data = await response.json()
      setSearchResults(data)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const loadMaterialDetail = async (itemId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/materials/${itemId}/detail`)
      const data = await response.json()
      setSelectedMaterial(data)
    } catch (error) {
      console.error('Load detail error:', error)
      alert('Fehler beim Laden der Details')
    }
  }

  const handleAddAlias = async () => {
    if (!newAlias.trim() || !selectedMaterial) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/materials/${selectedMaterial.id}/aliases`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alias: newAlias.trim() })
        }
      )

      if (response.ok) {
        setNewAlias('')
        loadMaterialDetail(selectedMaterial.id)
        alert('Alias erfolgreich hinzugefügt!')
      } else {
        const error = await response.json()
        alert('Fehler: ' + (error.detail || 'Unbekannter Fehler'))
      }
    } catch (error) {
      console.error('Add alias error:', error)
      alert('Fehler beim Hinzufügen des Alias')
    }
  }

  const handleDeleteAlias = async (aliasId) => {
    if (!confirm('Möchten Sie diesen Alias wirklich löschen?')) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/materials/${selectedMaterial.id}/aliases/${aliasId}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        loadMaterialDetail(selectedMaterial.id)
        alert('Alias gelöscht!')
      }
    } catch (error) {
      console.error('Delete alias error:', error)
      alert('Fehler beim Löschen')
    }
  }

  const handleAddImage = async () => {
    if (!newImageUrl.trim() || !selectedMaterial) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/materials/${selectedMaterial.id}/images`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: newImageUrl.trim(),
            is_primary: selectedMaterial.images.length === 0
          })
        }
      )

      if (response.ok) {
        setNewImageUrl('')
        loadMaterialDetail(selectedMaterial.id)
        alert('Bild erfolgreich hinzugefügt!')
      } else {
        alert('Fehler beim Hinzufügen des Bildes')
      }
    } catch (error) {
      console.error('Add image error:', error)
      alert('Fehler beim Hinzufügen')
    }
  }

  const displayMaterials = searchTerm && searchResults.length > 0 ? searchResults : materials

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Materialverwaltung</h1>
        <p className="mt-1 text-gray-600">
          Verwalten Sie Materialien, Aliase und Bilder
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="flex items-center gap-3">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Material suchen (Name, Barcode oder Alias)..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && <div className="text-sm text-gray-500">Suche...</div>}
        </div>

        {searchTerm && searchResults.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {searchResults.length} Ergebnisse gefunden
          </div>
        )}
      </div>

      {/* 材料列表 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Laden...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => loadMaterialDetail(material.id)}
            >
              <div className="flex items-start gap-4">
                <Package className="h-12 w-12 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 truncate">
                    {material.name}
                  </h3>
                  {material.barcode && (
                    <p className="text-sm text-gray-600 font-mono mt-1">
                      {material.barcode}
                    </p>
                  )}
                  {material.category_name && (
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      {material.category_name}
                    </span>
                  )}

                  {material.match_type && (
                    <div className="mt-2 text-xs text-gray-500">
                      Treffer: {material.match_type === 'exact_name' ? 'Exakter Name' :
                              material.match_type === 'exact_barcode' ? 'Exakter Barcode' :
                              material.match_type === 'exact_alias' ? 'Exakter Alias' :
                              material.match_type === 'fuzzy_name' ? 'Ähnlicher Name' :
                              'Ähnlicher Alias'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t-2 border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Bestand</p>
                  <p className="text-lg font-bold text-blue-600">
                    {material.current_stock || 0} {material.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Min-Stock</p>
                  <p className="text-lg font-bold text-orange-600">
                    {material.min_stock || 0} {material.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 材料详情模态框 */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{selectedMaterial.name}</h2>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Grundinformationen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Barcode</p>
                    <p className="font-mono font-semibold">{selectedMaterial.barcode || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Kategorie</p>
                    <p className="font-semibold">{selectedMaterial.category_name || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Aktueller Bestand</p>
                    <p className="font-semibold text-blue-600">
                      {selectedMaterial.current_stock} {selectedMaterial.unit}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600">Mindestbestand</p>
                    <p className="font-semibold text-orange-600">
                      {selectedMaterial.min_stock} {selectedMaterial.unit}
                    </p>
                  </div>
                </div>
              </div>

              {/* 别名管理 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Aliase ({selectedMaterial.aliases.length})
                  </h3>
                  <button
                    onClick={() => setShowAliasModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Alias hinzufügen
                  </button>
                </div>

                {selectedMaterial.aliases.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedMaterial.aliases.map((alias, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                      >
                        {alias}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Keine Aliase definiert</p>
                )}
              </div>

              {/* 图片管理 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Bilder ({selectedMaterial.images.length})
                  </h3>
                  <button
                    onClick={() => setShowImageModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Bild hinzufügen
                  </button>
                </div>

                {selectedMaterial.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMaterial.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.image_url}
                          alt={selectedMaterial.name}
                          className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                        />
                        {image.is_primary && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                            Hauptbild
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Keine Bilder hochgeladen</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 添加别名模态框 */}
      {showAliasModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Alias hinzufügen</h3>
            <input
              type="text"
              value={newAlias}
              onChange={(e) => setNewAlias(e.target.value)}
              placeholder="z.B. mufe, Kabelmuffe..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && handleAddAlias()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowAliasModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  handleAddAlias()
                  setShowAliasModal(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加图片模态框 */}
      {showImageModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Bild hinzufügen</h3>
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Bild-URL eingeben..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowImageModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  handleAddImage()
                  setShowImageModal(false)
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
