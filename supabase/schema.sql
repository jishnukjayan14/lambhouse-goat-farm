-- =============================================
-- LAMBHOUSE GOAT FARM - Supabase Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- GOATS TABLE
-- =============================================
CREATE TABLE goats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  tag_number TEXT,
  breed TEXT NOT NULL CHECK (breed IN ('ajmeri', 'jamnabari', 'hyderabadi', 'malabari', 'beetal', 'mixed', 'other')),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  birth_date DATE,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  mother_id UUID REFERENCES goats(id),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'dead', 'transferred')),
  sold_date DATE,
  sold_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  product_type TEXT NOT NULL DEFAULT 'milk' CHECK (product_type IN ('milk', 'manure', 'both')),
  -- Milk defaults
  default_glasses INTEGER DEFAULT 1,
  milk_rate DECIMAL(10,2) DEFAULT 30.00,
  -- Manure defaults
  manure_type TEXT CHECK (manure_type IN ('raw', 'granules', 'powder', 'custom')),
  manure_unit TEXT DEFAULT 'bag',
  manure_rate DECIMAL(10,2),
  -- Billing
  advance_amount DECIMAL(10,2) DEFAULT 0,
  previous_balance DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MILK DELIVERIES TABLE
-- =============================================
CREATE TABLE milk_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  delivery_date DATE NOT NULL,
  quantity_glasses DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_ml DECIMAL(10,2) GENERATED ALWAYS AS (quantity_glasses * 200) STORED,
  rate_per_glass DECIMAL(10,2) NOT NULL DEFAULT 30.00,
  amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity_glasses * rate_per_glass) STORED,
  not_delivered BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id, delivery_date)
);

-- =============================================
-- MANURE SALES TABLE
-- =============================================
CREATE TABLE manure_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  buyer_name TEXT,
  sale_date DATE NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'raw' CHECK (product_type IN ('raw', 'granules', 'powder', 'custom')),
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'bag',
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) GENERATED ALWAYS AS (quantity * rate) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- EXPENSES TABLE
-- =============================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expense_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'medicine', 'labour', 'equipment', 'veterinary', 'transport', 'utilities', 'other')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GOAT HEALTH EVENTS TABLE
-- =============================================
CREATE TABLE goat_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('vaccination', 'treatment', 'deworming', 'weight_check', 'kidding', 'weaning', 'other')),
  event_date DATE NOT NULL,
  description TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  vet_name TEXT,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GOAT WEIGHTS TABLE
-- =============================================
CREATE TABLE goat_weights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goat_id UUID NOT NULL REFERENCES goats(id) ON DELETE CASCADE,
  weigh_date DATE NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INVOICES TABLE (for tracking sent invoices)
-- =============================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_type TEXT NOT NULL CHECK (invoice_type IN ('milk', 'manure', 'combined')),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  advance_deducted DECIMAL(10,2) DEFAULT 0,
  previous_balance DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'paid', 'partial')),
  paid_amount DECIMAL(10,2) DEFAULT 0,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- APP SETTINGS TABLE
-- =============================================
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (key, value) VALUES
  ('farm_name', 'The Lamb House Goat Farm'),
  ('farm_address', 'Mananthavady, Wayanad (Dist.) Kerala – 670645'),
  ('farm_phone1', '7306874214'),
  ('farm_phone2', '9061237526'),
  ('farm_phone3', '7902650760'),
  ('farm_upi', '7306874214-2@ybl'),
  ('milk_default_rate', '30'),
  ('milk_default_glasses', '1'),
  ('invoice_prefix', 'LH');

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE goats ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE manure_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE goat_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goat_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (shared login)
CREATE POLICY "Authenticated users can do everything" ON goats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON milk_deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON manure_sales FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON goat_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON goat_weights FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can do everything" ON app_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- Monthly milk revenue per customer
CREATE VIEW monthly_milk_summary AS
SELECT 
  c.id as customer_id,
  c.name as customer_name,
  EXTRACT(YEAR FROM md.delivery_date) as year,
  EXTRACT(MONTH FROM md.delivery_date) as month,
  COUNT(CASE WHEN NOT md.not_delivered THEN 1 END) as days_delivered,
  SUM(CASE WHEN NOT md.not_delivered THEN md.quantity_glasses ELSE 0 END) as total_glasses,
  SUM(CASE WHEN NOT md.not_delivered THEN md.amount ELSE 0 END) as total_amount
FROM customers c
LEFT JOIN milk_deliveries md ON c.id = md.customer_id
GROUP BY c.id, c.name, EXTRACT(YEAR FROM md.delivery_date), EXTRACT(MONTH FROM md.delivery_date);

-- Monthly expense summary by category
CREATE VIEW monthly_expense_summary AS
SELECT 
  EXTRACT(YEAR FROM expense_date) as year,
  EXTRACT(MONTH FROM expense_date) as month,
  category,
  SUM(amount) as total_amount,
  COUNT(*) as transaction_count
FROM expenses
GROUP BY EXTRACT(YEAR FROM expense_date), EXTRACT(MONTH FROM expense_date), category;
