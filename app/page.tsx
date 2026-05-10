'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase, Service } from '@/lib/supabase'

interface FormData {
  client_name: string
  client_email: string
  booking_date: string
  service_id: string
}

interface FormErrors {
  client_name?: string
  client_email?: string
  booking_date?: string
  service_id?: string
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4 text-white inline mr-2"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.client_name.trim()) errors.client_name = 'Введите ваше имя'
  if (!data.client_email.trim()) {
    errors.client_email = 'Введите email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.client_email)) {
    errors.client_email = 'Неверный формат email'
  }
  if (!data.booking_date) {
    errors.booking_date = 'Выберите дату'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selected = new Date(data.booking_date)
    if (selected < today) errors.booking_date = 'Нельзя выбрать прошедшую дату'
  }
  if (!data.service_id) errors.service_id = 'Выберите услугу'
  return errors
}

export default function HomePage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [form, setForm] = useState<FormData>({
    client_name: '',
    client_email: '',
    booking_date: '',
    service_id: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    getSupabase()
      .from('services')
      .select('*')
      .order('price', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setServices(data)
        setServicesLoading(false)
      })
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')

    const validationErrors = validate(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim(),
          booking_date: form.booking_date,
          service_id: Number(form.service_id),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error || 'Ошибка при записи. Попробуйте снова.')
        return
      }

      const service = services.find((s) => s.id === Number(form.service_id))
      const params = new URLSearchParams({
        name: form.client_name.trim(),
        date: form.booking_date,
        service: service?.name ?? '',
      })
      router.push(`/confirmation?${params.toString()}`)
    } catch {
      setServerError('Ошибка сети. Проверьте соединение и попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Запись на консультацию
        </h1>
        <p className="text-gray-500 text-base">
          Выберите удобное время, и я свяжусь с вами для подтверждения
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        {serverError && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Имя */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ваше имя <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="client_name"
              value={form.client_name}
              onChange={handleChange}
              placeholder="Иван Иванов"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.client_name
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.client_name && (
              <p className="mt-1 text-xs text-red-600">{errors.client_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="client_email"
              value={form.client_email}
              onChange={handleChange}
              placeholder="ivan@example.com"
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.client_email
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.client_email && (
              <p className="mt-1 text-xs text-red-600">{errors.client_email}</p>
            )}
          </div>

          {/* Дата */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="booking_date"
              value={form.booking_date}
              onChange={handleChange}
              min={todayStr}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.booking_date
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.booking_date && (
              <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>
            )}
          </div>

          {/* Услуга */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Услуга <span className="text-red-500">*</span>
            </label>
            <select
              name="service_id"
              value={form.service_id}
              onChange={handleChange}
              disabled={servicesLoading}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.service_id
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              } ${servicesLoading ? 'opacity-60' : ''}`}
            >
              <option value="">
                {servicesLoading ? 'Загрузка...' : 'Выберите услугу'}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.duration_minutes} мин / {s.price.toLocaleString('ru-RU')} ₽
                </option>
              ))}
            </select>
            {errors.service_id && (
              <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 text-sm transition-colors mt-2"
          >
            {submitting && <Spinner />}
            {submitting ? 'Отправка...' : 'Записаться'}
          </button>
        </form>
      </div>
    </div>
  )
}
