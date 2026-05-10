-- Выполните этот SQL в Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Таблица услуг
CREATE TABLE IF NOT EXISTS services (
  id               SERIAL PRIMARY KEY,
  name             TEXT        NOT NULL,
  duration_minutes INTEGER     NOT NULL,
  price            INTEGER     NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Таблица записей
CREATE TABLE IF NOT EXISTS bookings (
  id             SERIAL PRIMARY KEY,
  client_name    TEXT        NOT NULL,
  client_email   TEXT        NOT NULL,
  booking_date   DATE        NOT NULL,
  service_id     INTEGER     NOT NULL REFERENCES services(id),
  status         TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Индекс для быстрой сортировки заявок
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at DESC);

-- 4. Начальные данные услуг
INSERT INTO services (name, duration_minutes, price) VALUES
  ('Консультация 30 мин', 30, 1500),
  ('Консультация 60 мин', 60, 2500),
  ('Стратегическая сессия', 90, 4000);

-- 5. Row Level Security (разрешаем анонимный доступ для MVP)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Все могут читать услуги
CREATE POLICY "services_select_all" ON services FOR SELECT USING (true);

-- Все могут читать и создавать заявки (для MVP без авторизации)
CREATE POLICY "bookings_select_all" ON bookings FOR SELECT USING (true);
CREATE POLICY "bookings_insert_all" ON bookings FOR INSERT WITH CHECK (true);
