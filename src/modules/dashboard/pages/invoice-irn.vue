<template>
  <PageLayout
    title="Invoice Imports"
    description="All synchronized invoices will appear here."
    :show-action-btn="true"
    action-text="Manual Sync"
    :is-action-loading="isSyncing"
    @on-action-clicked="handleManualSync"
  >
    <!-- TABLE SECTION -->
    <div class="table-section">
      <!-- FILTER BAR -->
      <FilterBar />

      <!-- CONTEXTUAL ACTION BAR -->
      <ContextualActionBar
        v-if="selectedInvoices.length"
        :selection-count="selectedInvoices.length"
        :show-primary-action="true"
        :show-secondary-action="false"
        :is-primary-loading="isTransformingInvoice"
        primary-action-text="Transform Selected Invoice(s)"
        @primary-action-clicked="handleBulkGenerateIRN"
      />

      <!-- TABLE CONTAINER -->
      <TableContainer
        :table-header="tableHeader"
        :table-body="invoicesForTable"
        :is-loading="isFetchingInvoices"
        :empty-data="emptyDataConfig"
        :show-checkbox="true"
        :is-checked="isAllSelected"
        @checkboxChange="toggleSelectAll"
      >
        <TableContainerBody
          v-for="(invoice, index) in invoicesForTable"
          :key="index"
          :table-header="tableHeader"
          :table-data="invoice"
          :show-checkbox="true"
          :is-checked="isAllSelected || selectedInvoices.includes(invoice.id)"
          @checkboxRowChange="toggleSelection(invoice.id)"
        />
      </TableContainer>

      <!-- PAGINATION -->
      <div
        v-if="!isFetchingInvoices && paginationData.total_records > 0"
        class="pagination-container"
      >
        <Pagination
          :page-description="paginationDescription"
          :paging-data="paginationData"
        />
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, h, watch, toRaw } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useString } from "@/shared/composables/useString";
import useEvents from "@/shared/composables/useEvents";
import dateUtil from "@/shared/composables/useDate";
import { useDashboardStore } from "@/modules/dashboard/store";
import { Invoice } from "@/models/invoice-type";
// Import all components
import PageLayout from "@/shared/components/global-comps/page-layout.vue";
import TableContainer from "@/shared/components/table-comps/table-container.vue";
import TableContainerBody from "@/shared/components/table-comps/table-container-body.vue";
import TableActionBtn from "@/shared/components/table-comps/table-action-btn.vue";
import Pagination from "@/shared/components/global-comps/pagination.vue";
import FilterBar from "../components/filter-bar.vue";
import ContextualActionBar from "../components/contextual-action-bar.vue";

// --- INTERFACES AND TYPES ---
interface IPaging {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_records: number;
}

// --- COMPOSABLES ---
const route = useRoute();

const { fetchBusinessInvoices, transformBusinessInvoice } = useDashboardStore();
const { importedInvoices } = storeToRefs(useDashboardStore());

const { processAPIRequest, pushToastAlert } = useEvents();

const { getBoldTableText, getStatus, formatNumber } = useString();

// --- REACTIVE STATE ---
const isSyncing = ref(false);
const isFetchingInvoices = ref(true);
const isTransformingInvoice = ref(false);
const activeInvoiceId = ref<string | null>(null);

const rawInvoices = ref<Invoice[]>([]);
const selectedInvoices = ref<string[]>([]);

const paginationData = ref<IPaging>({
  current_page: 1,
  page_count: 0,
  total_pages_count: 1,
  total_records: 0,
});

// --- WATCHER FOR ROUTE-DRIVEN DATA FETCHING ---
watch(
  () => route.query,
  () => {
    fetchInvoices();
  },
  { deep: true }
);

watch(importedInvoices, (newValue) => {
  if (newValue) {
    rawInvoices.value = newValue as Invoice[];
  }
});

const getInvoiceDate = (date: string) => {
  let { m4, d3, y1 } = dateUtil.formatDate(date).getAll();
  return `${m4} ${d3}, ${y1}`;
};

