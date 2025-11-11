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
import { ref, onMounted } from "vue";
import StatCard from "../components/stat-card..vue";
import DashboardChart from "../components/dashboard-chart.vue";
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

// --- API LOGIC (MOCKED) ---
const fetchDashboardData = async () => {
  isFetchingRecentInvoices.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const mockApiResponse = {
      stats: {
        totalSynced: 0,
        pendingIrn: 0,
        pendingSubmission: 0,
        approvedByFirs: 0,
      },
      dailySync: [
        { date: "Oct 1", count: 8 },
        { date: "Oct 2", count: 0 },
        { date: "Oct 3", count: 0 },
        { date: "Oct 4", count: 4 },
        { date: "Oct 5", count: 2 },
        { date: "Oct 6", count: 0 },
        { date: "Oct 7", count: 4 },
      ],
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
