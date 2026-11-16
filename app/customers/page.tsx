"use client";

import { useEffect, useState, useCallback } from "react";
import { getAllCustomers, upsertCustomer } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { MANURE_TYPES, DEFAULT_MILK_RATE } from "@/lib/constants";
import type { Customer, ProductType, ManureType } from "@/lib/types";
import { Plus, Edit2, X, Phone, MapPin, ToggleLeft, ToggleRight } from "lucide-react";

const defaultForm = {
  name: "",
  phone: "",
  address: "",
  product_type: "milk" as ProductType,
  default_glasses: 2,
  milk_rate: DEFAULT_MILK_RATE,
  manure_type: "raw" as ManureType,
  manure_rate: MANURE_TYPES.raw.default_rate,
  advance_amount: 0,
  previous_balance: 0,
  notes: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<boolean | "all">(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const openAdd = () => {
    setEditingCustomer(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name,
      phone: customer.phone || "",
      address: customer.address || "",
      product_type: customer.product_type,
      default_glasses: customer.default_glasses,
      milk_rate: customer.milk_rate,
      manure_type: customer.manure_type || "raw",
      manure_rate: customer.manure_rate || MANURE_TYPES.raw.default_rate,
      advance_amount: customer.advance_amount,
      previous_balance: customer.previous_balance,
      notes: customer.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertCustomer({
        ...(editingCustomer ? { id: editingCustomer.id } : {}),
        name: form.name,
        phone: form.phone || null,
        address: form.address || null,
        product_type: form.product_type,
        default_glasses: form.default_glasses,
        milk_rate: form.milk_rate,
        manure_type: form.product_type !== "milk" ? form.manure_type : null,
        manure_rate: form.product_type !== "milk" ? form.manure_rate : null,
        advance_amount: form.advance_amount,
        previous_balance: form.previous_balance,
        is_active: editingCustomer ? editingCustomer.is_active : true,
        notes: form.notes || null,
      });
      setShowModal(false);
      loadCustomers();
    } catch (err) {
      console.error(err);
      alert("Failed to save customer.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (customer: Customer) => {
    try {
      await upsertCustomer({ id: customer.id, is_active: !customer.is_active });
      loadCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(c => {
    if (filterActive === true) return c.is_active;
    if (filterActive === false) return !c.is_active;
    return true;
  });

  const productBadge = (type: ProductType) => {
    if (type === "milk") return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Milk</span>;
    if (type === "manure") return <span className="px-2 py-0.5 bg-lime-100 text-lime-700 rounded-full text-xs font-medium">Manure</span>;
    return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">Both</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-500">{customers.filter(c => c.is_active).length} active customers</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[["Active", true], ["Inactive", false], ["All", "all"]].map(([label, val]) => (
          <button key={String(label)} onClick={() => setFilterActive(val as boolean | "all")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterActive === val ? "bg-green-700 text-white border-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
            }`}>
            {String(label)}
          </button>
        ))}
      </div>

      {/* Customer Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({length: 6}).map((_, i) => <div key={i} className="h-40 rounded-lg skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <p className="text-lg">No customers found</p>
          <p className="text-sm mt-1">Add your first customer to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(customer => (
            <div key={customer.id} className={`bg-white rounded-lg shadow-sm border p-5 ${customer.is_active ? "border-gray-100" : "border-gray-200 opacity-70"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{customer.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {productBadge(customer.product_type)}
                    {!customer.is_active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">Inactive</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(customer)}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(customer)}
                    className={`p-1.5 rounded-md transition-colors ${customer.is_active ? "hover:bg-red-50 text-green-600 hover:text-red-500" : "hover:bg-green-50 text-gray-400 hover:text-green-600"}`}>
                    {customer.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                {customer.phone && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start gap-2 text-gray-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="text-xs">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs">
                {(customer.product_type === "milk" || customer.product_type === "both") && (
                  <div>
                    <span className="text-gray-400">Milk rate</span>
                    <p className="font-semibold text-gray-700">{formatCurrency(customer.milk_rate)}/glass</p>
                  </div>
                )}
                {(customer.product_type === "milk" || customer.product_type === "both") && (
                  <div>
                    <span className="text-gray-400">Default qty</span>
                    <p className="font-semibold text-gray-700">{customer.default_glasses} glasses</p>
                  </div>
                )}
                {customer.advance_amount > 0 && (
                  <div>
                    <span className="text-gray-400">Advance</span>
                    <p className="font-semibold text-green-600">{formatCurrency(customer.advance_amount)}</p>
                  </div>
                )}
                {customer.previous_balance !== 0 && (
                  <div>
                    <span className="text-gray-400">Prev. balance</span>
                    <p className={`font-semibold ${customer.previous_balance > 0 ? "text-red-600" : "text-green-600"}`}>
                      {formatCurrency(Math.abs(customer.previous_balance))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">{editingCustomer ? "Edit Customer" : "Add Customer"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Type</label>
                  <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value as ProductType }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                    <option value="milk">Milk</option>
                    <option value="manure">Manure</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
                {(form.product_type === "milk" || form.product_type === "both") && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Default Glasses</label>
                      <input type="number" min={0.5} step={0.5} value={form.default_glasses}
                        onChange={e => setForm(f => ({ ...f, default_glasses: parseFloat(e.target.value) || 1 }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Milk Rate (Rs/glass)</label>
                      <input type="number" min={0} value={form.milk_rate}
                        onChange={e => setForm(f => ({ ...f, milk_rate: parseFloat(e.target.value) || 0 }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                  </>
                )}
                {(form.product_type === "manure" || form.product_type === "both") && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Manure Type</label>
                      <select value={form.manure_type} onChange={e => {
                        const type = e.target.value as ManureType;
                        setForm(f => ({ ...f, manure_type: type, manure_rate: MANURE_TYPES[type].default_rate }));
                      }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                        {Object.entries(MANURE_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Manure Rate (Rs)</label>
                      <input type="number" min={0} value={form.manure_rate}
                        onChange={e => setForm(f => ({ ...f, manure_rate: parseFloat(e.target.value) || 0 }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Advance Paid (Rs)</label>
                  <input type="number" min={0} value={form.advance_amount}
                    onChange={e => setForm(f => ({ ...f, advance_amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Previous Balance (Rs)</label>
                  <input type="number" value={form.previous_balance}
                    onChange={e => setForm(f => ({ ...f, previous_balance: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                  <p className="text-xs text-gray-400 mt-0.5">Positive = customer owes us, Negative = we owe them</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:bg-gray-300">
                  {saving ? "Saving..." : editingCustomer ? "Update" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
