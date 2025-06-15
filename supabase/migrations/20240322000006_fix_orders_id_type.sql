-- Fix the orders table to ensure id is TEXT type and not UUID
ALTER TABLE orders ALTER COLUMN id TYPE TEXT;

-- Make sure the id column accepts any string format
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE orders ADD PRIMARY KEY (id);
