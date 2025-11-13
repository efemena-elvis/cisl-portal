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
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useString } from "@/shared/composables/useString";
import dateUtil from "@/shared/composables/useDate";
import TableContainer from "@/shared/components/table-comps/table-container.vue";
import TableContainerBody from "@/shared/components/table-comps/table-container-body.vue";
import Pagination from "@/shared/components/global-comps/pagination.vue";
import { useDashboardStore } from "@/modules/dashboard/store";
import { Invoice } from "@/models/invoice-type";
import { storeToRefs } from "pinia";

// --- INTERFACES AND TYPES ---
interface IPaging {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_records: number;
}

// --- COMPOSABLES ---
const { getBoldTableText, getStatus, maskCode, formatNumber } = useString();

const { fetchIncomingInvoices } = useDashboardStore();
const { submittedInvoices } = storeToRefs(useDashboardStore());

// --- REACTIVE STATE ---
const isFetchingInvoices = ref(true);
const activeTab = ref<"pending" | "approved" | "rejected">("pending");
const rawInvoices = ref<any[]>([]);

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
  { slug: "created_at", title: "Created At" },
  { slug: "id", title: "Id" },
  { slug: "provider", title: "Provider" },
  { slug: "irn", title: "IRN #" },
  { slug: "status", title: "Payment Status" },
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
  title: `No Incoming Invoices`,
  description: `All incoming invoices will appear here.`,
}));

const getInvoiceDate = (date: string) => {
  let { m4, d3, y1 } = dateUtil.formatDate(date).getAll();
  return `${m4} ${d3}, ${y1}`;
};

// --- COMPUTED PROPERTIES ---
const invoicesForTable = computed(() => {
  return rawInvoices.value.map((invoice, index) => ({
    no: index + 1,
    created_at: getInvoiceDate(invoice.createdAt),
    id: maskCode(invoice.id) || "------",
    provider: invoice.provider,
    irn: invoice.irn,
    status: getStatus(
      invoice.paymentStatus.toLowerCase() === "received"
        ? "success"
        : invoice.paymentStatus === "Rejected"
          ? "failed"
          : "pending",
      invoice.paymentStatus
    ),
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
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = await fetchIncomingInvoices();
    console.log(response.data);

    const mockApiResponse = {
      invoices: response.data.data,
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

    rawInvoices.value = mockApiResponse.invoices as any[];
    console.log("RAW===>", rawInvoices.value);
    paginationData.value[tab] = mockApiResponse.pagination;
  } catch (error) {
    console.error(`Failed to fetch incoming invoices:`, error);
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
