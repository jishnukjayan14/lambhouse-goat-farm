import { createClient } from '@supabase/supabase-js';
import { getMonthDateRange } from './utils';
import type {
  Goat,
  Customer,
  MilkDelivery,
  ManureSale,
  Expense,
  GoatEvent,
  GoatEventType,
  Invoice,
  AppSettings,
} from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xplcldudxitijfkivuef.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_XVA4SXUPZgg0UfTetrDw1w_am6oN0Gk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database Type Definitions ───────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      goats: {
        Row: Goat;
        Insert: Omit<Goat, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Goat, 'id' | 'created_at' | 'updated_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>;
      };
      milk_deliveries: {
        Row: MilkDelivery;
        Insert: Omit<MilkDelivery, 'id' | 'created_at' | 'updated_at' | 'customer'>;
        Update: Partial<Omit<MilkDelivery, 'id' | 'created_at' | 'updated_at' | 'customer'>>;
      };
      manure_sales: {
        Row: ManureSale;
        Insert: Omit<ManureSale, 'id' | 'created_at' | 'updated_at' | 'customer'>;
        Update: Partial<Omit<ManureSale, 'id' | 'created_at' | 'updated_at' | 'customer'>>;
      };
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>;
      };
      goat_events: {
        Row: GoatEvent;
        Insert: Omit<GoatEvent, 'id' | 'created_at' | 'goat'>;
        Update: Partial<Omit<GoatEvent, 'id' | 'created_at' | 'goat'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'customer'>;
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'customer'>>;
      };
      app_settings: {
        Row: AppSettings;
        Insert: Omit<AppSettings, 'id' | 'updated_at'>;
        Update: Partial<Omit<AppSettings, 'id' | 'updated_at'>>;
      };
    };
  };
}

// ─── Helper Query Functions ───────────────────────────────────────────────────

/** Fetch all active customers */
export async function getActiveCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data as Customer[];
}

/** Fetch all customers */
export async function getAllCustomers() {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Customer[];
}

/** Fetch milk deliveries for a date */
export async function getMilkDeliveriesForDate(date: string) {
  const { data, error } = await supabase
    .from('milk_deliveries')
    .select('*, customer:customers(*)')
    .eq('date', date)
    .order('created_at');
  if (error) throw error;
  return data as (MilkDelivery & { customer: Customer })[];
}

/** Fetch milk deliveries for a month */
export async function getMilkDeliveriesForMonth(month: number, year: number) {
  const { startDate, endDate } = getMonthDateRange(month, year);
  const { data, error } = await supabase
    .from('milk_deliveries')
    .select('*, customer:customers(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date');
  if (error) throw error;
  return data as (MilkDelivery & { customer: Customer })[];
}

/** Upsert milk delivery (insert or update) */
export async function upsertMilkDelivery(
  delivery: Database['public']['Tables']['milk_deliveries']['Insert']
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { amount: _amt, ...payload } = delivery as typeof delivery & { amount?: number };
  const { data, error } = await supabase
    .from('milk_deliveries')
    .upsert(payload, { onConflict: 'customer_id,date' })
    .select()
    .single();
  if (error) {
    console.error('upsertMilkDelivery error:', error);
    throw error;
  }
  return data as MilkDelivery;
}

/** Fetch manure sales for a month */
export async function getManureSalesForMonth(month: number, year: number) {
  const { startDate, endDate } = getMonthDateRange(month, year);
  const { data, error } = await supabase
    .from('manure_sales')
    .select('*, customer:customers(*)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as (ManureSale & { customer?: Customer })[];
}

/** Add manure sale */
export async function addManureSale(
  sale: Database['public']['Tables']['manure_sales']['Insert']
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { amount: _amt, ...payload } = sale as typeof sale & { amount?: number };
  const { data, error } = await supabase
    .from('manure_sales')
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error('addManureSale error:', error);
    throw error;
  }
  return data as ManureSale;
}

/** Fetch expenses for a month */
export async function getExpensesForMonth(month: number, year: number) {
  const { startDate, endDate } = getMonthDateRange(month, year);
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Expense[];
}

/** Add or update expense */
export async function upsertExpense(
  expense: Database['public']['Tables']['expenses']['Insert'] & { id?: string }
) {
  const { id, ...rest } = expense as typeof expense & { id?: string };
  if (id) {
    const { data, error } = await supabase
      .from('expenses')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('upsertExpense update error:', error);
      throw error;
    }
    return data as Expense;
  } else {
    const { data, error } = await supabase
      .from('expenses')
      .insert(rest)
      .select()
      .single();
    if (error) {
      console.error('upsertExpense insert error:', error);
      throw error;
    }
    return data as Expense;
  }
}

/** Delete expense */
export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

/** Fetch all goats */
export async function getAllGoats() {
  const { data, error } = await supabase
    .from('goats')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((g: any) => ({
    ...g,
    status: g.status === 'dead' ? 'deceased' : g.status,
  })) as Goat[];
}

/** Fetch active goats */
export async function getActiveGoats() {
  const { data, error } = await supabase
    .from('goats')
    .select('*')
    .eq('status', 'active')
    .order('name');
  if (error) throw error;
  return (data || []).map((g: any) => ({
    ...g,
    status: g.status === 'dead' ? 'deceased' : g.status,
  })) as Goat[];
}

