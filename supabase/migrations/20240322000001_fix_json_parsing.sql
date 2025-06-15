-- Fix any potential JSON parsing issues in the orders table
-- This migration ensures that order_details is properly stored as JSONB

-- First, create a backup of the orders table
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- Update the orders table to ensure order_details is properly stored as JSONB
ALTER TABLE orders ALTER COLUMN order_details TYPE JSONB USING order_details::JSONB;

-- Add an index on the order_details column for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_details ON orders USING GIN (order_details);
