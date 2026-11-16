"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getActiveCustomers } from "@/lib/supabase";
import {
  formatCurrency,
  getMonthName,
  getDaysInMonth,
  generateInvoiceNumber,
  getCurrentMonthYear,
  formatInvoiceDate,
  getMonthDateRange,
  formatDate,
} from "@/lib/utils";
import { MANURE_TYPES } from "@/lib/constants";
import type { Customer, MilkDelivery, InvoiceData, InvoiceLineItem, ManureSale, ManureInvoiceData } from "@/lib/types";
import { FileText, Download, Milk, Leaf, Calendar, CheckCircle2 } from "lucide-react";
import dynamic from "next/dynamic";

const PDFDownloadButton = dynamic(
  () => import("@/components/invoice/InvoicePDF").then(m => m.PDFDownloadButton),
  { ssr: false }
);

const ManurePDFDownloadButton = dynamic(
  () => import("@/components/invoice/ManureInvoicePDF").then(m => m.ManurePDFDownloadButton),
  { ssr: false }
);

export default function InvoicePage() {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [activeTab, setActiveTab] = useState<"milk" | "manure">("milk");

  // Milk Invoice State
  const [milkCustomers, setMilkCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState(currentMonth);
  const [invoiceYear, setInvoiceYear] = useState(currentYear);
  const [milkInvoiceData, setMilkInvoiceData] = useState<InvoiceData | null>(null);
  const [milkLoading, setMilkLoading] = useState(false);

  // Manure Invoice State
  const [manureSales, setManureSales] = useState<(ManureSale & { customer?: Customer })[]>([]);
  const [selectedManureSaleId, setSelectedManureSaleId] = useState("");
  const [manureLoading, setManureLoading] = useState(false);

  // Load Customers
  useEffect(() => {
    getActiveCustomers()
      .then(c => {
        setMilkCustomers(c.filter(cu => cu.product_type === "milk" || cu.product_type === "both"));
      })
      .catch(console.error);
  }, []);

  // Load Manure Sales for Manure Tab
  const loadManureSales = useCallback(async () => {
    setManureLoading(true);
    try {
      const { data, error } = await supabase
        .from("manure_sales")
        .select(`
          *,
          customer:customers(*)
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      setManureSales(data || []);
      if (data && data.length > 0 && !selectedManureSaleId) {
        setSelectedManureSaleId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load manure sales:", err);
    } finally {
      setManureLoading(false);
    }
  }, [selectedManureSaleId]);

  useEffect(() => {
    if (activeTab === "manure") {
      loadManureSales();
    }
  }, [activeTab, loadManureSales]);

  // Generate Milk Preview
  const generateMilkPreview = useCallback(async () => {
    if (!selectedCustomerId) return;
    setMilkLoading(true);
    try {
      const customer = milkCustomers.find(c => c.id === selectedCustomerId);
      if (!customer) return;

      const { startDate, endDate } = getMonthDateRange(invoiceMonth, invoiceYear);

      const { data: deliveries } = await supabase
        .from("milk_deliveries")
        .select("*")
        .eq("customer_id", selectedCustomerId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date");

      const deliveryMap = new Map<string, MilkDelivery>(
        (deliveries || []).map(d => [d.date, d])
      );

      const daysInMonth = getDaysInMonth(invoiceMonth, invoiceYear);
      const lineItems: InvoiceLineItem[] = [];
      let subtotal = 0;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${invoiceYear}-${String(invoiceMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const delivery = deliveryMap.get(dateStr);

        if (!delivery) {
          lineItems.push({
            date: dateStr,
            display_date: formatInvoiceDate(dateStr),
            glasses: 0,
            rate: customer.milk_rate,
            amount: 0,
            status: "not_delivered",
          });
        } else {
          lineItems.push({
            date: dateStr,
            display_date: formatInvoiceDate(dateStr),
            glasses: delivery.glasses,
            rate: delivery.rate,
            amount: delivery.amount,
            status: delivery.status,
          });
          if (delivery.status === "delivered") {
            subtotal += delivery.amount;
          }
        }
      }

      const advance = customer.advance_amount;
      const prevBalance = customer.previous_balance;
      const grandTotal = subtotal - advance + prevBalance;
      const invoiceNumber = generateInvoiceNumber("MILK", invoiceMonth, invoiceYear, 1);

      setMilkInvoiceData({
        invoice_number: invoiceNumber,
        customer,
        month: invoiceMonth,
        year: invoiceYear,
        line_items: lineItems,
        subtotal,
        advance_deduction: advance,
        previous_balance: prevBalance,
        grand_total: grandTotal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setMilkLoading(false);
    }
  }, [selectedCustomerId, invoiceMonth, invoiceYear, milkCustomers]);

  useEffect(() => {
    if (selectedCustomerId) generateMilkPreview();
  }, [selectedCustomerId, invoiceMonth, invoiceYear, generateMilkPreview]);

  // Selected Manure Sale details
  const selectedSale = manureSales.find(s => s.id === selectedManureSaleId);
  const manureInvoiceData: ManureInvoiceData | null = selectedSale
    ? {
        invoice_number: `MNR-${selectedSale.date.replace(/-/g, "")}-${selectedSale.id.slice(0, 4).toUpperCase()}`,
        date: selectedSale.date,
        buyer_name: selectedSale.buyer_name || selectedSale.customer?.name || "Cash Customer",
        phone: selectedSale.customer?.phone || null,
        address: selectedSale.customer?.address || null,
        product_type: selectedSale.product_type,
        quantity: selectedSale.quantity,
        unit: selectedSale.unit,
        rate: selectedSale.rate,
        amount: selectedSale.amount,
        notes: selectedSale.notes || null,
      }
    : null;

  const deliveredItems = milkInvoiceData?.line_items.filter(i => i.status === "delivered") || [];
  const totalGlasses = deliveredItems.reduce((s, i) => s + i.glasses, 0);
  const deliveredDays = deliveredItems.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Generator</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Generate and download single-page A4 bills with official farm branding and QR code
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab("milk")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "milk"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Milk className="w-4 h-4 text-emerald-700" />
            <span>Milk Invoices (Monthly)</span>
          </button>
          <button
            onClick={() => setActiveTab("manure")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "manure"
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Leaf className="w-4 h-4 text-lime-700" />
            <span>Manure Invoices (Per Sale)</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: MILK INVOICE ================= */}
      {activeTab === "milk" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Select Milk Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  <option value="">Choose a customer...</option>
                  {milkCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Billing Month
                </label>
                <select
                  value={invoiceMonth}
                  onChange={e => setInvoiceMonth(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Billing Year
                </label>
                <input
                  type="number"
                  value={invoiceYear}
                  onChange={e => setInvoiceYear(Number(e.target.value))}
                  min={2020}
                  max={2030}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Invoice Preview */}
          {!selectedCustomerId && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-800" />
              <p className="text-sm font-medium">Select a customer above to preview and download their single-page milk invoice</p>
            </div>
          )}

          {selectedCustomerId && milkLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 rounded skeleton" />
              ))}
            </div>
          )}

          {milkInvoiceData && !milkLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-emerald-900 to-green-950 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                    Single-Page Printable A4 Bill
                  </span>
                  <h2 className="text-xl font-black tracking-tight mt-0.5">
                    Milk Invoice: {milkInvoiceData.customer.name}
                  </h2>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Invoice #{milkInvoiceData.invoice_number} • {getMonthName(invoiceMonth)} {invoiceYear}
                  </p>
                </div>
                <PDFDownloadButton invoiceData={milkInvoiceData} />
              </div>

              {/* Summary Badges */}
              <div className="p-6 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-emerald-50/40">
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Days Delivered</p>
                  <p className="text-lg font-black text-emerald-800 mt-0.5">{deliveredDays} Days</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Glasses</p>
                  <p className="text-lg font-black text-emerald-800 mt-0.5">{totalGlasses} Glasses</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Delivery Rate</p>
                  <p className="text-lg font-black text-emerald-800 mt-0.5">₹{milkInvoiceData.customer.milk_rate}/glass</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-100">
                  <p className="text-[10px] uppercase font-bold text-gray-400">Net Due</p>
                  <p className="text-lg font-black text-emerald-900 mt-0.5">{formatCurrency(milkInvoiceData.grand_total)}</p>
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-6 flex justify-end">
                <div className="w-full max-w-sm space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly Milk Subtotal:</span>
                    <span className="font-semibold text-gray-800">{formatCurrency(milkInvoiceData.subtotal)}</span>
                  </div>
                  {milkInvoiceData.advance_deduction > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Advance Deduction:</span>
                      <span className="font-semibold">- {formatCurrency(milkInvoiceData.advance_deduction)}</span>
                    </div>
                  )}
                  {milkInvoiceData.previous_balance !== 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Previous Balance:</span>
                      <span className="font-semibold">
                        {milkInvoiceData.previous_balance > 0 ? "+" : ""}
                        {formatCurrency(milkInvoiceData.previous_balance)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200 text-base font-black text-emerald-950">
                    <span>Grand Total Due:</span>
                    <span className="text-xl text-emerald-800">{formatCurrency(milkInvoiceData.grand_total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MANURE INVOICE ================= */}
      {activeTab === "manure" && (
        <div className="space-y-6">
          {/* Manure Sales Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-5">
            <h3 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
              Select Manure Sale Record for Invoice
            </h3>
            {manureLoading ? (
              <div className="h-10 rounded skeleton" />
            ) : manureSales.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No manure sales recorded yet. Record sales under the &quot;Manure Sales&quot; section.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Select Sale</label>
                  <select
                    value={selectedManureSaleId}
                    onChange={e => setSelectedManureSaleId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {manureSales.map(sale => (
                      <option key={sale.id} value={sale.id}>
                        {formatDate(sale.date)} — {sale.buyer_name || sale.customer?.name || "Cash Customer"} ({sale.quantity}{" "}
                        {sale.unit === "bag" ? "Bags" : "Kg"} {MANURE_TYPES[sale.product_type]?.label} - ₹
                        {sale.amount})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Manure Bill Preview */}
          {manureInvoiceData && selectedSale && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-emerald-900 to-green-950 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                    Official Manure Sale Bill (A4 Single Page)
                  </span>
                  <h2 className="text-xl font-black tracking-tight mt-0.5">
                    {manureInvoiceData.buyer_name}
                  </h2>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Invoice #{manureInvoiceData.invoice_number} • Sale Date: {formatDate(manureInvoiceData.date)}
                  </p>
                </div>
                <ManurePDFDownloadButton invoiceData={manureInvoiceData} />
              </div>

              {/* Items Card */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-gray-400 uppercase">Product</p>
                    <p className="text-base font-bold text-gray-800 mt-1">
                      {MANURE_TYPES[selectedSale.product_type]?.label || selectedSale.product_type}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {MANURE_TYPES[selectedSale.product_type]?.unit}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-gray-400 uppercase">Quantity & Rate</p>
                    <p className="text-base font-bold text-gray-800 mt-1">
                      {selectedSale.quantity} {selectedSale.unit === "bag" ? "Bags (50kg)" : "Kg"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      ₹{selectedSale.rate} per {selectedSale.unit}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                    <p className="text-xl font-black text-emerald-800 mt-1">
                      {formatCurrency(selectedSale.amount)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Paid via Cash / UPI
                    </span>
                  </div>
                </div>

                {selectedSale.notes && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">Notes: </span>
                    {selectedSale.notes}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}