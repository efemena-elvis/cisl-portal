<template>
  <div class="dashboard-page">
    <!-- SECTION 1: STAT CARDS -->
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :description="stat.description"
        :icon="stat.icon"
        :bg-color="stat.bgColor"
      />
    </div>

    <!-- SECTION 2: LINE CHART -->
    <DashboardChart :daily-sync-data="dailySyncData" />

    <!-- SECTION 3: RECENT ACTIVITY -->
    <!-- <RecentActivity
      :recent-invoices="recentInvoices"
      :is-loading="isFetchingRecentInvoices"
    /> -->
  </div>

  <!-- <LoadApiKeys /> -->
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import StatCard from "../components/stat-card..vue";
import DashboardChart from "../components/dashboard-chart.vue";
import { useStorage } from "@/shared/composables/useStorage";
import constants from "@/utilities/constants";

// import RecentActivity from "../components/recent-activity.vue";
// import LoadApiKeys from "../components/load-api-keys.vue";

// --- INTERFACES AND TYPES ---
interface Invoice {
  id: string;
  number: string;
  customerName: string;
  date: string;
  amount: number;
  currency_code: string;
  status: string;
}

interface DailySyncData {
  date: string;
  count: number;
}

const { IMPORTED_INVOICES, TRANSFORMED_INVOICES, SUBMITTED_INVOICES } =
  constants;

const { getStorage } = useStorage();

// --- REACTIVE STATE ---
const stats = ref([
  {
    title: "Total Synced Invoices",
    value: 0,
    description: "All invoices synced from ERP",
    icon: "icon-document-text",
    bgColor: "bg-blue-100",
  },
  {
    title: "Pending IRN",
    value: 0,
    description: "Invoices ready for IRN generation",
    icon: "icon-pen-edit",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Pending Submission",
    value: 0,
    description: "Invoices with IRN ready for FIRS",
    icon: "icon-shield-tick",
    bgColor: "bg-teal-100",
  },
  {
    title: "Approved by FIRS",
    value: 0,
    description: "Invoices successfully approved",
    icon: "icon-tick-circle",
    bgColor: "bg-green-100",
  },
]);
const recentInvoices = ref<Invoice[]>([]);
const dailySyncData = ref<DailySyncData[]>([]);
const isFetchingRecentInvoices = ref<boolean>(true); // This can be renamed to a general `isLoading`

const getLength = (data: unknown): number =>
  Array.isArray(data) ? data.length : 0;

const getImportedInvoices = computed(() => {
  return getStorage({
    storage_name: IMPORTED_INVOICES,
    storage_type: "array",
  });
});

const getTransformedInvoices = computed(() => {
  return getStorage({
    storage_name: TRANSFORMED_INVOICES,
    storage_type: "array",
  });
});

const getSubmittedInvoices = computed(() => {
  return getStorage({
    storage_name: SUBMITTED_INVOICES,
    storage_type: "array",
  });
});

const getTotalSyncedInvoices = computed(() => {
  return (
    getLength(getImportedInvoices.value) +
    getLength(getTransformedInvoices.value) +
    getLength(getSubmittedInvoices.value)
  );
});

const getTotalPendingIRNInvoices = computed(() => {
  return getLength(getImportedInvoices.value);
});

const getTotalPendingSubmissionInvoices = computed(() => {
  return getLength(getTransformedInvoices.value);
});

// const getTotalApprovedByFirsInvoices = computed(() => {
//   return getLength(getSubmittedInvoices.value);
// });

// --- HELPER: Generate current week (Sunday to Saturday) ---
const generateCurrentWeek = (todayCount: number): DailySyncData[] => {
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  // Calculate Sunday of current week
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - currentDayOfWeek);

  const weekData: DailySyncData[] = [];

  // Generate 7 days (Sunday to Saturday)
  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);

    const monthShort = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();

    weekData.push({
      date: `${monthShort} ${day}`,
      count: i === currentDayOfWeek ? todayCount : 0,
    });
  }

  return weekData;
};

// --- API LOGIC (MOCKED) ---
const fetchDashboardData = async () => {
  isFetchingRecentInvoices.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockApiResponse = {
      stats: {
        totalSynced: getTotalSyncedInvoices.value,
        pendingIrn: getTotalPendingIRNInvoices.value,
        pendingSubmission: getTotalPendingSubmissionInvoices.value,
        approvedByFirs: 0,
      },
      dailySync: generateCurrentWeek(getTotalSyncedInvoices.value),
      recentInvoices: [],
    };

    stats.value[0].value = mockApiResponse.stats.totalSynced;
    stats.value[1].value = mockApiResponse.stats.pendingIrn;
    stats.value[2].value = mockApiResponse.stats.pendingSubmission;
    stats.value[3].value = mockApiResponse.stats.approvedByFirs;
    dailySyncData.value = mockApiResponse.dailySync;
    recentInvoices.value = mockApiResponse.recentInvoices;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  } finally {
    isFetchingRecentInvoices.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  @apply pt-2.5 pb-8 flex flex-col gap-y-9;
}
.stats-grid {
  @apply grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 gap-5;
}
</style>
