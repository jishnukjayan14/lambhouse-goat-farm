"use client";

import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/types";
import { getMonthName } from "@/lib/utils";
import { FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_UPI } from "@/lib/constants";
import { Download } from "lucide-react";

// PDF styles - @react-pdf/renderer uses its own styling system
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 32,
    backgroundColor: "#ffffff",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#166534",
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  farmName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1a3a1f",
    marginBottom: 2,
  },
  farmAddress: {
    fontSize: 9,
    color: "#4b5563",
    marginBottom: 1,
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    textAlign: "right",
    marginTop: 4,
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
  },
  // Bill To / From row
  billingRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  billingBox: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
  },
  billingLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 1,
  },
  billingName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  billingDetail: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 1,
  },
  // Period badge
  periodRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    backgroundColor: "#dcfce7",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    color: "#166534",
    fontFamily: "Helvetica-Bold",
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#166534",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableRowSkip: {
    opacity: 0.5,
  },
  cellDate: { width: "20%", fontSize: 8.5, color: "#374151" },
  cellGlasses: { width: "15%", fontSize: 8.5, color: "#374151", textAlign: "right" },
  cellMl: { width: "15%", fontSize: 8.5, color: "#6b7280", textAlign: "right" },
  cellRate: { width: "20%", fontSize: 8.5, color: "#374151", textAlign: "right" },
  cellAmount: { width: "20%", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#166534", textAlign: "right" },
  cellStatus: { width: "10%", fontSize: 7, color: "#9ca3af", textAlign: "center" },
  // Totals
  totalsSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
    width: 200,
  },
  totalLabel: {
    fontSize: 9,
    color: "#6b7280",
    flex: 1,
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    width: 80,
    textAlign: "right",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    backgroundColor: "#dcfce7",
    padding: 8,
    borderRadius: 6,
    width: 200,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    width: 80,
    textAlign: "right",
  },
  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 1,
  },
  upiLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  upiId: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#166534",
    marginBottom: 4,
  },
  thankYou: {
    fontSize: 9,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  qrCode: {
    width: 72,
    height: 72,
  },
});

function formatRs(amount: number): string {
  return "Rs " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function InvoicePDFDocument({ invoiceData }: { invoiceData: InvoiceData }) {
  const { customer, month, year, line_items, subtotal, advance_deduction, previous_balance, grand_total, invoice_number } = invoiceData;

  const deliveredItems = line_items.filter(i => i.status === "delivered");
  const totalGlasses = deliveredItems.reduce((s, i) => s + i.glasses, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Image src="/logo.jpg" style={styles.logo} />
          <View style={styles.headerText}>
            <Text style={styles.farmName}>{FARM_NAME}</Text>
            <Text style={styles.farmAddress}>{FARM_ADDRESS}</Text>
            <Text style={styles.farmAddress}>Ph: {FARM_PHONE1} / {FARM_PHONE2}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>MILK SELL INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice_number}</Text>
          </View>
        </View>

        {/* Billing Row */}
        <View style={styles.billingRow}>
          <View style={styles.billingBox}>
            <Text style={styles.billingLabel}>From</Text>
            <Text style={styles.billingName}>{FARM_NAME}</Text>
            <Text style={styles.billingDetail}>{FARM_ADDRESS}</Text>
            <Text style={styles.billingDetail}>Ph: {FARM_PHONE1} / {FARM_PHONE2}</Text>
          </View>
          <View style={styles.billingBox}>
            <Text style={styles.billingLabel}>Bill To</Text>
            <Text style={styles.billingName}>{customer.name}</Text>
            {customer.phone ? <Text style={styles.billingDetail}>Ph: {customer.phone}</Text> : null}
            {customer.address ? <Text style={styles.billingDetail}>{customer.address}</Text> : null}
          </View>
        </View>

        {/* Period badges */}
        <View style={styles.periodRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Period: {getMonthName(month)} {year}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Days Delivered: {deliveredItems.length}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Total: {totalGlasses} glasses</Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: "20%" }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Glasses</Text>
          <Text style={[styles.tableHeaderCell, { width: "15%", textAlign: "right" }]}>Volume</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Rate</Text>
          <Text style={[styles.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Amount</Text>
          <Text style={[styles.tableHeaderCell, { width: "10%", textAlign: "center" }]}>Note</Text>
        </View>

        {/* Table Rows */}
        {line_items.map((item, idx) => (
          <View key={item.date} style={[
            styles.tableRow,
            idx % 2 === 1 ? styles.tableRowAlt : {},
            item.status !== "delivered" ? styles.tableRowSkip : {},
          ]}>
            <Text style={styles.cellDate}>{item.display_date}</Text>
            <Text style={styles.cellGlasses}>
              {item.status === "delivered" ? String(item.glasses) : "—"}
            </Text>
            <Text style={styles.cellMl}>
              {item.status === "delivered" ? `${item.glasses * 200}ml` : "—"}
            </Text>
            <Text style={styles.cellRate}>
              {item.status === "delivered" ? formatRs(item.rate) : "—"}
            </Text>
            <Text style={styles.cellAmount}>
              {item.status === "delivered" ? formatRs(item.amount) : "—"}
            </Text>
            <Text style={styles.cellStatus}>
              {item.status === "not_delivered" ? "Skip" : item.status === "holiday" ? "Holiday" : ""}
            </Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatRs(subtotal)}</Text>
          </View>
          {advance_deduction > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Advance Deduction</Text>
              <Text style={[styles.totalValue, { color: "#166534" }]}>- {formatRs(advance_deduction)}</Text>
            </View>
          )}
          {previous_balance !== 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Previous Balance</Text>
              <Text style={[styles.totalValue, { color: previous_balance > 0 ? "#dc2626" : "#166534" }]}>
                {previous_balance > 0 ? "+ " : ""}{formatRs(previous_balance)}
              </Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{formatRs(grand_total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.upiLabel}>Pay via UPI:</Text>
            <Text style={styles.upiId}>{FARM_UPI}</Text>
            <Text style={styles.thankYou}>Thank you for choosing Lamb House!</Text>
          </View>
          <Image src="/qr-phonepe.jpg" style={styles.qrCode} />
        </View>
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
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 disabled:bg-gray-300 transition-colors"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          {loading ? "Generating..." : "Download PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default InvoicePDFDocument;
