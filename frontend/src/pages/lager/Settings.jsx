import { useState } from 'react'
import { Settings as SettingsIcon, Building2, Users, QrCode } from 'lucide-react'
import Projects from './Projects'
import Subcontractors from './Subcontractors'
import BarcodeGenerator from './BarcodeGenerator'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('projects')

  const tabs = [
    { id: 'projects', label: 'Projekte', icon: Building2 },
    { id: 'subcontractors', label: 'Subunternehmen', icon: Users },
    { id: 'qrcode', label: 'QR-Codes', icon: QrCode }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <SettingsIcon className="h-8 w-8 mr-3 text-blue-600" />
            Einstellungen
          </h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie Projekte, Subunternehmen und generieren Sie QR-Codes
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'projects' && <Projects />}
          {activeTab === 'subcontractors' && <Subcontractors />}
          {activeTab === 'qrcode' && <BarcodeGenerator />}
        </div>
      </div>
    </div>
  )
}
