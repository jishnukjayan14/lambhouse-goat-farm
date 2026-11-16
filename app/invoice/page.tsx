"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getAllCustomers } from "@/lib/supabase";
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
import { MANURE_TYPES, FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_UPI } from "@/lib/constants";
import type { Customer, MilkDelivery, InvoiceData, InvoiceLineItem, ManureSale, ManureInvoiceData } from "@/lib/types";
import { FileText, Download, Milk, Leaf, Calendar, CheckCircle2, User, Phone, MapPin } from "lucide-react";
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

  // Load Customers & Auto-Select First
  useEffect(() => {
    getAllCustomers()
      .then(c => {
        const milkOnly = c.filter(cu => cu.product_type === "milk" || cu.product_type === "both");
        const list = milkOnly.length > 0 ? milkOnly : c;
        setMilkCustomers(list);
        if (list.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(list[0].id);
        }
      })
      .catch(console.error);
  }, [selectedCustomerId]);

  // Load Manure Sales for Manure Tab & Auto-Select First
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

  // Generate Milk Invoice Preview
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

      const advance = customer.advance_amount || 0;
      const prevBalance = customer.previous_balance || 0;
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
    if (selectedCustomerId) {
      generateMilkPreview();
    }
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
  const skipDays = (milkInvoiceData?.line_items.length || 0) - deliveredDays;

  // Split line items for 2-column table preview
  const midPoint = milkInvoiceData ? Math.ceil(milkInvoiceData.line_items.length / 2) : 15;
  const col1 = milkInvoiceData?.line_items.slice(0, midPoint) || [];
  const col2 = milkInvoiceData?.line_items.slice(midPoint) || [];

  return (
    <div className="space-y-6">
      {/* Page Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-950/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <span>Invoice Generator</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Model 1 Active
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Single-page full A4 printable invoices with official farm branding & PhonePe QR
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
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Select Milk Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={e => setSelectedCustomerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white font-medium text-gray-800"
                >
                  {milkCustomers.length === 0 && <option value="">No customers found</option>}
                  {milkCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.phone ? `(${c.phone})` : ""} {!c.is_active ? "[Inactive]" : ""}
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
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white font-medium text-gray-800"
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
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 font-medium text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {milkLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-950/10 p-8 space-y-4">
              <div className="h-20 rounded-xl skeleton" />
              <div className="h-28 rounded-xl skeleton" />
              <div className="h-48 rounded-xl skeleton" />
            </div>
          )}

          {/* Model 1 On-Screen Invoice Preview */}
          {milkInvoiceData && !milkLoading && (
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-950/10 overflow-hidden">
              
              {/* 1. Emerald Executive Header Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-green-950 text-white p-6 sm:p-7 flex flex-wrap items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.jpg"
                    alt="Farm Logo"
                    className="w-16 h-16 rounded-full border-2 border-emerald-300 object-cover shadow-md bg-white p-0.5"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-800/80 px-2 py-0.5 rounded border border-emerald-600/30">
                      Daily Fresh Farm Goat Milk
                    </span>
                    <h2 className="text-2xl font-black tracking-tight mt-1">
                      {FARM_NAME.toUpperCase()}
                    </h2>
                    <p className="text-xs text-emerald-100 font-medium">
                      {FARM_ADDRESS}
                    </p>
                    <p className="text-[11px] text-emerald-200/90 font-mono mt-0.5">
                      Mob: {FARM_PHONE1} / {FARM_PHONE2}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white text-emerald-950 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow">
                    MILK INVOICE
                  </div>
                  <p className="text-xs font-mono font-bold text-emerald-200">
                    #{milkInvoiceData.invoice_number}
                  </p>
                  <p className="text-xs text-emerald-100">
                    Billing Period: <span className="font-bold">{getMonthName(invoiceMonth)} {invoiceYear}</span>
                  </p>
                  <div className="mt-1">
                    <PDFDownloadButton invoiceData={milkInvoiceData} />
                  </div>
                </div>
              </div>

              {/* 2. Customer Info & 4 Quick Stats */}
              <div className="p-6 border-b border-gray-100 bg-emerald-50/30 grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Customer Details Box */}
                <div className="md:col-span-6 bg-white border border-emerald-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Billed To (Customer Details):
                    </span>
                    <h3 className="text-lg font-black text-gray-900 mt-1">
                      {milkInvoiceData.customer.name}
                    </h3>
                    {milkInvoiceData.customer.address && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {milkInvoiceData.customer.address}
                      </p>
                    )}
                    {milkInvoiceData.customer.phone && (
                      <p className="text-xs text-gray-700 font-mono mt-0.5">
                        Mob: {milkInvoiceData.customer.phone}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span>Rate: ₹{milkInvoiceData.customer.milk_rate} / glass (200ml)</span>
                    <span className="text-emerald-700">Daily Morning Supply</span>
                  </div>
                </div>

                {/* 4 Stats Grid */}
                <div className="md:col-span-6 grid grid-cols-2 gap-3">
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Period</span>
                    <span className="text-lg font-black text-gray-800 mt-0.5">{milkInvoiceData.line_items.length} Days</span>
                    <span className="text-[11px] text-gray-500 font-medium">{getMonthName(invoiceMonth)} {invoiceYear}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivered</span>
                    <span className="text-lg font-black text-emerald-700 mt-0.5">{deliveredDays} Days</span>
                    <span className="text-[11px] text-amber-600 font-medium">{skipDays} Skips / Off</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Volume</span>
                    <span className="text-lg font-black text-gray-800 mt-0.5">{totalGlasses} Glasses</span>
                    <span className="text-[11px] text-gray-500 font-medium">{(totalGlasses * 0.2).toFixed(1)} Litres</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center flex flex-col justify-center shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Amount Due</span>
                    <span className="text-xl font-black text-emerald-900 mt-0.5">{formatCurrency(milkInvoiceData.grand_total)}</span>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Payable Now</span>
                  </div>
                </div>
              </div>

              {/* 3. Dual-Column Daily Delivery Ledger */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Daily Milk Delivery Ledger (Days 1–15 & 16–{milkInvoiceData.line_items.length})
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Standard Measure: 1 Glass = 200ml (₹{milkInvoiceData.customer.milk_rate})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1: Days 1 to Mid */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-800 text-white font-bold text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-2 text-center">Glasses</th>
                          <th className="py-2 px-2 text-right">Rate</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px]">
                        {col1.map(item => (
                          <tr
                            key={item.date}
                            className={item.status === "delivered" ? "hover:bg-emerald-50/40" : "bg-amber-50/50 text-amber-800"}
                          >
                            <td className="py-1.5 px-3 font-medium text-gray-800">{item.display_date}</td>
                            <td className="py-1.5 px-2 text-center">
                              {item.status === "delivered" ? (
                                <span className="font-bold text-emerald-700">{item.glasses} gls</span>
                              ) : (
                                <span className="text-[10px] italic text-amber-600">Skip</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-right text-gray-400">
                              {item.status === "delivered" ? item.rate : "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-gray-900">
                              {item.status === "delivered" ? formatCurrency(item.amount) : "₹0"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Column 2: Days Mid to End */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-800 text-white font-bold text-[10px] uppercase">
                        <tr>
                          <th className="py-2 px-3">Date</th>
                          <th className="py-2 px-2 text-center">Glasses</th>
                          <th className="py-2 px-2 text-right">Rate</th>
                          <th className="py-2 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[11px]">
                        {col2.map(item => (
                          <tr
                            key={item.date}
                            className={item.status === "delivered" ? "hover:bg-emerald-50/40" : "bg-amber-50/50 text-amber-800"}
                          >
                            <td className="py-1.5 px-3 font-medium text-gray-800">{item.display_date}</td>
                            <td className="py-1.5 px-2 text-center">
                              {item.status === "delivered" ? (
                                <span className="font-bold text-emerald-700">{item.glasses} gls</span>
                              ) : (
                                <span className="text-[10px] italic text-amber-600">Skip</span>
                              )}
                            </td>
                            <td className="py-1.5 px-2 text-right text-gray-400">
                              {item.status === "delivered" ? item.rate : "—"}
                            </td>
                            <td className="py-1.5 px-3 text-right font-bold text-gray-900">
                              {item.status === "delivered" ? formatCurrency(item.amount) : "₹0"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 4. Bottom Section: PhonePe QR (Left) & Financial Breakdown (Right) */}
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Left: PhonePe QR Card */}
                <div className="md:col-span-6 bg-gradient-to-br from-emerald-50 to-green-100/70 border border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shadow-sm border border-emerald-300 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/qr-phonepe.jpg"
                      alt="PhonePe QR"
                      className="w-24 h-24 rounded-lg object-contain"
                    />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white">
                      Scan & Pay via UPI
                    </span>
                    <p className="text-sm font-mono font-bold text-emerald-950 mt-1.5">
                      {FARM_UPI}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Payee: <b>JISHNU K JAYAN</b>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                      GPay • PhonePe • Paytm • Any UPI
                    </p>
                  </div>
                </div>

                {/* Right: Totals Breakdown */}
                <div className="md:col-span-6 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Milk Subtotal ({deliveredDays} days delivered):</span>
                    <span className="font-bold text-gray-800">{formatCurrency(milkInvoiceData.subtotal)}</span>
                  </div>
                  {milkInvoiceData.advance_deduction > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Advance Payment Received:</span>
                      <span className="font-bold">- {formatCurrency(milkInvoiceData.advance_deduction)}</span>
                    </div>
                  )}
                  {milkInvoiceData.previous_balance !== 0 && (
                    <div className="flex justify-between text-amber-700">
                      <span>Previous Balance Due:</span>
                      <span className="font-bold">
                        {milkInvoiceData.previous_balance > 0 ? "+" : ""}
                        {formatCurrency(milkInvoiceData.previous_balance)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                      Total Amount Due:
                    </span>
                    <span className="text-2xl font-black text-emerald-800">
                      {formatCurrency(milkInvoiceData.grand_total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Download Bar */}
              <div className="p-4 bg-emerald-900 text-white flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-emerald-200">
                  Ready to print or send via WhatsApp to customer
                </p>
                <PDFDownloadButton invoiceData={milkInvoiceData} />
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
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 bg-white font-medium text-gray-800"
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
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-950/10 overflow-hidden">
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