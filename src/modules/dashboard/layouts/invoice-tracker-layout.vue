<template>
  <PageLayout
    title="Invoice Tracker"
    description="Track the real-time status of all invoices submitted to FIRS for final validation."
    :show-action-btn="false"
  >
    <!-- TABLE SECTION -->
    <div class="table-section">
      <!-- FILTER BAR -->
      <FilterBar />

      <!-- TAB BAR -->
      <TabBar :tabs="tabs" />

      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import PageLayout from "@/shared/components/global-comps/page-layout.vue";
import FilterBar from "../components/filter-bar.vue";
import TabBar from "../components/tab-bar.vue";

const tabs = [
  {
    label: "Outgoing Invoices",
    link: "/invoice-tracker/outgoing",
  },
  {
    label: "Incoming Invoices",
    link: "/invoice-tracker/incoming",
  },
];
</script>

<style lang="scss" scoped>
.table-section {
  @apply bg-neutral-10 p-6 sm:p-4 rounded-xl border border-grey-200/80;
}
</style>
