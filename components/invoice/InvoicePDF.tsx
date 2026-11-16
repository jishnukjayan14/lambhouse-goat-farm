"use client";

import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/types";
import { getMonthName } from "@/lib/utils";
import { FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_PHONE3, FARM_UPI } from "@/lib/constants";
import { Download } from "lucide-react";

// PDF styles - tuned specifically for exact single-page A4 fit
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 22,
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#065f46",
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  farmTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    letterSpacing: 0.3,
  },
  farmSubtitle: {
    fontSize: 7.5,
    color: "#4b5563",
    marginTop: 1,
  },
  farmContact: {
    fontSize: 7,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
    marginTop: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceBadge: {
    backgroundColor: "#065f46",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 2,
  },
  invoiceBadgeText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  invoiceMetaText: {
    fontSize: 7,
    color: "#6b7280",
    marginTop: 1,
  },

  // Bill To & Month bar
  metaBar: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaGroup: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
  },
  metaSub: {
    fontSize: 7,
    color: "#4b5563",
  },

  // 2-Column Daily Tables Container
  tablesContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  tableColumn: {
    flex: 1,
    borderWidth: 0.8,
    borderColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#065f46",
    paddingVertical: 3.5,
    paddingHorizontal: 4,
  },
  thDate: { width: "32%", fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  thQty: { width: "20%", fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  thRate: { width: "22%", fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  thAmt: { width: "26%", fontSize: 7, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 2.4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableRowSkip: {
    backgroundColor: "#fef2f2",
    opacity: 0.65,
  },
  tdDate: { width: "32%", fontSize: 6.8, color: "#374151" },
  tdQty: { width: "20%", fontSize: 6.8, color: "#111827", textAlign: "right" },
  tdRate: { width: "22%", fontSize: 6.8, color: "#6b7280", textAlign: "right" },
  tdAmt: { width: "26%", fontSize: 6.8, fontFamily: "Helvetica-Bold", color: "#047857", textAlign: "right" },
  tdSkip: { width: "68%", fontSize: 6.5, color: "#ef4444", textAlign: "right", fontStyle: "italic" },

  // Bottom Section: Payment & Totals side-by-side
  bottomSection: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  // Payment Box (Left)
  paymentBox: {
    flex: 1.1,
    flexDirection: "row",
    backgroundColor: "#fafaf9",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
    gap: 8,
  },
  qrCode: {
    width: 62,
    height: 62,
    borderRadius: 3,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    marginBottom: 2,
  },
  upiTag: {
    fontSize: 6.5,
    color: "#78716c",
  },
  upiId: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    marginBottom: 2,
  },
  payeeName: {
    fontSize: 6.8,
    color: "#44403c",
  },
  supportText: {
    fontSize: 6.2,
    color: "#a8a29e",
    marginTop: 2,
  },

  // Totals Box (Right)
  totalsBox: {
    flex: 0.9,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 6,
    justifyContent: "space-between",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalsLabel: {
    fontSize: 7,
    color: "#6b7280",
  },
  totalsValue: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  grandTotalContainer: {
    backgroundColor: "#065f46",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 3,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  grandTotalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // Footer
  footer: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 6.2,
    color: "#9ca3af",
  },
});

function formatRs(amount: number): string {
  return "Rs " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function InvoicePDFDocument({ invoiceData }: { invoiceData: InvoiceData }) {
  const { customer, month, year, line_items, subtotal, advance_deduction, previous_balance, grand_total, invoice_number } = invoiceData;

  const deliveredItems = line_items.filter(i => i.status === "delivered");
  const totalGlasses = deliveredItems.reduce((s, i) => s + i.glasses, 0);
  const totalLitres = (totalGlasses * 0.2).toFixed(1);

  // Split line items into 2 equal columns for 1-page fit
  const midPoint = Math.ceil(line_items.length / 2);
  const col1 = line_items.slice(0, midPoint);
  const col2 = line_items.slice(midPoint);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo.jpg" style={styles.logo} />
            <View>
              <Text style={styles.farmTitle}>{FARM_NAME.toUpperCase()}</Text>
              <Text style={styles.farmSubtitle}>{FARM_ADDRESS}</Text>
              <Text style={styles.farmContact}>Contact: {FARM_PHONE1}, {FARM_PHONE2}, {FARM_PHONE3}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>MILK SELL INVOICE</Text>
            </View>
            <Text style={styles.invoiceMetaText}>Invoice No: #{invoice_number}</Text>
            <Text style={styles.invoiceMetaText}>Date: {new Date().toLocaleDateString("en-IN")}</Text>
          </View>
        </View>

        {/* Customer & Month Info Bar */}
        <View style={styles.metaBar}>
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Customer Details</Text>
            <Text style={styles.metaValue}>{customer.name}</Text>
            {customer.phone && <Text style={styles.metaSub}>Phone: {customer.phone}</Text>}
          </View>
          <View style={[styles.metaGroup, { alignItems: "center" }]}>
            <Text style={styles.metaLabel}>Billing Period</Text>
            <Text style={styles.metaValue}>{getMonthName(month)} {year}</Text>
            <Text style={styles.metaSub}>{deliveredItems.length} Days Delivered</Text>
          </View>
          <View style={[styles.metaGroup, { alignItems: "flex-end" }]}>
            <Text style={styles.metaLabel}>Default Daily Rate</Text>
            <Text style={styles.metaValue}>Rs {customer.milk_rate} / Glass</Text>
            <Text style={styles.metaSub}>1 Glass = 200ml</Text>
          </View>
        </View>

        {/* 2-Column Daily Deliveries Table */}
        <View style={styles.tablesContainer}>
          {/* Column 1 (Days 1 to mid) */}
          <View style={styles.tableColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.thDate}>Date</Text>
              <Text style={styles.thQty}>Glasses</Text>
              <Text style={styles.thRate}>Rate</Text>
              <Text style={styles.thAmt}>Amount</Text>
            </View>
            {col1.map((item, idx) => (
              <View
                key={item.date}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : undefined,
                  item.status !== "delivered" ? styles.tableRowSkip : undefined,
                ]}
              >
                <Text style={styles.tdDate}>{item.display_date}</Text>
                {item.status === "delivered" ? (
                  <>
                    <Text style={styles.tdQty}>{item.glasses} gls</Text>
                    <Text style={styles.tdRate}>{item.rate}</Text>
                    <Text style={styles.tdAmt}>{formatRs(item.amount)}</Text>
                  </>
                ) : (
                  <Text style={styles.tdSkip}>
                    {item.status === "not_delivered" ? "Not Delivered" : "Holiday"}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Column 2 (Days mid+1 to end) */}
          <View style={styles.tableColumn}>
            <View style={styles.tableHeader}>
              <Text style={styles.thDate}>Date</Text>
              <Text style={styles.thQty}>Glasses</Text>
              <Text style={styles.thRate}>Rate</Text>
              <Text style={styles.thAmt}>Amount</Text>
            </View>
            {col2.map((item, idx) => (
              <View
                key={item.date}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : undefined,
                  item.status !== "delivered" ? styles.tableRowSkip : undefined,
                ]}
              >
                <Text style={styles.tdDate}>{item.display_date}</Text>
                {item.status === "delivered" ? (
                  <>
                    <Text style={styles.tdQty}>{item.glasses} gls</Text>
                    <Text style={styles.tdRate}>{item.rate}</Text>
                    <Text style={styles.tdAmt}>{formatRs(item.amount)}</Text>
                  </>
                ) : (
                  <Text style={styles.tdSkip}>
                    {item.status === "not_delivered" ? "Not Delivered" : "Holiday"}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Section: Side-by-side Payment and Totals */}
        <View style={styles.bottomSection}>
          {/* Payment Box */}
          <View style={styles.paymentBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/qr-phonepe.jpg" style={styles.qrCode} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>PAY VIA UPI / PHONEPE</Text>
              <Text style={styles.upiTag}>UPI ID:</Text>
              <Text style={styles.upiId}>{FARM_UPI}</Text>
              <Text style={styles.payeeName}>Payee: JISHNU K JAYAN</Text>
              <Text style={styles.supportText}>Scan QR using GPay, PhonePe, Paytm or any UPI App</Text>
            </View>
          </View>

          {/* Totals Box */}
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Delivered Total ({deliveredItems.length} days / {totalGlasses} gls / {totalLitres}L):</Text>
              <Text style={styles.totalsValue}>{formatRs(subtotal)}</Text>
            </View>
            {advance_deduction > 0 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { color: "#047857" }]}>(-) Advance Deducted:</Text>
                <Text style={[styles.totalsValue, { color: "#047857" }]}>- {formatRs(advance_deduction)}</Text>
              </View>
            )}
            {previous_balance !== 0 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { color: previous_balance > 0 ? "#dc2626" : "#047857" }]}>
                  {previous_balance > 0 ? "(+) Previous Balance:" : "(-) Previous Credit:"}
                </Text>
                <Text style={[styles.totalsValue, { color: previous_balance > 0 ? "#dc2626" : "#047857" }]}>
                  {previous_balance > 0 ? "+ " : ""}{formatRs(previous_balance)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalLabel}>TOTAL AMOUNT DUE:</Text>
              <Text style={styles.grandTotalValue}>{formatRs(grand_total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for choosing The Lamb House Goat Farm, Mananthavady! • Computer Generated Invoice
        </Text>
      </Page>
    </Document>
  );
}

export function PDFDownloadButton({ invoiceData }: { invoiceData: InvoiceData }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDFDocument invoiceData={invoiceData} />}
      fileName={`${invoiceData.invoice_number}.pdf`}
    >
      {({ loading }) => (
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-800 hover:to-green-800 shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          {loading ? "Generating 1-Page PDF..." : "Download PDF (Single Page)"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default InvoicePDFDocument;
