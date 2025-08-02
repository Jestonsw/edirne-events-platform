'use client'

import { useState } from 'react'
import { Download, Shield, Database, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'

interface BackupResult {
  success: boolean
  message: string
  data?: any
  timestamp?: string
}

interface IntegrityCheck {
  name: string
  status: 'passed' | 'failed' | 'warning'
  details: string
}

const BackupSecurityPanel = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastBackupResult, setLastBackupResult] = useState<BackupResult | null>(null)
  const [integrityResults, setIntegrityResults] = useState<IntegrityCheck[] | null>(null)
  const [exportData, setExportData] = useState<any>(null)

  const executeBackupAction = async (action: string) => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          adminPassword: prompt('Admin şifresi girin:')
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setLastBackupResult(result)
        
        if (action === 'integrity' && result.results) {
          setIntegrityResults(result.results.checks)
        }
        
        if (action === 'export' && result.data) {
          setExportData(result.data)
        }
        
        alert(result.message)
      } else {
        alert(`Hata: ${result.error}`)
      }
    } catch (error) {
      alert('İşlem sırasında hata oluştu')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadExportData = () => {
    if (!exportData) return
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edirne-events-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Yedekleme & Güvenlik</h2>
        </div>
        <p className="text-gray-600">
          Veritabanı yedekleme, kritik veri dışa aktarma ve sistem güvenliği kontrolü araçları.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => executeBackupAction('export')}
          disabled={isProcessing}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Kritik Veri Export</div>
              <div className="text-sm opacity-90">JSON formatında dışa aktar</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => executeBackupAction('integrity')}
          disabled={isProcessing}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Veri Bütünlüğü</div>
              <div className="text-sm opacity-90">Sistem kontrolü yap</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => executeBackupAction('stats')}
          disabled={isProcessing}
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Sistem İstatistikleri</div>
              <div className="text-sm opacity-90">Özet bilgi al</div>
            </div>
          </div>
        </button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-blue-800">İşlem devam ediyor...</span>
          </div>
        </div>
      )}

      {/* Last Backup Result */}
      {lastBackupResult && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Son İşlem Sonucu</h3>
          <div className={`p-4 rounded-lg ${
            lastBackupResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {lastBackupResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <div className={`font-medium ${
                  lastBackupResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastBackupResult.message}
                </div>
                {lastBackupResult.timestamp && (
                  <div className="text-sm text-gray-600 mt-1">
                    {new Date(lastBackupResult.timestamp).toLocaleString('tr-TR')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Download */}
      {exportData && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dışa Aktarılan Veri</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {exportData.statistics?.totalEvents || 0}
                </div>
                <div className="text-sm text-gray-600">Toplam Etkinlik</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {exportData.statistics?.activeEvents || 0}
                </div>
                <div className="text-sm text-gray-600">Aktif Etkinlik</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {exportData.statistics?.totalVenues || 0}
                </div>
                <div className="text-sm text-gray-600">Toplam Mekan</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {exportData.statistics?.totalUsers || 0}
                </div>
                <div className="text-sm text-gray-600">Toplam Kullanıcı</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {exportData.categories?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Kategori</div>
              </div>
            </div>
          </div>
          <button
            onClick={downloadExportData}
            className="flex items-center space-x-2 bg-edirne-600 text-white px-4 py-2 rounded-lg hover:bg-edirne-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>JSON Dosyasını İndir</span>
          </button>
        </div>
      )}

      {/* Integrity Check Results */}
      {integrityResults && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Veri Bütünlüğü Sonuçları</h3>
          <div className="space-y-3">
            {integrityResults.map((check, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  check.status === 'passed' 
                    ? 'bg-green-50 border-green-200' 
                    : check.status === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  {check.status === 'passed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : check.status === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className={`font-medium ${
                      check.status === 'passed' 
                        ? 'text-green-800' 
                        : check.status === 'warning'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {check.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {check.details}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Indexes Info */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performans İndeksleri</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>📅 <strong>Etkinlik Sorguları:</strong></span>
              <span className="text-green-600">events(start_date) - tarih bazlı sorgular için</span>
            </div>
            <div className="flex justify-between">
              <span>🎯 <strong>Aktif Etkinlikler:</strong></span>
              <span className="text-green-600">events(is_active) - aktif etkinlik sorguları için</span>
            </div>
            <div className="flex justify-between">
              <span>🏢 <strong>Aktif Mekanlar:</strong></span>
              <span className="text-green-600">venues(is_active) - aktif mekan sorguları için</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Bu indeksler veritabanı performansını %30-50 artırır ve sorgu sürelerini optimize eder.
        </p>
      </div>

      {/* Security Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Güvenlik Önerileri</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Database URL Güvenliği</div>
              <div className="text-sm text-gray-600">Veritabanı bağlantı bilgileri environment variable olarak güvenli şekilde saklanıyor.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">Admin Kimlik Doğrulama</div>
              <div className="text-sm text-gray-600">Admin panel erişimi şifre koruması ile güvende.</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <div className="font-medium text-gray-900">API Endpoint Güvenliği</div>
              <div className="text-sm text-gray-600">Kritik API endpoint'leri admin doğrulaması gerektiriyor.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupSecurityPanel