"use client";

import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { ManureInvoiceData } from "@/lib/types";
import { FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_PHONE3, FARM_UPI } from "@/lib/constants";
import { Download } from "lucide-react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    color: "#1f2937",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#065f46",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  farmTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    letterSpacing: 0.5,
  },
  farmSubtitle: {
    fontSize: 8.5,
    color: "#4b5563",
    marginTop: 2,
  },
  farmContact: {
    fontSize: 8,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceBadge: {
    backgroundColor: "#065f46",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  invoiceBadgeText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.6,
  },
  invoiceMetaText: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 1,
  },

  // Bill To Box
  billingRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18,
  },
  billingCard: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 6,
    padding: 10,
  },
  billingTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  buyerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    marginBottom: 2,
  },
  billingText: {
    fontSize: 8.5,
    color: "#4b5563",
  },

  // Table
  tableContainer: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#065f46",
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  thDesc: { width: "46%", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  thQty: { width: "18%", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  thRate: { width: "18%", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  thTotal: { width: "18%", fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  tdDesc: { width: "46%", fontSize: 9, fontFamily: "Helvetica-Bold", color: "#111827" },
  tdQty: { width: "18%", fontSize: 9, color: "#374151", textAlign: "right" },
  tdRate: { width: "18%", fontSize: 9, color: "#374151", textAlign: "right" },
  tdTotal: { width: "18%", fontSize: 10, fontFamily: "Helvetica-Bold", color: "#047857", textAlign: "right" },
  subDesc: { fontSize: 7.5, color: "#6b7280", marginTop: 2, fontFamily: "Helvetica" },

  // Bottom Section: Payment and Totals side-by-side
  bottomSection: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginBottom: 20,
  },
  paymentCard: {
    flex: 1.1,
    flexDirection: "row",
    backgroundColor: "#fafaf9",
    borderWidth: 1,
    borderColor: "#e7e5e4",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
    gap: 12,
  },
  qrCode: {
    width: 72,
    height: 72,
    borderRadius: 4,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1c1917",
    marginBottom: 3,
  },
  upiTag: {
    fontSize: 7.5,
    color: "#78716c",
  },
  upiId: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    marginBottom: 3,
  },
  payeeName: {
    fontSize: 8,
    color: "#44403c",
  },
  supportText: {
    fontSize: 7,
    color: "#a8a29e",
    marginTop: 2,
  },

  totalsCard: {
    flex: 0.9,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 10,
    justifyContent: "space-between",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsLabel: {
    fontSize: 8.5,
    color: "#6b7280",
  },
  totalsValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  grandTotalContainer: {
    backgroundColor: "#065f46",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // Notice & Footer
  notesCard: {
    backgroundColor: "#f9fafb",
    borderLeftWidth: 3,
    borderLeftColor: "#047857",
    padding: 8,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 2,
  },
  notesText: {
    fontSize: 7.5,
    color: "#6b7280",
    lineHeight: 1.3,
  },
  footerText: {
    textAlign: "center",
    fontSize: 7.5,
    color: "#9ca3af",
  },
});

function formatRs(amount: number): string {
  return "Rs " + amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ManureInvoicePDFDocument({ invoiceData }: { invoiceData: ManureInvoiceData }) {
  const { invoice_number, buyer_name, phone, address, date, product_type, quantity, unit, rate, amount, notes } = invoiceData;

  const productNames: Record<string, string> = {
    raw: "100% Organic Goat Manure (Raw Compost)",
    granules: "100% Organic Goat Manure Granules",
    powder: "100% Pure Goat Manure Fine Powder",
    custom: "Organic Goat Manure (Custom Blend)",
  };

  const productSubtext: Record<string, string> = {
    raw: "High-nitrogen natural organic compost ideal for pepper, coffee, vegetables, and fruit plants.",
    granules: "Slow-release organic granule pellets for garden plants, terrace gardens, and plantation.",
    powder: "Fine processed organic powder for instant root absorption and soil enrichment.",
    custom: "Premium farm manure mix prepared per customer specification.",
  };

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
              <Text style={styles.invoiceBadgeText}>MANURE SALE BILL</Text>
            </View>
            <Text style={styles.invoiceMetaText}>Bill No: #{invoice_number}</Text>
            <Text style={styles.invoiceMetaText}>Date: {date}</Text>
          </View>
        </View>

        {/* Bill To Info */}
        <View style={styles.billingRow}>
          <View style={styles.billingCard}>
            <Text style={styles.billingTitle}>Billed To</Text>
            <Text style={styles.buyerName}>{buyer_name}</Text>
            {phone && <Text style={styles.billingText}>Contact: {phone}</Text>}
            {address && <Text style={styles.billingText}>Address: {address}</Text>}
          </View>
          <View style={styles.billingCard}>
            <Text style={styles.billingTitle}>Sale Particulars</Text>
            <Text style={[styles.buyerName, { fontSize: 10.5 }]}>Invoice #{invoice_number}</Text>
            <Text style={styles.billingText}>Sale Date: {date}</Text>
            <Text style={styles.billingText}>Product Type: {product_type.toUpperCase()}</Text>
          </View>
        </View>

        {/* Product Items Table */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Item Description</Text>
            <Text style={styles.thQty}>Quantity</Text>
            <Text style={styles.thRate}>Rate (Rs)</Text>
            <Text style={styles.thTotal}>Total Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tdDesc}>
              <Text style={styles.tdDesc}>{productNames[product_type] || "Organic Goat Manure"}</Text>
              <Text style={styles.subDesc}>{productSubtext[product_type] || "Farm processed organic fertilizer."}</Text>
            </View>
            <Text style={styles.tdQty}>{quantity} {unit === "bag" ? "Bags (50kg)" : "Kg"}</Text>
            <Text style={styles.tdRate}>{formatRs(rate)}</Text>
            <Text style={styles.tdTotal}>{formatRs(amount)}</Text>
          </View>
        </View>

        {/* Notes if provided */}
        {notes && (
          <View style={styles.notesCard}>
            <Text style={styles.notesTitle}>Remarks / Notes:</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Bottom Section: Payment and Totals side-by-side */}
        <View style={styles.bottomSection}>
          {/* Payment Box */}
          <View style={styles.paymentCard}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/qr-phonepe.jpg" style={styles.qrCode} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>PAY VIA UPI / PHONEPE</Text>
              <Text style={styles.upiTag}>UPI ID:</Text>
              <Text style={styles.upiId}>{FARM_UPI}</Text>
              <Text style={styles.payeeName}>Payee: JISHNU K JAYAN</Text>
              <Text style={styles.supportText}>Scan QR code using GPay, PhonePe, Paytm, or any UPI App</Text>
            </View>
          </View>

          {/* Totals Box */}
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{formatRs(amount)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Quantity:</Text>
              <Text style={styles.totalsValue}>{quantity} {unit === "bag" ? "Bags (50kg)" : "Kg"}</Text>
            </View>
            <View style={styles.grandTotalContainer}>
              <Text style={styles.grandTotalLabel}>TOTAL AMOUNT DUE:</Text>
              <Text style={styles.grandTotalValue}>{formatRs(amount)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Thank you for supporting organic farming with The Lamb House Goat Farm, Mananthavady! • Computer Generated Invoice
        </Text>
      </Page>
    </Document>
  );
}

export function ManurePDFDownloadButton({ invoiceData }: { invoiceData: ManureInvoiceData }) {
  return (
    <PDFDownloadLink
      document={<ManureInvoicePDFDocument invoiceData={invoiceData} />}
      fileName={`${invoiceData.invoice_number}.pdf`}
    >
      {({ loading }) => (
        <button
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:from-emerald-800 hover:to-green-800 shadow-sm hover:shadow transition-all disabled:opacity-60"
          disabled={loading}
        >
          <Download className="w-3.5 h-3.5" />
          {loading ? "Generating..." : "Download Bill"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default ManureInvoicePDFDocument;
