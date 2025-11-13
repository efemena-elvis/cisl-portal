<template>
  <!-- CONTEXTUAL ACTION BAR -->
  <ContextualActionBar
    v-if="selectedInvoices.length"
    :selection-count="selectedInvoices.length"
    :show-primary-action="true"
    :show-secondary-action="false"
    :is-primary-loading="isSubmitting"
    :is-secondary-loading="false"
    primary-action-text="Submit Selected invoice(s)"
    @primary-action-clicked="handleBulkSubmit"
  />

  <!-- TABLE SECTION -->
  <TableContainer
    :table-header="validTableHeader"
    :table-body="validInvoicesForTable"
    :is-loading="isFetchingInvoices"
    :empty-data="validEmptyDataConfig"
    :show-checkbox="true"
    :is-checked="isAllValidSelected"
    @checkboxChange="toggleSelectAll"
  >
    <!-- The v-for loop correctly iterates over the formatted data -->
    <TableContainerBody
      v-for="(invoice, index) in validInvoicesForTable"
      :key="index"
      :table-header="validTableHeader"
      :table-data="invoice"
      :show-checkbox="true"
      :is-checked="isAllValidSelected || selectedInvoices.includes(invoice.id)"
      @checkboxRowChange="toggleSelection(invoice.id)"
    />
  </TableContainer>

  <div
    v-if="!isFetchingInvoices && validPaginationData.total_records > 0"
    class="pagination-container"
  >
    <Pagination
      :page-description="validPaginationDesc"
      :paging-data="validPaginationData"
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
import { ref, onMounted, computed, h, toRaw, watch } from "vue";
import { storeToRefs } from "pinia";
import { useString } from "@/shared/composables/useString";
import dateUtil from "@/shared/composables/useDate";
import TableContainer from "@/shared/components/table-comps/table-container.vue";
import TableContainerBody from "@/shared/components/table-comps/table-container-body.vue";
import Pagination from "@/shared/components/global-comps/pagination.vue";
import ContextualActionBar from "../components/contextual-action-bar.vue";
import TableActionBtn from "@/shared/components/table-comps/table-action-btn.vue";
import TableLink from "@/shared/components/table-comps/table-link.vue";
import { useDashboardStore } from "@/modules/dashboard/store";
import { Invoice } from "@/models/invoice-type";
import useEvents from "@/shared/composables/useEvents";
import QrCodeModal from "@/modules/dashboard/modals/qr-code-modal.vue";

// --- INTERFACES AND TYPES ---
interface IPaging {
  current_page: number;
  page_count: number;
  total_pages_count: number;
  total_records: number;
}

// --- COMPOSABLES ---
const { getBoldTableText, maskCode, formatNumber } = useString();

const { submitBusinessInvoice } = useDashboardStore();
const { transformedInvoices } = storeToRefs(useDashboardStore());

const { processAPIRequest, pushToastAlert } = useEvents();

// --- REACTIVE STATE ---
const isFetchingInvoices = ref(true);
const isSubmitting = ref(false);
const activeInvoiceId = ref<string | null>(null);

const rawValidInvoices = ref<Invoice[]>([]);
const selectedInvoices = ref<string[]>([]);

// --- PAGINATION STATE ---
const validPaginationData = ref<IPaging>({
  current_page: 1,
  page_count: 0,
  total_pages_count: 1,
  total_records: 0,
});

const selectedInvoiceIRN = ref<string>("");

const showQrCodeModal = ref(false);

const toggleQrCodeModal = (irn: string) => {
  selectedInvoiceIRN.value = irn;
  showQrCodeModal.value = true;
};

const validPaginationDesc = computed(
  () =>
    `Showing ${validPaginationData.value.total_records > 0 ? 1 : 0}-${rawValidInvoices.value.length} of ${validPaginationData.value.total_records} invoices`
);

// --- TABLE CONFIGURATION ---.;
const validTableHeader = ref([
  // { slug: "date", title: "Date" },
  { slug: "number", title: "Invoice #" },
  { slug: "customer", title: "Customer Name" },
  { slug: "amount", title: "Amount" },
  { slug: "irn", title: "IRN #" },
  { slug: "pdf", title: "Invoice (PDF)" },
  { slug: "action", title: "Action" },
]);

