import { getSupabase, Booking } from '@/lib/supabase'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ожидает', cls: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Подтверждено', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменено', cls: 'bg-red-100 text-red-800' },
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('T')[0].split('-')
  return `${day}.${month}.${year}`
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function getBookings(): Promise<Booking[]> {
  const { data, error } = await getSupabase()
    .from('bookings')
    .select('*, services(id, name, duration_minutes, price)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching bookings:', error)
    return []
  }
  return data ?? []
}

export const revalidate = 0

export default async function AdminPage() {
  const bookings = await getBookings()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Администратор</h1>
          <p className="text-gray-500 text-sm mt-1">
            Все заявки ({bookings.length})
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-400 text-sm">Заявок пока нет</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Имя</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Дата записи</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Услуга</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Статус</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-600">Создано</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  const st = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-gray-100 last:border-0 ${
                        i % 2 === 0 ? '' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {b.client_name}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{b.client_email}</td>
                      <td className="px-5 py-3 text-gray-700">
                        {formatDate(b.booking_date)}
                      </td>
                      <td className="px-5 py-3 text-gray-700">
                        {b.services?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {formatDateTime(b.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {bookings.map((b) => {
              const st = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900">{b.client_name}</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{b.client_email}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-500">
                      Дата: <span className="text-gray-800">{formatDate(b.booking_date)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{b.services?.name ?? '—'}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(b.created_at)}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
