"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { getAllGoats, upsertGoat } from "@/lib/supabase";
import { formatDate, calculateAge, getTodayString } from "@/lib/utils";
import { GOAT_BREEDS, PIE_COLORS } from "@/lib/constants";
import type { Goat, GoatBreed, GoatSex, GoatStatus } from "@/lib/types";
import { Plus, Edit2, X, Search } from "lucide-react";

const BreedPieChart = dynamic(() => import("@/components/charts/BreedPieChart"), { ssr: false });

const BREED_KEYS = Object.keys(GOAT_BREEDS) as GoatBreed[];
const STATUS_OPTIONS: GoatStatus[] = ["active", "sold", "deceased", "transferred"];

const defaultForm = {
  name: "",
  tag_number: "",
  breed: "mixed" as GoatBreed,
  sex: "female" as GoatSex,
  birth_date: "",
  status: "active" as GoatStatus,
  purchase_price: "",
  purchase_date: "",
  notes: "",
};

export default function GoatsPage() {
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBreed, setFilterBreed] = useState<GoatBreed | "all">("all");
  const [filterSex, setFilterSex] = useState<GoatSex | "all">("all");
  const [filterStatus, setFilterStatus] = useState<GoatStatus | "all">("active");
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingGoat, setEditingGoat] = useState<Goat | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const loadGoats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllGoats();
      setGoats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadGoats(); }, [loadGoats]);

  const openAdd = () => {
    setEditingGoat(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (goat: Goat) => {
    setEditingGoat(goat);
    setForm({
      name: goat.name,
      tag_number: goat.tag_number || "",
      breed: goat.breed,
      sex: goat.sex,
      birth_date: goat.birth_date || "",
      status: goat.status,
      purchase_price: goat.purchase_price ? String(goat.purchase_price) : "",
      purchase_date: goat.purchase_date || "",
      notes: goat.notes || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await upsertGoat({
        ...(editingGoat ? { id: editingGoat.id } : {}),
        name: form.name,
        tag_number: form.tag_number || null,
        breed: form.breed,
        sex: form.sex,
        birth_date: form.birth_date || null,
        status: form.status,
        mother_id: null,
        purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
        purchase_date: form.purchase_date || null,
        notes: form.notes || null,
      });
      setShowModal(false);
      loadGoats();
    } catch (err) {
      console.error(err);
      alert("Failed to save goat.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = goats.filter(g => {
    if (filterBreed !== "all" && g.breed !== filterBreed) return false;
    if (filterSex !== "all" && g.sex !== filterSex) return false;
    if (filterStatus !== "all" && g.status !== filterStatus) return false;
    if (searchText && !g.name.toLowerCase().includes(searchText.toLowerCase()) &&
      !(g.tag_number || "").toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  // Stats
  const activeGoats = goats.filter(g => g.status === "active");
  const breedData = BREED_KEYS.map(breed => ({
    breed,
    count: activeGoats.filter(g => g.breed === breed).length,
  }));

  // Birth date age preview
  const agePreview = form.birth_date ? calculateAge(form.birth_date).display : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Herd Management</h1>
          <p className="text-sm text-gray-500">{activeGoats.length} active goats</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
          <Plus className="w-4 h-4" />
          Add Goat
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Active", value: activeGoats.length, color: "bg-green-600" },
          { label: "Males", value: activeGoats.filter(g => g.sex === "male").length, color: "bg-blue-500" },
          { label: "Females", value: activeGoats.filter(g => g.sex === "female").length, color: "bg-pink-500" },
          { label: "Total Herd", value: goats.length, color: "bg-gray-500" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center text-white font-bold text-lg`}>
              {card.value}
            </div>
            <span className="text-sm font-medium text-gray-600">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Breed Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Breed Distribution (Active)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <BreedPieChart data={breedData} />
          <div className="grid grid-cols-2 gap-2">
            {breedData.filter(b => b.count > 0).map((b, i) => (
              <div key={b.breed} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-xs text-gray-600">{GOAT_BREEDS[b.breed].label}: <strong>{b.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)}
            placeholder="Search name or tag..."
            className="pl-7 border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:ring-2 focus:ring-green-600" />
        </div>
        <select value={filterBreed} onChange={e => setFilterBreed(e.target.value as GoatBreed | "all")}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">All Breeds</option>
          {BREED_KEYS.map(b => <option key={b} value={b}>{GOAT_BREEDS[b].label}</option>)}
        </select>
        <select value={filterSex} onChange={e => setFilterSex(e.target.value as GoatSex | "all")}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">Both Sexes</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as GoatStatus | "all")}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm">
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} goats</span>
      </div>

      {/* Goats Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Tag #</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Breed</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Sex</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Birth Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Age</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({length: 5}).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-5 rounded skeleton" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No goats found</td></tr>
            ) : (
              filtered.map(goat => {
                const breed = GOAT_BREEDS[goat.breed];
                const age = goat.birth_date ? calculateAge(goat.birth_date).display : "—";
                return (
                  <tr key={goat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{goat.name}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{goat.tag_number || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${breed.bgColor} ${breed.color}`}>
                        {breed.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${goat.sex === "male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                        {goat.sex === "male" ? "♂ Male" : "♀ Female"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{goat.birth_date ? formatDate(goat.birth_date) : "—"}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{age}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        goat.status === "active" ? "bg-green-100 text-green-700"
                        : goat.status === "sold" ? "bg-blue-100 text-blue-700"
                        : goat.status === "deceased" ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                      }`}>
                        {goat.status.charAt(0).toUpperCase() + goat.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button onClick={() => openEdit(goat)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">{editingGoat ? "Edit Goat" : "Add New Goat"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tag Number</label>
                  <input type="text" value={form.tag_number} onChange={e => setForm(f => ({ ...f, tag_number: e.target.value }))}
                    placeholder="e.g. G-001" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Breed *</label>
                  <select value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value as GoatBreed }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                    {BREED_KEYS.map(b => <option key={b} value={b}>{GOAT_BREEDS[b].label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sex *</label>
                  <select value={form.sex} onChange={e => setForm(f => ({ ...f, sex: e.target.value as GoatSex }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Birth Date</label>
                  <input type="date" value={form.birth_date} onChange={e => setForm(f => ({ ...f, birth_date: e.target.value }))}
                    max={getTodayString()} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                  {agePreview && <p className="text-xs text-green-600 mt-1">Age: {agePreview}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as GoatStatus }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Price (Rs)</label>
                  <input type="number" min={0} value={form.purchase_price} onChange={e => setForm(f => ({ ...f, purchase_price: e.target.value }))}
                    placeholder="Optional" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Optional notes..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:bg-gray-300">
                  {saving ? "Saving..." : editingGoat ? "Update Goat" : "Add Goat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
