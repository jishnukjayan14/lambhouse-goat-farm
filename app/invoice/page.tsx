"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, getActiveCustomers } from "@/lib/supabase";
import { formatCurrency, getMonthName, getDaysInMonth, generateInvoiceNumber, getCurrentMonthYear, formatInvoiceDate, getMonthDateRange } from "@/lib/utils";
import type { Customer, MilkDelivery, InvoiceData, InvoiceLineItem } from "@/lib/types";
import { FileText, Download } from "lucide-react";
import dynamic from "next/dynamic";

const PDFDownloadButton = dynamic(() => import("@/components/invoice/InvoicePDF").then(m => m.PDFDownloadButton), { ssr: false });

export default function InvoicePage() {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [invoiceMonth, setInvoiceMonth] = useState(currentMonth);
  const [invoiceYear, setInvoiceYear] = useState(currentYear);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getActiveCustomers()
      .then(c => {
        setCustomers(c.filter(cu => cu.product_type === "milk" || cu.product_type === "both"));
      })
      .catch(console.error);
  }, []);

  const generatePreview = useCallback(async () => {
    if (!selectedCustomerId) return;
    setLoading(true);
    try {
      const customer = customers.find(c => c.id === selectedCustomerId);
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

      setInvoiceData({
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
      setLoading(false);
    }
  }, [selectedCustomerId, invoiceMonth, invoiceYear, customers]);

  useEffect(() => {
    if (selectedCustomerId) generatePreview();
  }, [selectedCustomerId, invoiceMonth, invoiceYear, generatePreview]);

  const deliveredItems = invoiceData?.line_items.filter(i => i.status === "delivered") || [];
  const totalGlasses = deliveredItems.reduce((s, i) => s + i.glasses, 0);
  const deliveredDays = deliveredItems.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Invoice Generator</h1>
        <p className="text-sm text-gray-500">Generate monthly milk invoices for customers</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Select Customer</label>
            <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
              <option value="">Choose a customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
            <select value={invoiceMonth} onChange={e => setInvoiceMonth(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600">
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <input type="number" value={invoiceYear} onChange={e => setInvoiceYear(Number(e.target.value))}
              min={2020} max={2030} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-600" />
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      {!selectedCustomerId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Select a customer to generate invoice preview</p>
        </div>
      )}

      {selectedCustomerId && loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="space-y-3">
            {Array.from({length: 6}).map((_, i) => <div key={i} className="h-6 rounded skeleton" />)}
          </div>
        </div>
      )}

      {invoiceData && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          {/* Invoice Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-green-800">MILK SELL INVOICE</h2>
                <p className="text-xs text-gray-500 mt-0.5">#{invoiceData.invoice_number}</p>
              </div>
              <PDFDownloadButton invoiceData={invoiceData} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">From</p>
                <p className="font-semibold text-gray-800">The Lamb House Goat Farm</p>
                <p className="text-sm text-gray-500">Mananthavady, Wayanad, Kerala - 670645</p>
                <p className="text-sm text-gray-500">Ph: 7306874214 / 9061237526</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Bill To</p>
                <p className="font-semibold text-gray-800">{invoiceData.customer.name}</p>
                {invoiceData.customer.phone && <p className="text-sm text-gray-500">Ph: {invoiceData.customer.phone}</p>}
                {invoiceData.customer.address && <p className="text-sm text-gray-500">{invoiceData.customer.address}</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="bg-green-50 rounded-lg px-4 py-2">
                <span className="text-gray-500">Period: </span>
                <span className="font-semibold text-green-800">{getMonthName(invoiceMonth)} {invoiceYear}</span>
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-2">
                <span className="text-gray-500">Days Delivered: </span>
                <span className="font-semibold text-blue-800">{deliveredDays}</span>
              </div>
              <div className="bg-purple-50 rounded-lg px-4 py-2">
                <span className="text-gray-500">Total Glasses: </span>
                <span className="font-semibold text-purple-800">{totalGlasses}</span>
              </div>
            </div>
          </div>

          {/* Daily Delivery Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Glasses</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Rate</th>
                  <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoiceData.line_items.map(item => (
                  <tr key={item.date} className={`${item.status !== "delivered" ? "opacity-50" : ""} hover:bg-gray-50`}>
                    <td className="px-4 py-2 text-gray-700">{item.display_date}</td>
                    <td className="px-4 py-2 text-right">
                      {item.status === "delivered"
                        ? <span className="text-gray-700">{item.glasses}</span>
                        : <span className="text-xs text-gray-400 italic">
                            {item.status === "holiday" ? "Holiday" : "Skip"}
                          </span>
                      }
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {item.status === "delivered" ? formatCurrency(item.rate) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-700">
                      {item.status === "delivered" ? formatCurrency(item.amount) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="p-6 border-t border-gray-100">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-700">{formatCurrency(invoiceData.subtotal)}</span>
              </div>
              {invoiceData.advance_deduction > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Advance Deduction</span>
                  <span className="font-medium text-green-600">— {formatCurrency(invoiceData.advance_deduction)}</span>
                </div>
              )}
              {invoiceData.previous_balance !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Previous Balance</span>
                  <span className={`font-medium ${invoiceData.previous_balance > 0 ? "text-red-600" : "text-green-600"}`}>
                    {invoiceData.previous_balance > 0 ? "+" : ""}{formatCurrency(invoiceData.previous_balance)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-800">Grand Total</span>
                <span className="font-bold text-xl text-green-700">{formatCurrency(invoiceData.grand_total)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-center">
              <p className="font-medium text-green-800">Pay via UPI: 7306874214-2@ybl</p>
              <p className="text-green-600 text-xs mt-1">Thank you for choosing Lamb House!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