/** Upsert goat */
export async function upsertGoat(
  goat: (Partial<Goat> & { id: string }) | (Database['public']['Tables']['goats']['Insert'] & { id?: string })
) {
  const { id, ...rest } = goat as any;
  delete rest.father_id;
  // Sanitize empty strings to null for DATE and numeric columns
  if ('birth_date' in rest && (!rest.birth_date || rest.birth_date.trim() === '')) rest.birth_date = null;
  if ('purchase_date' in rest && (!rest.purchase_date || rest.purchase_date.trim() === '')) rest.purchase_date = null;
  if ('sold_date' in rest && (!rest.sold_date || rest.sold_date.trim() === '')) rest.sold_date = null;
  if ('tag_number' in rest && (!rest.tag_number || rest.tag_number.trim() === '')) rest.tag_number = null;
  if ('notes' in rest && (!rest.notes || rest.notes.trim() === '')) rest.notes = null;
  if ('purchase_price' in rest && (rest.purchase_price === '' || isNaN(rest.purchase_price))) rest.purchase_price = null;
  if ('status' in rest && rest.status === 'deceased') rest.status = 'dead';

  if (id) {
    const { data, error } = await supabase
      .from('goats')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('upsertGoat update error:', error);
      throw error;
    }
    return { ...data, status: data.status === 'dead' ? 'deceased' : data.status } as Goat;
  } else {
    const { data, error } = await supabase
      .from('goats')
      .insert(rest)
      .select()
      .single();
    if (error) {
      console.error('upsertGoat insert error:', error);
      throw error;
    }
    return { ...data, status: data.status === 'dead' ? 'deceased' : data.status } as Goat;
  }
}

/** Upsert customer */
export async function upsertCustomer(
  customer: (Partial<Customer> & { id: string }) | (Database['public']['Tables']['customers']['Insert'] & { id?: string })
) {
  const { id, ...rest } = customer as any;
  if ('phone' in rest && (!rest.phone || rest.phone.trim() === '')) rest.phone = null;
  if ('address' in rest && (!rest.address || rest.address.trim() === '')) rest.address = null;
  if ('notes' in rest && (!rest.notes || rest.notes.trim() === '')) rest.notes = null;

  if (id) {
    const { data, error } = await supabase
      .from('customers')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('upsertCustomer update error:', error);
      throw error;
    }
    return data as Customer;
  } else {
    const { data, error } = await supabase
      .from('customers')
      .insert(rest)
      .select()
      .single();
    if (error) {
      console.error('upsertCustomer insert error:', error);
      throw error;
    }
    return data as Customer;
  }
}

/** Fetch app settings */
export async function getAppSettings() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .single();
  if (error) throw error;
  return data as AppSettings;
}

/** Update app settings */
export async function updateAppSettings(
  settings: Partial<Omit<AppSettings, 'id' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('app_settings')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as AppSettings;
}

/** Fetch monthly revenue summary (last N months) */
export async function getMonthlyRevenueSummary(months: number = 6) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const { startDate, endDate } = getMonthDateRange(month, year);

    const [milkRes, manureRes, goatRes, expenseRes] = await Promise.all([
      supabase
        .from('milk_deliveries')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate)
        .eq('status', 'delivered'),
      supabase
        .from('manure_sales')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate),
      supabase
        .from('goats')
        .select('sold_price')
        .eq('status', 'sold')
        .gte('sold_date', startDate)
        .lte('sold_date', endDate),
      supabase
        .from('expenses')
        .select('amount')
        .gte('date', startDate)
        .lte('date', endDate),
    ]);

    const milkRevenue = (milkRes.data || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    );
    const manureRevenue = (manureRes.data || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    );
    const goatRevenue = (goatRes.data || []).reduce(
      (sum, r) => sum + (Number(r.sold_price) || 0),
      0
    );
    const totalExpenses = (expenseRes.data || []).reduce(
      (sum, r) => sum + (r.amount || 0),
      0
    );

    const totalRevenue = milkRevenue + manureRevenue + goatRevenue;

    results.push({
      month,
      year,
      milk_revenue: milkRevenue,
      manure_revenue: manureRevenue,
      goat_revenue: goatRevenue,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: totalRevenue - totalExpenses,
    });
  }

  return results;
}

/** Fetch all goat health events & reminders */
export async function getAllGoatEvents() {
  const { data, error } = await supabase
    .from('goat_events')
    .select('*, goat:goats(*)')
    .order('date', { ascending: false });
  if (error) {
    console.error('getAllGoatEvents error:', error);
    throw error;
  }
  return data as GoatEvent[];
}

/** Fetch upcoming events within next N days */
export async function getUpcomingGoatEvents(daysAhead: number = 7) {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + daysAhead);

  const todayStr = today.toISOString().split('T')[0];
  const futureStr = future.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('goat_events')
    .select('*, goat:goats(*)')
    .gte('date', todayStr)
    .lte('date', futureStr)
    .order('date', { ascending: true });

  if (error) {
    console.error('getUpcomingGoatEvents error:', error);
    throw error;
  }
  return data as GoatEvent[];
}

/** Upsert a goat event / reminder */
export async function upsertGoatEvent(event: {
  id?: string;
  goat_id: string;
  event_type: GoatEventType;
  date: string;
  description?: string | null;
  cost?: number | null;
  vet_name?: string | null;
  next_due_date?: string | null;
  notes?: string | null;
}) {
  const { id, ...payload } = event;
  if (id) {
    const { data, error } = await supabase
      .from('goat_events')
      .update(payload)
      .eq('id', id)
      .select('*, goat:goats(*)')
      .single();
    if (error) throw error;
    return data as GoatEvent;
  } else {
    const { data, error } = await supabase
      .from('goat_events')
      .insert(payload)
      .select('*, goat:goats(*)')
      .single();
    if (error) throw error;
    return data as GoatEvent;
  }
}

/** Delete a goat event */
export async function deleteGoatEvent(id: string) {
  const { error } = await supabase
    .from('goat_events')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