const validEmptyDataConfig = {
  title: "No Invoices Ready",
  description:
    "Invoices with a valid IRN will appear here, ready for submission to FIRS.",
};

// --- COMPUTED PROPERTIES ---
const isAllValidSelected = computed(
  () =>
    rawValidInvoices.value.length > 0 &&
    selectedInvoices.value.length === rawValidInvoices.value.length
);

const getInvoiceDate = (date: string) => {
  let { m4, d3, y1 } = dateUtil.formatDate(date).getAll();
  return `${m4} ${d3}, ${y1}`;
};

const validInvoicesForTable = computed(() =>
  rawValidInvoices.value.map((invoice) => ({
    id: invoice.invoice_id,
    // date: getInvoiceDate(invoice.date),
    number: getBoldTableText(invoice.invoice_number),
    customer: invoice.customer_name,
    irn: maskCode(invoice.transformed_invoice.irn) || "------",
    amount: getBoldTableText(
      `${invoice.currency_code} ${formatNumber(invoice.total)}`
    ),
    pdf: h(TableLink, {
      linkText: "View Invoice",
      linkRoute: `/view-invoice/${invoice.invoice_id}`,
    }),
    action: h(TableActionBtn, {
      key: invoice.invoice_id,
      showPrimaryBtn: true,
      showSecondaryBtn: true,
      showSecondaryText: true,
      primaryBtnText: "Submit",
      secondaryBtnText: "View QRCode",
      secondaryBtnIcon: "",
      isSecondaryActionDelete: false,
      isActionLoading: activeInvoiceId.value === invoice.invoice_id,
      onPrimaryActionClicked: () => handleSingleSubmit(invoice),
      onSecondaryActionClicked: () =>
        toggleQrCodeModal(invoice.transformed_invoice.irn),
    }),
  }))
);

// --- SELECTION LOGIC ---
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
    ? rawValidInvoices.value.map((inv) => inv.invoice_id)
    : [];
};

const fetchInvoices = async () => {
  isFetchingInvoices.value = true;
  selectedInvoices.value = [];

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockApiResponse = {
      invoices: transformedInvoices.value || [],

      pagination: {
        current_page: 1,
        page_count: Array.isArray(transformedInvoices.value)
          ? transformedInvoices.value.length
          : 0,
        total_pages_count: 1,
        total_records: Array.isArray(transformedInvoices.value)
          ? transformedInvoices.value.length
          : 0,
      },
    };
    rawValidInvoices.value = mockApiResponse.invoices as Invoice[];
    validPaginationData.value = mockApiResponse.pagination;
  } catch (error) {
    console.error(`Failed to fetch valid invoices:`, error);
  } finally {
    isFetchingInvoices.value = false;
  }
};

const handleSingleSubmit = async (invoice: Invoice) => {
  await submitToFirs(invoice);
};

const handleBulkSubmit = async () => {
  // await submitToFirs(selectedInvoices);
};

const submitToFirs = async (invoice: Invoice) => {
  // isSubmitting.value = true;

  const invoiceId = invoice.invoice_id;
  const invoiceNumber = invoice.invoice_number;

  activeInvoiceId.value = invoiceId;

  try {
    const response = await processAPIRequest({
      action: submitBusinessInvoice,
      payload: { invoice },
    });

    if (response.status === 200) {
      pushToastAlert({
        type: "success",
        message: `Invoice No: ${invoiceNumber} submitted successfully to FIRS!`,
      });
    } else if (response.status === 400 || response.code === 400) {
      pushToastAlert({
        type: "error",
        message:
          "Unable to process your request, confirm this is not a duplicate request",
      });
    }
  } catch (error) {
    console.error("Failed to submit to FIRS:", error);
  } finally {
    // isSubmitting.value = false;
    activeInvoiceId.value = null;
  }
};

onMounted(() => {
  fetchInvoices();
});

watch(transformedInvoices, (newValue) => {
  if (newValue) {
    rawValidInvoices.value = newValue as Invoice[];
  }
});
</script>

<style lang="scss" scoped>
.pagination-container {
  @apply pt-6;
}
</style>
