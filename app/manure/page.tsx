"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getAllCustomers, addManureSale } from "@/lib/supabase";
import { formatCurrency, formatDate, getTodayString, getCurrentMonthYear, getMonthName, getMonthDateRange } from "@/lib/utils";
import { MANURE_TYPES } from "@/lib/constants";
import type { Customer, ManureSale, ManureType, ManureUnit } from "@/lib/types";
import { Plus, Filter } from "lucide-react";

const UNIT_OPTIONS: { value: ManureUnit; label: string }[] = [
  { value: "bag", label: "Bag (50kg)" },
  { value: "kg", label: "Kg" },
];

export default function ManurePage() {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<(ManureSale & { customer?: Customer })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterType, setFilterType] = useState<ManureType | "all">("all");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    date: getTodayString(),
    buyer_name: "",
    customer_id: "",
    product_type: "raw" as ManureType,
    quantity: 1,
    unit: "bag" as ManureUnit,
    rate: MANURE_TYPES.raw.default_rate,
    notes: "",
  });

  const amount = form.quantity * form.rate;

  useEffect(() => {
    getAllCustomers().then(setCustomers).catch(console.error);
  }, []);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getMonthDateRange(filterMonth, filterYear);
      const { data } = await supabase
        .from("manure_sales")
        .select("*, customer:customers(*)")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });
      setSales(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => { loadSales(); }, [loadSales]);

  const handleTypeChange = (type: ManureType) => {
    setForm(f => ({ ...f, product_type: type, rate: MANURE_TYPES[type].default_rate }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const cust = customers.find(c => c.id === customerId);
    setForm(f => ({
      ...f,
      customer_id: customerId,
      buyer_name: cust?.name || f.buyer_name,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addManureSale({
        date: form.date,
        buyer_name: form.buyer_name,
        customer_id: form.customer_id || null,
        product_type: form.product_type,
        quantity: form.quantity,
        unit: form.unit,
        rate: form.rate,
        amount,
        notes: form.notes || null,
      });
      setShowForm(false);
      setForm({
        date: getTodayString(),
        buyer_name: "",
        customer_id: "",
        product_type: "raw",
        quantity: 1,
        unit: "bag",
        rate: MANURE_TYPES.raw.default_rate,
        notes: "",
      });
      loadSales();
    } catch (err) {
      console.error(err);
      alert("Failed to save sale. Please try again.");
    }
  };

  const filteredSales = filterType === "all" ? sales : sales.filter(s => s.product_type === filterType);
  const totalRevenue = filteredSales.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manure Sales</h1>
          <p className="text-sm text-gray-500">Track manure sales and revenue</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Sale
        </button>
      </div>

      {/* Add Sale Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Record Manure Sale</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buyer (from customers)</label>
              <select value={form.customer_id} onChange={e => handleCustomerSelect(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                <option value="">Select customer or enter below</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Buyer Name</label>
              <input type="text" value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))}
                placeholder="Buyer name" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product Type</label>
              <select value={form.product_type} onChange={e => handleTypeChange(e.target.value as ManureType)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                {Object.entries(MANURE_TYPES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <input type="number" min={0.5} step={0.5} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseFloat(e.target.value) || 1 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value as ManureUnit }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                {UNIT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rate (Rs per unit)</label>
              <input type="number" min={0} value={form.rate} onChange={e => setForm(f => ({ ...f, rate: parseFloat(e.target.value) || 0 }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Amount</label>
              <div className="border border-gray-200 rounded-lg px-3 py-2 bg-green-50 text-sm font-semibold text-green-700">
                {formatCurrency(amount)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional notes" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div className="lg:col-span-3 flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit"
                className="px-6 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">Save Sale</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </select>
        <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          min={2020} max={2030} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
        <div className="flex gap-1.5">
          {["all", ...Object.keys(MANURE_TYPES)].map(type => (
            <button key={type} onClick={() => setFilterType(type as ManureType | "all")}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterType === type ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
              }`}>
              {type === "all" ? "All" : MANURE_TYPES[type as ManureType].label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm font-semibold text-green-700">
          Total: {formatCurrency(totalRevenue)}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Buyer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Rate</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({length: 4}).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3"><div className="h-5 rounded skeleton" /></td>
                </tr>
              ))
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No sales found for this period</td>
              </tr>
            ) : (
              filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatDate(sale.date)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{sale.buyer_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full text-xs font-medium">
                      {MANURE_TYPES[sale.product_type]?.label || sale.product_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{sale.quantity} {sale.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(sale.rate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(sale.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
          {!loading && filteredSales.length > 0 && (
            <tfoot>
              <tr className="bg-green-50 font-semibold">
                <td colSpan={5} className="px-4 py-3 text-green-800">Total ({filteredSales.length} sales)</td>
                <td className="px-4 py-3 text-right text-green-800">{formatCurrency(totalRevenue)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
