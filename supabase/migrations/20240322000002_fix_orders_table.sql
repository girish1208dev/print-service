-- Fix any potential issues with the orders table
-- Make sure the table exists with the correct structure
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_location TEXT NOT NULL,
  photo_count INTEGER NOT NULL,
  is_express BOOLEAN NOT NULL DEFAULT false,
  delivery_price NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_details JSONB
);

-- Make sure RLS is enabled but with an open policy
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
DROP POLICY IF EXISTS "Allow all operations on orders" ON orders;
CREATE POLICY "Allow all operations on orders"
  ON orders
  FOR ALL
  USING (true);
