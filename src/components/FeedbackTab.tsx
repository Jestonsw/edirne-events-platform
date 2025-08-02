import React from 'react'

interface Feedback {
  id: number
  type: string
  email?: string
  message: string
  isRead: boolean
  createdAt: string
}

interface FeedbackTabProps {
  feedback: Feedback[]
  onDelete: (id: number) => void
}

export default function FeedbackTab({ feedback, onDelete }: FeedbackTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Geri Bildirimler</h2>
        <div className="text-sm text-gray-600">
          Toplam: {feedback.length} mesaj
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Henüz geri bildirim yok</div>
          <div className="text-gray-500 text-sm">Kullanıcılar öneri ve şikayetlerini buradan görebilirsiniz</div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {feedback.map((item) => (
              <li key={item.id} className="px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'suggestion' ? 'bg-green-100 text-green-800' :
                        item.type === 'complaint' ? 'bg-red-100 text-red-800' :
                        item.type === 'bug' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.type === 'suggestion' ? 'Öneri' :
                         item.type === 'complaint' ? 'Şikayet' :
                         item.type === 'bug' ? 'Hata Bildirimi' :
                         'Diğer'}
                      </span>
                      {item.email && (
                        <span className="text-sm text-gray-600">{item.email}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('tr-TR')} - {new Date(item.createdAt).toLocaleTimeString('tr-TR')}
                      </span>
                    </div>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {item.message}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isRead ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.isRead ? 'Okundu' : 'Yeni'}
                    </span>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                      title="Geri bildirimi sil"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}