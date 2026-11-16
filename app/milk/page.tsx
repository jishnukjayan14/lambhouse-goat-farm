"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getActiveCustomers, upsertMilkDelivery } from "@/lib/supabase";
import { formatCurrency, getTodayString, getCurrentMonthYear, getMonthName, getDaysInMonth, getMonthDateRange } from "@/lib/utils";
import { MILK_QUICK_OPTIONS, DEFAULT_MILK_RATE } from "@/lib/constants";
import type { Customer, MilkDelivery, DeliveryStatus } from "@/lib/types";
import { Save, CheckCircle, XCircle } from "lucide-react";

interface DeliveryRow {
  customer: Customer;
  glasses: number;
  status: DeliveryStatus;
  saved: boolean;
  saving: boolean;
  existingId?: string;
}

export default function MilkPage() {
  const today = getTodayString();
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();

  const [selectedDate, setSelectedDate] = useState(today);
  const [deliveryRows, setDeliveryRows] = useState<DeliveryRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [summaryMonth, setSummaryMonth] = useState(currentMonth);
  const [summaryYear, setSummaryYear] = useState(currentYear);
  const [summaryData, setSummaryData] = useState<{
    customer: Customer; days: number; glasses: number; amount: number;
  }[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const loadRows = useCallback(async () => {
    setLoadingRows(true);
    try {
      const [customers, deliveries] = await Promise.all([
        getActiveCustomers(),
        supabase
          .from("milk_deliveries")
          .select("*")
          .eq("date", selectedDate)
          .then(r => r.data as MilkDelivery[] || []),
      ]);

      const milkCustomers = customers.filter(c => c.product_type === "milk" || c.product_type === "both");
      const deliveryMap = new Map(deliveries.map(d => [d.customer_id, d]));

      setDeliveryRows(
        milkCustomers.map((cust) => {
          const existing = deliveryMap.get(cust.id);
          return {
            customer: cust,
            glasses: existing?.glasses ?? cust.default_glasses,
            status: existing?.status ?? "delivered",
            saved: !!existing,
            saving: false,
            existingId: existing?.id,
          };
        })
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRows(false);
    }
  }, [selectedDate]);

  useEffect(() => { loadRows(); }, [loadRows]);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const { startDate, endDate } = getMonthDateRange(summaryMonth, summaryYear);
      const { data } = await supabase
        .from("milk_deliveries")
        .select("*, customer:customers(*)")
        .gte("date", startDate)
        .lte("date", endDate)
        .eq("status", "delivered");

      const customerMap = new Map<string, { customer: Customer; days: number; glasses: number; amount: number }>();
      for (const d of data || []) {
        const cust = d.customer as Customer;
        if (!cust) continue;
        const existing = customerMap.get(cust.id) || { customer: cust, days: 0, glasses: 0, amount: 0 };
        customerMap.set(cust.id, {
          customer: cust,
          days: existing.days + 1,
          glasses: existing.glasses + d.glasses,
          amount: existing.amount + d.amount,
        });
      }
      setSummaryData(Array.from(customerMap.values()).sort((a, b) => a.customer.name.localeCompare(b.customer.name)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  }, [summaryMonth, summaryYear]);

  useEffect(() => { loadSummary(); }, [loadSummary]);

  const updateRow = (index: number, updates: Partial<DeliveryRow>) => {
    setDeliveryRows(rows => rows.map((r, i) => i === index ? { ...r, ...updates, saved: false } : r));
  };

  const saveRow = async (index: number) => {
    const row = deliveryRows[index];
    setDeliveryRows(rows => rows.map((r, i) => i === index ? { ...r, saving: true } : r));
    try {
      const amount = row.status === "delivered" ? row.glasses * row.customer.milk_rate : 0;
      await upsertMilkDelivery({
        customer_id: row.customer.id,
        date: selectedDate,
        glasses: row.status === "delivered" ? row.glasses : 0,
        rate: row.customer.milk_rate,
        amount,
        status: row.status,
        notes: null,
      });
      setDeliveryRows(rows => rows.map((r, i) => i === index ? { ...r, saving: false, saved: true } : r));
      loadSummary();
    } catch (err) {
      console.error(err);
      setDeliveryRows(rows => rows.map((r, i) => i === index ? { ...r, saving: false } : r));
      alert("Failed to save delivery. Please try again.");
    }
  };

  const saveAll = async () => {
    setBulkSaving(true);
    for (let i = 0; i < deliveryRows.length; i++) {
      await saveRow(i);
    }
    setBulkSaving(false);
    loadSummary();
  };

  const totalToday = deliveryRows
    .filter(r => r.status === "delivered")
    .reduce((s, r) => s + r.glasses * r.customer.milk_rate, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Milk Delivery</h1>
          <p className="text-sm text-gray-500">Log daily milk deliveries per customer</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent font-medium"
        />
      </div>

      {/* Daily Delivery Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">
            Deliveries for {selectedDate} 
            {!loadingRows && <span className="ml-2 text-sm text-green-600 font-normal">Total: {formatCurrency(totalToday)}</span>}
          </h2>
          <button
            onClick={saveAll}
            disabled={bulkSaving || loadingRows}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:bg-gray-300 transition-colors"
          >
            <Save className="w-4 h-4" />
            {bulkSaving ? "Saving..." : "Save All"}
          </button>
        </div>

        {loadingRows ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 rounded skeleton" />)}
          </div>
        ) : deliveryRows.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>No active milk customers found.</p>
            <p className="text-sm mt-1">Add customers in the Customers section.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {deliveryRows.map((row, idx) => (
              <div key={row.customer.id} className={`p-4 ${row.saved ? "bg-green-50/30" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-36 font-medium text-gray-800 text-sm truncate">{row.customer.name}</div>

                  {/* Quick buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {MILK_QUICK_OPTIONS.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => updateRow(idx, { glasses: opt.glasses, status: "delivered" })}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                          row.status === "delivered" && row.glasses === opt.glasses
                            ? "bg-green-700 text-white border-green-700"
                            : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      onClick={() => updateRow(idx, { status: "not_delivered", glasses: 0 })}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                        row.status === "not_delivered"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
                      }`}
                    >
                      Not Delivered
                    </button>
                  </div>

                  {/* Custom qty */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={row.status === "not_delivered" ? "" : row.glasses}
                      onChange={e => updateRow(idx, { glasses: parseFloat(e.target.value) || 0, status: "delivered" })}
                      disabled={row.status === "not_delivered"}
                      placeholder="Custom"
                      className="w-20 border border-gray-200 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                    />
                    <span className="text-xs text-gray-400">glasses</span>
                  </div>

                  {/* Rate & Amount */}
                  <div className="ml-auto flex items-center gap-4">
                    <span className="text-xs text-gray-400">@{formatCurrency(row.customer.milk_rate)}/glass</span>
                    <span className={`text-sm font-semibold ${row.status === "delivered" ? "text-green-700" : "text-gray-400"}`}>
                      {row.status === "delivered" ? formatCurrency(row.glasses * row.customer.milk_rate) : "—"}
                    </span>

                    {/* Save button + status */}
                    <button
                      onClick={() => saveRow(idx)}
                      disabled={row.saving}
                      className="p-1.5 rounded-md border border-gray-200 hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-50"
                    >
                      {row.saving ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : row.saved ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Save className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-700">Monthly Summary</h2>
          <div className="flex items-center gap-2">
            <select
              value={summaryMonth}
              onChange={e => setSummaryMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-600"
            >
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
            <input
              type="number"
              value={summaryYear}
              onChange={e => setSummaryYear(Number(e.target.value))}
              min={2020} max={2030}
              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-green-600"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Days</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Glasses</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingSummary ? (
                Array.from({length: 3}).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-3"><div className="h-5 rounded skeleton" /></td>
                  </tr>
                ))
              ) : summaryData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No delivery data for this month</td>
                </tr>
              ) : (
                <>
                  {summaryData.map(row => (
                    <tr key={row.customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{row.customer.name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.days}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.glasses}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatCurrency(row.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-semibold">
                    <td className="px-4 py-3 text-green-800">Total</td>
                    <td className="px-4 py-3 text-right text-green-800">{summaryData.reduce((s,r) => s + r.days, 0)}</td>
                    <td className="px-4 py-3 text-right text-green-800">{summaryData.reduce((s,r) => s + r.glasses, 0)}</td>
                    <td className="px-4 py-3 text-right text-green-800">{formatCurrency(summaryData.reduce((s,r) => s + r.amount, 0))}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
