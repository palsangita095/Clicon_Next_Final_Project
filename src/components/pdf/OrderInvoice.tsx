import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export interface InvoiceOrderItem {
  product_id: string | null;
  product_name: string;
  quantity: number;
  price_at_time: number;
}

export interface InvoiceOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  billing_address: Record<string, unknown> | null;
  payment_method: string | null;
  notes: string | null;
  order_items: InvoiceOrderItem[];
}

export interface OrderInvoiceData {
  invoiceNumber: string;
  storeName: string;
  storeContact: string;
  order: InvoiceOrder;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1E293B",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FA8232",
  },
  invoiceLabel: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  metaLabel: {
    color: "#64748B",
  },
  metaValue: {
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  billTo: {
    marginBottom: 2,
  },
  table: {
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    paddingVertical: 6,
  },
  th: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748B",
    textTransform: "uppercase",
  },
  td: {
    fontSize: 9,
  },
  colProduct: {
    width: "50%",
  },
  colQty: {
    width: "15%",
    textAlign: "center",
  },
  colPrice: {
    width: "15%",
    textAlign: "right",
  },
  colSubtotal: {
    width: "20%",
    textAlign: "right",
  },
  totals: {
    marginTop: 16,
    width: 220,
    alignSelf: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#94A3B8",
  },
});

function money(value: number): string {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function formatAddress(address: Record<string, unknown> | null): string {
  if (!address || typeof address !== "object") return "—";
  const a = address as Record<string, string>;
  return [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    [a.address, a.city, a.region].filter(Boolean).join(", "),
    [a.country, a.zipCode].filter(Boolean).join(" "),
    a.email,
    a.phone,
  ]
    .filter(Boolean)
    .join("\n");
}

export function OrderInvoice({ invoiceNumber, storeName, storeContact, order }: OrderInvoiceData) {
  const items = order.order_items ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price_at_time) * item.quantity, 0);
  const created = new Date(order.created_at).toLocaleDateString("en-US");

  return (
    <Document title={invoiceNumber}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>{storeName}</Text>
            <Text style={{ color: "#64748B", marginTop: 2 }}>{storeContact}</Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.metaValue}>{invoiceNumber}</Text>
            <Text style={{ color: "#64748B" }}>{created}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Order #</Text>
            <Text style={styles.metaValue}>{order.id.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment method</Text>
            <Text style={styles.metaValue}>{order.payment_method ?? "—"}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={styles.metaValue}>{order.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={styles.billTo}>{formatAddress(order.billing_address)}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colProduct]}>Product</Text>
            <Text style={[styles.th, styles.colQty]}>Qty</Text>
            <Text style={[styles.th, styles.colPrice]}>Price</Text>
            <Text style={[styles.th, styles.colSubtotal]}>Subtotal</Text>
          </View>
          <View style={styles.table}>
            {items.map((item, index) => (
              <View key={item.product_id ?? index} style={styles.tableRow}>
                <Text style={[styles.td, styles.colProduct]}>{item.product_name}</Text>
                <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.td, styles.colPrice]}>{money(item.price_at_time)}</Text>
                <Text style={[styles.td, styles.colSubtotal]}>
                  {money(item.price_at_time * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <Text style={styles.metaLabel}>Subtotal</Text>
              <Text>{money(subtotal)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{money(order.total_amount)}</Text>
            </View>
          </View>
        </View>

        {order.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text>{order.notes}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for shopping at {storeName}. This is a system-generated invoice.
          </Text>
        </View>
      </Page>
    </Document>
  );
}