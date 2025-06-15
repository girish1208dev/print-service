CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT NOT NULL,
  photo_count INTEGER NOT NULL,
  is_express BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_price NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_details JSONB
);

alter publication supabase_realtime add table orders;