// --- METHODS ---
const fetchInvoices = async () => {
  isFetchingInvoices.value = true;
  selectedInvoices.value = [];
  try {
    const { search, filter, page } = route.query;

    const response = await processAPIRequest({
      action: fetchBusinessInvoices,
      payload: {},
    });

    console.log("response......", response);

    const mockApiResponse = {
      invoices: importedInvoices.value || [],
      pagination: {
        current_page: Number(page) || 1,
        page_count: response.data.imported?.length || 0,
        total_pages_count: 1,
        total_records: response.data.imported?.length || 0,
      },
    };

    rawInvoices.value = mockApiResponse.invoices as Invoice[];
    paginationData.value = mockApiResponse.pagination;
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    rawInvoices.value = [];
    paginationData.value.total_records = 0;
  } finally {
    isFetchingInvoices.value = false;
  }
};

const handleManualSync = async () => {
  isSyncing.value = true;
  await fetchInvoices();
  isSyncing.value = false;
};

const handleSingleInvoiceTransform = async (invoice: Invoice) => {
  await transformInvoice(invoice);
};

const handleBulkGenerateIRN = async () => {};

const transformInvoice = async (invoice: Invoice) => {
  // isTransformingInvoice.value = true;

  const invoiceId = invoice.invoice_id;
  const invoiceNumber = invoice.invoice_number;

  activeInvoiceId.value = invoiceId;

  try {
    const response = await processAPIRequest({
      action: transformBusinessInvoice,
      payload: { invoiceId },
    });

    if (response.status === 200) {
      pushToastAlert({
        type: "success",
        message: `Invoice No: ${invoiceNumber} transformed successfully!`,
      });
    }
  } catch (error) {
    console.error("Failed to generate IRN:", error);
  } finally {
    // isTransformingInvoice.value = false;
    activeInvoiceId.value = null;
  }
};

const toggleSelection = (invoiceId: string) => {
  const index = selectedInvoices.value.indexOf(invoiceId);
  if (index > -1) {
    selectedInvoices.value.splice(index, 1);
  } else {
    selectedInvoices.value.push(invoiceId);
  }
};

const toggleSelectAll = (event: boolean): void => {
  selectedInvoices.value = event
    ? rawInvoices.value.map((inv) => inv.invoice_id)
    : [];
};

onMounted(() => {
  fetchInvoices();
});

// --- TABLE CONFIG, COMPUTED PROPERTIES, HELPERS ---
const tableHeader = ref([
  { slug: "date", title: "Date Created" },
  { slug: "number", title: "Invoice #" },
  { slug: "customerName", title: "Customer Name" },
  { slug: "amount", title: "Amount" },
  { slug: "status", title: "Status" },
  { slug: "action", title: "Actions" },
]);

const emptyDataConfig = {
  title: "No Invoice Available!",
  description:
    "All of your synced invoices have been processed. Sync again to check for new ones.",
  actionText: "Sync Now",
};

const invoicesForTable = computed(() => {
  return rawInvoices.value.map((invoice) => ({
    id: invoice.invoice_id,
    date: getInvoiceDate(invoice.date),
    number: getBoldTableText(invoice.invoice_number),
    customerName: invoice.customer_name,
    amount: getBoldTableText(
      `${invoice.currency_code} ${formatNumber(invoice.total)}`
    ),
    status: getStatus("pending", "Pending"),
    action: h(TableActionBtn, {
      key: invoice.invoice_id,
      showPrimaryBtn: true,
      showSecondaryBtn: false,
      primaryBtnText: "Transform",
      isSecondaryActionDelete: false,
      isActionLoading: activeInvoiceId.value === invoice.invoice_id,
      onPrimaryActionClicked: () => handleSingleInvoiceTransform(invoice),
      onSecondaryActionClicked: () => {},
    }),
  }));
});

const isAllSelected = computed(() => {
  return (
    rawInvoices.value.length > 0 &&
    selectedInvoices.value.length === rawInvoices.value.length
  );
});

const paginationDescription = computed(() => {
  if (!paginationData.value.total_records) return "";

  const start =
    (paginationData.value.current_page - 1) * paginationData.value.page_count +
    1;

  const end = Math.min(
    paginationData.value.current_page * paginationData.value.page_count,
    paginationData.value.total_records
  );

  return `Showing ${start}-${end} of ${paginationData.value.total_records} invoices`;
});
</script>

<style lang="scss" scoped>
.table-section {
  @apply bg-neutral-10 p-5 sm:p-4 rounded-xl border border-grey-200/65;
}

.pagination-container {
  @apply pt-6;
}
</style>
