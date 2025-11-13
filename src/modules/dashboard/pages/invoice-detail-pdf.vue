<template>
  <div class="pdf-viewer-page">
    <!-- DOWNLOAD BUTTON -->
    <div class="download-section">
      <button
        v-if="invoice"
        class="btn btn-sm btn-primary"
        @click="downloadPdf"
      >
        Download Invoice
      </button>
    </div>

    <!-- CENTERED INVOICE CONTAINER -->
    <div class="invoice-wrapper">
      <InvoicePDFTemplate
        v-if="invoice"
        :invoice="invoice"
        ref="invoiceTemplateRef"
      />

      <div v-else class="loading-state">
        <div class="spinner"></div>
        <p>Loading invoice...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoicePDFTemplate from "../components/invoice-pdf-template.vue";
import { useDashboardStore } from "@/modules/dashboard/store";
import { Invoice, TransformedInvoice } from "@/models/invoice-type";

// --- STATE SETUP ---
const route = useRoute();
const { transformedInvoices, submittedInvoices } =
  storeToRefs(useDashboardStore());

const invoice = ref<Invoice | TransformedInvoice | null>(null);
const invoiceTemplateRef = ref<{ pdfContent: HTMLElement } | null>(null);

// --- FETCH INVOICE ---
onMounted(() => {
  const invoiceId = route.params.invoice_id as string;
  const invoiceList = [
    ...(transformedInvoices.value as Invoice[]),
    ...(submittedInvoices.value as Invoice[]),
  ];
  const foundInvoice = invoiceList.find((inv) => inv.invoice_id === invoiceId);

  if (foundInvoice) {
    invoice.value = foundInvoice;
  } else {
    console.error(
      `Invoice with ID ${invoiceId} not found in transformedInvoices.`
    );
  }
});

// --- DOWNLOAD PDF FUNCTION ---
const downloadPdf = async () => {
  await nextTick();

  const content = invoiceTemplateRef.value?.pdfContent;
  if (!content) {
    console.error("PDF content element not found.");
    return;
  }

  try {
    const canvas = await html2canvas(content, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`Invoice_${invoice.value?.invoice_number || "Document"}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
</script>

<style lang="scss" scoped>
.pdf-viewer-page {
  @apply min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10;

  .download-section {
    @apply w-[77%] flex justify-end mb-6;
  }

  .download-btn {
    @apply bg-blue-600 text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-200;
  }

  .invoice-wrapper {
    @apply bg-white shadow-xl rounded-md p-8 flex items-center justify-center;
  }

  .loading-state {
    @apply flex flex-col items-center justify-center text-center p-20 text-gray-500;
    .spinner {
      border: 4px solid #ccc;
      border-top: 4px solid #2563eb;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 10px;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
