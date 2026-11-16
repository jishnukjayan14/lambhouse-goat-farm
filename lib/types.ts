// TypeScript interfaces for Lambhouse Goat Farm Management App

export type GoatBreed = 'ajmeri' | 'jamnabari' | 'hyderabadi' | 'malabari' | 'beetal' | 'mixed' | 'other';
export type GoatSex = 'male' | 'female';
export type GoatStatus = 'active' | 'sold' | 'deceased' | 'transferred';
export type ProductType = 'milk' | 'manure' | 'both';
export type ManureType = 'raw' | 'granules' | 'powder' | 'custom';
export type ManureUnit = 'bag' | 'kg';
export type DeliveryStatus = 'delivered' | 'not_delivered' | 'holiday';

export interface Goat {
  id: string;
  name: string;
  tag_number: string | null;
  breed: GoatBreed;
  sex: GoatSex;
  birth_date: string | null; // ISO date string
  status: GoatStatus;
  mother_id: string | null;
  father_id?: string | null;
  purchase_price: number | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  product_type: ProductType;
  default_glasses: number; // default milk quantity in glasses
  milk_rate: number; // ₹ per glass
  manure_type: ManureType | null;
  manure_rate: number | null;
  advance_amount: number;
  previous_balance: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilkDelivery {
  id: string;
  customer_id: string;
  date: string; // ISO date string YYYY-MM-DD
  glasses: number;
  rate: number; // ₹ per glass
  amount: number; // glasses * rate
  status: DeliveryStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  customer?: Customer;
}

export interface ManureSale {
  id: string;
  date: string; // ISO date string
  buyer_name: string;
  customer_id: string | null;
  product_type: ManureType;
  quantity: number;
  unit: ManureUnit;
  rate: number; // ₹ per unit
  amount: number; // quantity * rate
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  customer?: Customer;
}

export type ExpenseCategory =
  | 'feed'
  | 'medicine'
  | 'veterinary'
  | 'labor'
  | 'equipment'
  | 'transport'
  | 'utilities'
  | 'miscellaneous';

export interface Expense {
  id: string;
  date: string; // ISO date string
  category: ExpenseCategory;
  amount: number;
  description: string;
  vendor: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export type GoatEventType =
  | 'birth'
  | 'purchase'
  | 'sale'
  | 'death'
  | 'vaccination'
  | 'deworming'
  | 'breeding'
  | 'kidding'
  | 'weight_check'
  | 'other';

export interface GoatEvent {
  id: string;
  goat_id: string;
  event_type: GoatEventType;
  date: string; // ISO date string
  description: string;
  amount: number | null;
  related_goat_id: string | null;
  created_at: string;
  // joined
  goat?: Goat;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_type: 'milk' | 'manure';
  month: number; // 1-12
  year: number;
  subtotal: number;
  advance_deduction: number;
  previous_balance: number;
  grand_total: number;
  status: 'draft' | 'sent' | 'paid';
  generated_at: string;
  created_at: string;
  // joined
  customer?: Customer;
}

export interface AppSettings {
  id: string;
  farm_name: string;
  address: string;
  phone1: string;
  phone2: string | null;
  phone3: string | null;
  upi_id: string;
  default_milk_rate: number;
  default_manure_raw_rate: number;
  default_manure_granules_rate: number;
  default_manure_powder_rate: number;
  partner1_name: string;
  partner2_name: string | null;
  partner3_name: string | null;
  updated_at: string;
}

export interface MonthlyMilkSummary {
  customer_id: string;
  customer_name: string;
  month: number;
  year: number;
  total_days: number;
  delivered_days: number;
  total_glasses: number;
  total_amount: number;
  rate: number;
}

export interface MonthlyExpenseSummary {
  category: ExpenseCategory;
  month: number;
  year: number;
  total_amount: number;
  count: number;
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  milk_revenue: number;
  manure_revenue: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
}

export interface DailyMilkData {
  date: string;
  total_glasses: number;
  total_amount: number;
}

// For PDF invoice generation
export interface InvoiceLineItem {
  date: string;
  display_date: string;
  glasses: number;
  rate: number;
  amount: number;
  status: DeliveryStatus;
}

export interface InvoiceData {
  invoice_number: string;
  customer: Customer;
  month: number;
  year: number;
  line_items: InvoiceLineItem[];
  subtotal: number;
  advance_deduction: number;
  previous_balance: number;
  grand_total: number;
}
