/*
  # E-Commerce Database Schema

  ## Overview
  This migration creates the complete database schema for the QuickCart e-commerce platform including users, products, addresses, and orders.

  ## New Tables

  ### `users`
  - `id` (text, primary key) - Clerk user ID
  - `email` (text, unique, not null)
  - `name` (text)
  - `image_url` (text)
  - `cart_items` (jsonb) - Stores cart items as {productId: quantity}
  - `created_at` (timestamptz)

  ### `products`
  - `id` (uuid, primary key)
  - `user_id` (text, foreign key to users)
  - `name` (text, not null)
  - `description` (text)
  - `price` (numeric)
  - `offer_price` (numeric)
  - `image` (jsonb) - Array of image URLs
  - `category` (text)
  - `created_at` (timestamptz)

  ### `addresses`
  - `id` (uuid, primary key)
  - `user_id` (text, foreign key to users)
  - `full_name` (text, not null)
  - `phone_number` (text, not null)
  - `pincode` (text, not null)
  - `area` (text, not null)
  - `city` (text, not null)
  - `state` (text, not null)
  - `created_at` (timestamptz)

  ### `orders`
  - `id` (uuid, primary key)
  - `user_id` (text, foreign key to users)
  - `items` (jsonb) - Array of order items with product details
  - `amount` (numeric, not null)
  - `address_id` (uuid, foreign key to addresses)
  - `status` (text, default 'Order Placed')
  - `payment_method` (text, default 'COD')
  - `payment_status` (text, default 'Pending')
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Authenticated users can create orders and addresses
  - Sellers can view orders for their products
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text,
  image_url text,
  cart_items jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  offer_price numeric(10,2) NOT NULL,
  image jsonb DEFAULT '[]'::jsonb,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  pincode text NOT NULL,
  area text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  amount numeric(10,2) NOT NULL,
  address_id uuid NOT NULL REFERENCES addresses(id),
  status text DEFAULT 'Order Placed',
  payment_method text DEFAULT 'COD',
  payment_status text DEFAULT 'Pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'sub' = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'sub' = id)
  WITH CHECK (auth.jwt()->>'sub' = id);

-- Products policies
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Sellers can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id);

-- Addresses policies
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id)
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'sub' = user_id);

CREATE POLICY "Sellers can view orders with their products"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM products p
      WHERE p.user_id = auth.jwt()->>'sub'
      AND p.id::text = ANY(
        SELECT jsonb_array_elements(items)->>'product_id'
        FROM orders o
        WHERE o.id = orders.id
      )
    )
  );
