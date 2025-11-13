<template>
  <div class="invoice-pdf-template" ref="pdfContent">
    <!-- ===== Header ===== -->
    <header class="invoice-header">
      <div class="company-section">
        <h1 class="company-name">{{ invoice.company_name }}</h1>
        <p v-if="invoice.billing_address?.address">
          {{ invoice.billing_address.address }}
        </p>
        <p
          v-if="invoice.billing_address?.city || invoice.billing_address?.state"
        >
          {{ invoice.billing_address.city }},
          {{ invoice.billing_address.state }}
        </p>
      </div>

      <div class="invoice-title-section">
        <h2 class="invoice-title">INVOICE</h2>
        <p class="invoice-number">#{{ invoice.invoice_number }}</p>
        <p class="invoice-number">
          #IRN: {{ invoice.transformed_invoice.irn }}
        </p>
      </div>
    </header>

    <!-- ===== Billing Info ===== -->
    <section class="details-grid">
      <div class="bill-to">
        <h3>BILL TO:</h3>
        <p class="customer-name">{{ invoice.customer_name }}</p>
        <p v-if="invoice.email">{{ invoice.email }}</p>
        <p v-if="invoice.phone">{{ invoice.phone }}</p>
      </div>

      <div class="invoice-info">
        <div><strong>Date:</strong> {{ formatDate(invoice.date) }}</div>
        <div><strong>Due Date:</strong> {{ formatDate(invoice.due_date) }}</div>
        <div><strong>Status:</strong> {{ invoice.status }}</div>
      </div>
    </section>

    <!-- ===== Line Items ===== -->
    <section class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <!-- Replace this static demo data with invoice.line_items if available -->
          <tr v-for="(item, index) in getLineItems" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ item.description }}</td>
            <td>{{ item.quantity }}</td>
            <td>
              {{ formatCurrency(item.unit_price, invoice.currency_code) }}
            </td>
            <td>{{ formatCurrency(item.total, invoice.currency_code) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- ===== Summary ===== -->
    <section class="summary-section">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>{{
          formatCurrency(invoice.sub_total, invoice.currency_code)
        }}</span>
      </div>
      <div class="summary-row">
        <span>Tax Amount</span>
        <span>{{
          formatCurrency(invoice.tax_total || 0, invoice.currency_code)
        }}</span>
      </div>
      <div class="summary-row total">
        <span><strong>Total</strong></span>
        <span
          ><strong>{{
            formatCurrency(invoice.total, invoice.currency_code)
          }}</strong></span
        >
      </div>
      <div class="summary-row balance">
        <span>Balance Due</span>
        <span>{{
          formatCurrency(invoice.balance, invoice.currency_code)
        }}</span>
      </div>
    </section>

    <!-- ===== QR Code Section ===== -->
    <!-- <section class="qr-section">
      <img
        :src="qrCodeDataUrl"
        alt="QR Code"
        class="qr-code"
        v-if="qrCodeDataUrl"
      />
      <div class="qr-text">
        <p>Scan to verify invoice</p>
      </div>
    </section> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import QRCode from "qrcode";
import { Invoice, TransformedInvoice, LineItem } from "@/models/invoice-type";

const props = defineProps<{ invoice: Invoice }>();

const pdfContent = ref<HTMLElement | null>(null);
const qrCodeDataUrl = ref<string | null>(null);

defineExpose({ pdfContent });

const getLineItems = computed(() => {
  const lineItems = props.invoice.line_items as LineItem[];

  if (!lineItems || !Array.isArray(lineItems)) return [];

  return lineItems.map((item) => ({
    description: item.description || "No description",
    quantity: item.quantity || 0,
    unit_price: item.rate || 0,
    total: (item.quantity || 0) * (item.rate || 0),
  }));
});

// ====== QR Code Generation ======
onMounted(async () => {
  const text = `Invoice ID: ${props.invoice.invoice_id}\n\nAmount: ${props.invoice.total} ${props.invoice.currency_code}`;
  qrCodeDataUrl.value = await QRCode.toDataURL(text);
});

// ====== Utilities ======
const formatCurrency = (value: number, code: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: code,
  }).format(value);

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
</script>

<style lang="scss" scoped>
.invoice-pdf-template {
  font-family: "Inter", Arial, sans-serif;
  background: #fff;
  color: #333;
  width: 800px;
  padding: 40px;
  box-sizing: border-box;
  border: 1px solid #e5e5e5;
}

/* ===== Header ===== */
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 2px solid #000;
  padding-bottom: 20px;
  margin-bottom: 30px;

  .company-name {
    font-size: 24px;
    font-weight: 700;
    color: #222;
  }

  .invoice-title {
    font-size: 32px;
    font-weight: 800;
    color: #444;
    text-align: right;
  }

  .invoice-number {
    font-size: 14px;
    color: #777;
    text-align: right;
  }
}

/* ===== Details Grid ===== */
.details-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;

  .bill-to {
    h3 {
      margin-bottom: 8px;
      font-size: 14px;
      text-transform: uppercase;
      color: #555;
    }
    .customer-name {
      font-size: 16px;
      font-weight: bold;
    }
  }

  .invoice-info {
    text-align: right;
    font-size: 14px;
    color: #444;
  }
}

/* ===== Items Table ===== */
.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;

  th,
  td {
    border: 1px solid #ddd;
    padding: 10px;
    font-size: 14px;
  }

  th {
    background-color: #f8f8f8;
    text-align: left;
  }

  td {
    vertical-align: top;
  }

  tr:nth-child(even) {
    background-color: #fafafa;
  }
}

/* ===== Summary ===== */
.summary-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  .summary-row {
    display: flex;
    justify-content: space-between;
    width: 250px;
    padding: 6px 0;
    border-bottom: 1px solid #eee;
  }
  .total {
    font-size: 16px;
    font-weight: bold;
  }
  .balance {
    background: #f5f5f5;
    padding: 10px;
    border: none;
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
}

/* ===== QR Section ===== */
.qr-section {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  .qr-code {
    width: 120px;
    height: 120px;
  }
  .qr-text {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
  }
}
</style>
