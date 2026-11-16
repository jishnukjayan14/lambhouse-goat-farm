"use client";

import { Document, Page, Text, View, Image, StyleSheet, PDFDownloadLink } from "@react-pdf/renderer";
import type { InvoiceData } from "@/lib/types";
import { getMonthName } from "@/lib/utils";
import { FARM_NAME, FARM_ADDRESS, FARM_PHONE1, FARM_PHONE2, FARM_PHONE3, FARM_UPI } from "@/lib/constants";
import { Download } from "lucide-react";

// Model 1: Emerald Executive Style Sheet
// Precision-tuned to fill full A4 sheet (595.28 x 841.89 pt) without 2nd page spill
const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 30,
    backgroundColor: "#ffffff",
    color: "#1f2937",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  // 1. Top Emerald Executive Banner
  headerBanner: {
    backgroundColor: "#064e3b",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#a7f3d0",
    backgroundColor: "#ffffff",
  },
  farmTitleTag: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#6ee7b7",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  farmTitle: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.6,
  },
  farmSubtitle: {
    fontSize: 7.5,
    color: "#d1fae5",
    marginTop: 2,
  },
  farmContact: {
    fontSize: 7.2,
    color: "#a7f3d0",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceBadge: {
    backgroundColor: "#ffffff",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 4,
  },
  invoiceBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    letterSpacing: 0.8,
  },
  invoiceNumberText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#d1fae5",
    marginTop: 2,
  },
  invoiceMonthText: {
    fontSize: 7.2,
    color: "#a7f3d0",
    marginTop: 1,
  },

  // 2. Customer Card & Quick Stats Grid
  metaSection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  customerCard: {
    flex: 1.25,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: 6,
    padding: 10,
    justifyContent: "space-between",
  },
  customerLabel: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  customerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 7.5,
    color: "#374151",
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },
  customerRateRow: {
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 0.8,
    borderTopColor: "#bbf7d0",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rateText: {
    fontSize: 7,
    color: "#065f46",
    fontFamily: "Helvetica-Bold",
  },

  // 4 Stats Grid (2x2 on right side)
  statsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  statBox: {
    width: "48%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statBoxAccent: {
    width: "48%",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginTop: 2,
  },
  statValueAccent: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
    marginTop: 2,
  },
  statSub: {
    fontSize: 6.2,
    color: "#059669",
    marginTop: 1,
  },

  // 3. Tables Title & Dual Columns (Days 1-15 & 16-31)
  tableTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 2,
  },
  tableMainTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableSubNotice: {
    fontSize: 7,
    color: "#6b7280",
  },
  tablesContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  tableColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#065f46",
    paddingVertical: 4.5,
    paddingHorizontal: 6,
  },
  thDate: { width: "32%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  thQty: { width: "20%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "center" },
  thRate: { width: "22%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },
  thAmt: { width: "26%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#ffffff", textAlign: "right" },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 3.2,
    paddingHorizontal: 6,
    borderBottomWidth: 0.6,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f9fafb",
  },
  tableRowSkip: {
    backgroundColor: "#fffbeb",
  },
  tdDate: { width: "32%", fontSize: 7.2, color: "#374151" },
  tdQty: { width: "20%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#065f46", textAlign: "center" },
  tdRate: { width: "22%", fontSize: 7.2, color: "#9ca3af", textAlign: "right" },
  tdAmt: { width: "26%", fontSize: 7.2, fontFamily: "Helvetica-Bold", color: "#111827", textAlign: "right" },
  tdSkipText: { width: "68%", fontSize: 6.8, color: "#d97706", textAlign: "right", fontStyle: "italic" },

  // 4. Bottom Section: Side-by-Side QR Box & Financial Ledger
  bottomSection: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderTopColor: "#e5e7eb",
    marginBottom: 8,
    alignItems: "stretch",
  },

  // PhonePe / UPI Box (Left)
  paymentCard: {
    flex: 1.15,
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#a7f3d0",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    gap: 10,
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    padding: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  qrCode: {
    width: 68,
    height: 68,
    borderRadius: 3,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentBadge: {
    backgroundColor: "#065f46",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: "flex-start",
    marginBottom: 3,
  },
  paymentBadgeText: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  upiId: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#064e3b",
    marginBottom: 2,
  },
  payeeName: {
    fontSize: 7.2,
    color: "#374151",
    marginBottom: 2,
  },
  supportText: {
    fontSize: 6.5,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },

  // Financial Breakdown Ledger (Right)
  totalsCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 10,
    justifyContent: "space-between",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: {
    fontSize: 7.2,
    color: "#4b5563",
  },
  totalsValue: {
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  advanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  advanceLabel: {
    fontSize: 7.2,
    color: "#047857",
    fontFamily: "Helvetica-Bold",
  },
  advanceValue: {
    fontSize: 7.8,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },
  grandTotalBox: {
    backgroundColor: "#064e3b",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#a7f3d0",
    textTransform: "uppercase",
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  // 5. Footer Line
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 0.8,
    borderTopColor: "#f3f4f6",
  },
  footerText: {
    fontSize: 6.8,
    color: "#6b7280",
  },
  signatoryText: {
    fontSize: 6.8,
    fontFamily: "Helvetica-Bold",
    color: "#065f46",
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
  const skipCount = line_items.length - deliveredItems.length;

  // Split line items into 2 equal columns
  const midPoint = Math.ceil(line_items.length / 2);
  const col1 = line_items.slice(0, midPoint);
  const col2 = line_items.slice(midPoint);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Top Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src="/logo.jpg" style={styles.logo} />
            <View>
              <Text style={styles.farmTitleTag}>DAILY FRESH FARM GOAT MILK</Text>
              <Text style={styles.farmTitle}>{FARM_NAME.toUpperCase()}</Text>
              <Text style={styles.farmSubtitle}>{FARM_ADDRESS}</Text>
              <Text style={styles.farmContact}>Mob: {FARM_PHONE1} / {FARM_PHONE2} / {FARM_PHONE3}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>MILK INVOICE</Text>
            </View>
            <Text style={styles.invoiceNumberText}>#{invoice_number}</Text>
            <Text style={styles.invoiceMonthText}>Billing: {getMonthName(month)} {year}</Text>
          </View>
        </View>

        {/* Customer & Stats Section */}
        <View style={styles.metaSection}>
          {/* Customer Details Box */}
          <View style={styles.customerCard}>
            <View>
              <Text style={styles.customerLabel}>Billed To (Customer Details):</Text>
              <Text style={styles.customerName}>{customer.name}</Text>
              {customer.address && <Text style={styles.customerAddress}>{customer.address}</Text>}
              {customer.phone && <Text style={styles.customerPhone}>Mob: {customer.phone}</Text>}
            </View>
            <View style={styles.customerRateRow}>
              <Text style={styles.rateText}>Delivery Rate: Rs {customer.milk_rate} / glass (200ml)</Text>
              <Text style={styles.rateText}>Standard: Daily Morning</Text>
            </View>
          </View>

          {/* 4 Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Billing Period</Text>
              <Text style={styles.statValue}>{line_items.length} Days</Text>
              <Text style={styles.statSub}>{getMonthName(month)} {year}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Delivered</Text>
              <Text style={styles.statValueAccent}>{deliveredItems.length} Days</Text>
              <Text style={styles.statSub}>{skipCount} Skips</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Volume</Text>
              <Text style={styles.statValue}>{totalGlasses} Glasses</Text>
              <Text style={styles.statSub}>{totalLitres} Litres</Text>
            </View>
            <View style={styles.statBoxAccent}>
              <Text style={styles.statLabel}>Total Due</Text>
              <Text style={styles.statValueAccent}>Rs {Math.round(grand_total)}</Text>
              <Text style={styles.statSub}>Payable Now</Text>
            </View>
          </View>
        </View>

        {/* 2-Column Daily Ledger Table */}
        <View>
          <View style={styles.tableTitleRow}>
            <Text style={styles.tableMainTitle}>Daily Milk Delivery Ledger (Days 1–15 & 16–{line_items.length})</Text>
            <Text style={styles.tableSubNotice}>Standard Measure: 1 Glass = 200ml (Rs {customer.milk_rate})</Text>
          </View>

          <View style={styles.tablesContainer}>
            {/* Column 1: Days 1 to Mid */}
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
                    <Text style={styles.tdSkipText}>
                      {item.status === "not_delivered" ? "Skip / Not Delivered" : "Holiday"} (Rs 0)
                    </Text>
                  )}
                </View>
              ))}
            </View>

            {/* Column 2: Days Mid to End */}
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
                    <Text style={styles.tdSkipText}>
                      {item.status === "not_delivered" ? "Skip / Not Delivered" : "Holiday"} (Rs 0)
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Section: Payment QR (Left) & Financial Breakdown (Right) */}
        <View style={styles.bottomSection}>
          {/* PhonePe QR Code Card */}
          <View style={styles.paymentCard}>
            <View style={styles.qrContainer}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src="/qr-phonepe.jpg" style={styles.qrCode} />
            </View>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>SCAN & PAY VIA UPI</Text>
              </View>
              <Text style={styles.upiId}>{FARM_UPI}</Text>
              <Text style={styles.payeeName}>Payee: JISHNU K JAYAN</Text>
              <Text style={styles.supportText}>GPay • PhonePe • Paytm • Any UPI App</Text>
            </View>
          </View>

          {/* Totals Breakdown */}
          <View style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Milk Subtotal ({deliveredItems.length} days delivered):</Text>
              <Text style={styles.totalsValue}>{formatRs(subtotal)}</Text>
            </View>
            {advance_deduction > 0 && (
              <View style={styles.advanceRow}>
                <Text style={styles.advanceLabel}>Advance Payment Received:</Text>
                <Text style={styles.advanceValue}>- {formatRs(advance_deduction)}</Text>
              </View>
            )}
            {previous_balance !== 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Previous Balance Due:</Text>
                <Text style={[styles.totalsValue, { color: previous_balance > 0 ? "#dc2626" : "#047857" }]}>
                  {previous_balance > 0 ? "+" : ""}{formatRs(previous_balance)}
                </Text>
              </View>
            )}
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>TOTAL AMOUNT DUE:</Text>
              <Text style={styles.grandTotalValue}>{formatRs(grand_total)}</Text>
            </View>
          </View>
        </View>

        {/* Footer Sign-off */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>
            Thank you for supporting pure natural farming! • The Lamb House Goat Farm, Mananthavady
          </Text>
          <Text style={styles.signatoryText}>
            Authorized Farm Signatory • Computer Generated Statement
          </Text>
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
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-700 to-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:from-emerald-800 hover:to-green-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          {loading ? "Generating PDF..." : "Download Full A4 Invoice"}
        </button>
      )}
    </PDFDownloadLink>
  );
}

export default InvoicePDFDocument;
