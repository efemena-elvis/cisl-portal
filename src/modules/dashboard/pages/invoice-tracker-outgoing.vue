<template>
  <!-- TABLE CONTAINER -->
  <TableContainer
    :table-header="currentTableHeader"
    :table-body="invoicesForTable"
    :is-loading="isFetchingInvoices"
    :empty-data="emptyDataConfig"
  >
    <TableContainerBody
      v-for="(invoice, index) in invoicesForTable"
      :key="index"
      :table-header="currentTableHeader"
      :table-data="invoice"
    />
  </TableContainer>

  <!-- PAGINATION -->
  <div
    v-if="!isFetchingInvoices && currentPaginationData.total_records > 0"
    class="pagination-container"
  >
    <Pagination
      :page-description="paginationDescription"
      :paging-data="currentPaginationData"
    />
  </div>

  <teleport to="body" v-if="showQrCodeModal">
    <QrCodeModal
      :irn="selectedInvoiceIRN"
      @closeTriggered="showQrCodeModal = false"
    />
  </teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, h } from "vue";
import { useString } from "@/shared/composables/useString";
import dateUtil from "@/shared/composables/useDate";
import TableContainer from "@/shared/components/table-comps/table-container.vue";
import TableContainerBody from "@/shared/components/table-comps/table-container-body.vue";
import Pagination from "@/shared/components/global-comps/pagination.vue";
import TableLink from "@/shared/components/table-comps/table-link.vue";
import QrCodeModal from "@/modules/dashboard/modals/qr-code-modal.vue";
import { useDashboardStore } from "@/modules/dashboard/store";
import { Invoice } from "@/models/invoice-type";
import { storeToRefs } from "pinia";
import { TableActionBtn } from "@/shared/components";

// --- INTERFACES AND TYPES ---
interface IPaging {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_records: number;
}

// --- COMPOSABLES ---
const { getBoldTableText, getStatus, maskCode, formatNumber } = useString();

const { submittedInvoices } = storeToRefs(useDashboardStore());

// --- REACTIVE STATE ---
const isFetchingInvoices = ref(true);
const activeTab = ref<"pending" | "approved" | "rejected">("pending");
const rawInvoices = ref<Invoice[]>([]);

// --- PAGINATION STATE ---
const paginationData = ref({
  pending: {
    current_page: 1,
    page_count: 0,
    total_pages_count: 1,
    total_records: 0,
  },
  approved: {
    current_page: 1,
    page_count: 0,
    total_pages_count: 1,
    total_records: 0,
  },
  rejected: {
    current_page: 1,
    page_count: 0,
    total_pages_count: 1,
    total_records: 0,
  },
});

const selectedInvoiceIRN = ref<string>("");

const showQrCodeModal = ref(false);

const toggleQrCodeModal = (irn: string) => {
  selectedInvoiceIRN.value = irn;
  showQrCodeModal.value = true;
};

const currentPaginationData = computed(
  () => paginationData.value[activeTab.value]
);

const paginationDescription = computed(() => {
  const data = currentPaginationData.value;

  if (!data.total_records) return "";
  const start = (data.current_page - 1) * data.page_count + 1;
  const end = Math.min(data.current_page * data.page_count, data.total_records);
  return `Showing ${start}-${end} of ${data.total_records} invoices`;
});

// --- TABLE CONFIGURATION ---
const baseTableHeader = [
  { slug: "no", title: "#" },
  { slug: "customer", title: "Customer Name" },
  { slug: "amount", title: "Amount" },
  { slug: "irn", title: "IRN #" },
  { slug: "pdf", title: "Invoice (PDF)" },
  { slug: "qrCode", title: "QR Code" },
  { slug: "status", title: "Status" },
];

const currentTableHeader = computed(() => {
  if (activeTab.value === "rejected") {
    const headers = [...baseTableHeader];

    headers.splice(4, 0, {
      slug: "rejectionReason",
      title: "Rejection Reason",
    });

    return headers;
  }

  return baseTableHeader;
});

