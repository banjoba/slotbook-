import Link from 'next/link'

interface SearchParams {
  name?: string
  date?: string
  service?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const [year, month, day] = dateStr.split('-')
  return `${day}.${month}.${year}`
}

export default async function ConfirmationPage({ searchParams }: Props) {
  const { name, date, service } = await searchParams

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Вы успешно записались!
        </h1>
        <p className="text-gray-500 mb-8">
          Мы свяжемся с вами для подтверждения записи
        </p>

        {/* Details */}
        <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Имя</span>
            <span className="font-medium text-gray-900">{name || '—'}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Дата</span>
            <span className="font-medium text-gray-900">{formatDate(date)}</span>
          </div>
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Услуга</span>
            <span className="font-medium text-gray-900">{service || '—'}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2.5 text-sm transition-colors"
        >
          Записаться ещё раз
        </Link>
      </div>
    </div>
  )
}
