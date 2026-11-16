"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getExpensesForMonth, upsertExpense, deleteExpense } from "@/lib/supabase";
import { formatCurrency, formatDate, getTodayString, getCurrentMonthYear, getMonthName } from "@/lib/utils";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CATEGORIES = Object.entries(EXPENSE_CATEGORIES);

export default function ExpensesPage() {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [filterMonth, setFilterMonth] = useState(currentMonth);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "all">("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [form, setForm] = useState({
    date: getTodayString(),
    category: "feed" as ExpenseCategory,
    amount: "",
    description: "",
    vendor: "",
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpensesForMonth(filterMonth, filterYear);
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterMonth, filterYear]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      date: expense.date,
      category: expense.category,
      amount: String(expense.amount),
      description: expense.description,
      vendor: expense.vendor || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertExpense({
        ...(editingExpense ? { id: editingExpense.id } : {}),
        date: form.date,
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        vendor: form.vendor || null,
        receipt_url: null,
      });
      setShowForm(false);
      setEditingExpense(null);
      setForm({ date: getTodayString(), category: "feed", amount: "", description: "", vendor: "" });
      loadExpenses();
    } catch (err) {
      console.error(err);
      alert("Failed to save expense.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses = filterCategory === "all"
    ? expenses
    : expenses.filter(e => e.category === filterCategory);

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  // Category breakdown for chart
  const categoryTotals = CATEGORIES.map(([key, cat]) => ({
    name: cat.label.split(" ")[0],
    amount: expenses.filter(e => e.category === key).reduce((s, e) => s + e.amount, 0),
    fill: "#166534",
  })).filter(c => c.amount > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-500">Track farm expenses by category</p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowForm(!showForm); setForm({ date: getTodayString(), category: "feed", amount: "", description: "", vendor: "" }); }}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">{editingExpense ? "Edit Expense" : "Add Expense"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                {CATEGORIES.map(([key, cat]) => <option key={key} value={key}>{cat.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (Rs)</label>
              <input type="number" min={0} step={0.01} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What was purchased?" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendor / Paid To</label>
              <input type="text" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))}
                placeholder="Optional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
            </div>
            <div className="flex items-end gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditingExpense(null); }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit"
                className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800">
                {editingExpense ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary + Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col justify-center items-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Total</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(expenses.reduce((s,e) => s+e.amount, 0))}</p>
          <p className="text-sm text-gray-400 mt-1">{getMonthName(filterMonth)} {filterYear}</p>
        </div>
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">By Category</h2>
          {categoryTotals.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-400 text-sm">No expenses</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryTotals} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), "Amount"]} />
                <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          {Array.from({length: 12}, (_, i) => i + 1).map(m => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </select>
        <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
          min={2020} max={2030} className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilterCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCategory === "all" ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200"}`}>
            All
          </button>
          {CATEGORIES.map(([key, cat]) => (
            <button key={key} onClick={() => setFilterCategory(key as ExpenseCategory)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterCategory === key ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200"}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="ml-auto text-sm font-semibold text-red-600">Filtered: {formatCurrency(totalExpenses)}</div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({length: 5}).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-5 rounded skeleton" /></td></tr>
              ))
            ) : filteredExpenses.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No expenses found</td></tr>
            ) : (
              filteredExpenses.map(exp => {
                const cat = EXPENSE_CATEGORIES[exp.category];
                return (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{formatDate(exp.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.bgColor} ${cat.color}`}>{cat.label}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{exp.description}</td>
                    <td className="px-4 py-3 text-gray-500">{exp.vendor || "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">{formatCurrency(exp.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditForm(exp)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {!loading && filteredExpenses.length > 0 && (
            <tfoot>
              <tr className="bg-red-50 font-semibold">
                <td colSpan={4} className="px-4 py-3 text-red-800">Total ({filteredExpenses.length} items)</td>
                <td className="px-4 py-3 text-right text-red-800">{formatCurrency(totalExpenses)}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