const emptyDataConfig = computed(() => ({
  title: `No Outgoing Invoices`,
  description: `Invoices with the status "Outgoing" will appear here.`,
}));

const getInvoiceDate = (date: string) => {
  let { m4, d3, y1 } = dateUtil.formatDate(date).getAll();
  return `${m4} ${d3}, ${y1}`;
};

// --- COMPUTED PROPERTIES ---
const invoicesForTable = computed(() => {
  return rawInvoices.value.map((invoice, index) => ({
    no: index + 1,
    customer: invoice.customer_name,
    amount: getBoldTableText(
      `${invoice.currency_code} ${formatNumber(invoice.total)}`
    ),
    irn: maskCode(invoice.transformed_invoice.irn) || "------",
    pdf: h(TableLink, {
      linkText: "View Invoice",
      linkRoute: `/view-invoice/${invoice.invoice_id}`,
    }),
    qrCode: h(TableActionBtn, {
      key: invoice.invoice_id,
      showPrimaryBtn: true,
      showSecondaryBtn: false,
      primaryBtnText: "View QRCode",
      onPrimaryActionClicked: () =>
        toggleQrCodeModal(invoice.transformed_invoice.irn),
    }),
    status: getStatus(
      invoice.status === "Approved"
        ? "success"
        : invoice.status === "Rejected"
          ? "failed"
          : "pending",
      "Invoice transmitted"
    ),
    rejectionReason: `<span class="text-red-600">${""}</span>`,
  }));
});

// --- API LOGIC ---
const setActiveTab = (tab: "pending" | "approved" | "rejected") => {
  activeTab.value = tab;
};

watch(activeTab, (newTab) => {
  fetchInvoices(newTab);
});

const fetchInvoices = async (tab: "pending" | "approved" | "rejected") => {
  isFetchingInvoices.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockApiResponse = {
      invoices: submittedInvoices.value || [],
      pagination: {
        current_page: 1,
        page_count: Array.isArray(submittedInvoices.value)
          ? submittedInvoices.value.length
          : 0,
        total_pages_count: 1,
        total_records: Array.isArray(submittedInvoices.value)
          ? submittedInvoices.value.length
          : 0,
      },
    };

    // Mock data for each tab
    // if (tab === "pending") {
    //   mockApiResponse = {
    //     invoices: submittedInvoices || [],
    //     pagination: {
    //       current_page: 1,
    //       page_count: 1,
    //       total_pages_count: 1,
    //       total_records: 1,
    //     },
    //   };
    // } else if (tab === "approved") {
    //   mockApiResponse = {
    //     invoices: [],
    //     pagination: {
    //       current_page: 1,
    //       page_count: 1,
    //       total_pages_count: 1,
    //       total_records: 1,
    //     },
    //   };
    // } else {
    //   // Rejected
    //   mockApiResponse = {
    //     invoices: [],
    //     pagination: {
    //       current_page: 1,
    //       page_count: 1,
    //       total_pages_count: 1,
    //       total_records: 1,
    //     },
    //   };
    // }

    rawInvoices.value = mockApiResponse.invoices as Invoice[];
    paginationData.value[tab] = mockApiResponse.pagination;
  } catch (error) {
    console.error(`Failed to fetch ${tab} invoices:`, error);
    rawInvoices.value = [];
  } finally {
    isFetchingInvoices.value = false;
  }
};

onMounted(() => {
  fetchInvoices("pending");
});
</script>

<style lang="scss" scoped>
.table-section {
  @apply bg-neutral-10 p-6 sm:p-4 rounded-xl border border-grey-200/80;
}

.tabs-container {
  @apply flex items-center border-b border-b-grey-200 mb-6;

  .tab-item {
    @apply px-4 py-3 text-sm font-medium text-grey-500 border-b-2 border-transparent -mb-px transition-colors duration-200;

    &--active {
      @apply text-primary-900 border-b-primary-900;
    }
  }
}

.pagination-container {
  @apply pt-6;
}
</style>
