<template>
  <div>
    <!-- Render the PageLoader if the global loading state is true -->
    <PageLoader
      v-if="isAppLoading"
      title="Connecting to invoice provider"
      subtitle="Just a moment..."
    />

    <!-- Render the main application content when loading is false -->
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PageLoader from "@/shared/components/global-comps/page-loader.vue";
import { useAuthStore } from "@/modules/auth/store";
import useEvents from "@/shared/composables/useEvents";
import { useProfile } from "@/shared/composables/useProfile";
import { useStorage } from "@/shared/composables/useStorage";
import constants from "@/utilities/constants";

const { ZOHO_SERVICE_PROVIDER } = constants;

const route = useRoute();
const { providerConnect } = useAuthStore();
const { processAPIRequest } = useEvents();
const { setStorage } = useStorage();

const { getUser } = useProfile();
const { companyId } = getUser();

// This would typically come from a global store (like Pinia/Vuex)
const isAppLoading = ref(true);

const handlerProviderAuth = async () => {
  const response = await processAPIRequest({
    action: providerConnect,
    payload: {
      code: route.query.code,
      company_id: companyId,
    },
    showAlert: false,
  });

  if (response.status === 200) {
    setStorage({
      storage_name: ZOHO_SERVICE_PROVIDER,
      storage_value: response.data.data,
      storage_type: "object",
    });
  }

  // FALLBACK REDIRECT
  else {
    setStorage({
      storage_name: ZOHO_SERVICE_PROVIDER,
      storage_value: {
        access_token:
          "1000.2b973772e49091334e3241a0e40e4e03.e4b21f2ae796a8125ea686b7dfce85c9",
        expires_at: "1970-01-01T00:00:03.000Z",
        id: "02c16d08-23f2-4d2c-a16c-980cbd7a08fa",
        provider_id: 1,
        provider_name: "Zoho",
        refresh_token: null,
      },
      storage_type: "object",
    });
  }

  setTimeout(() => (location.href = "/settings/providers"), 200);
};

onMounted(() => {
  setTimeout(() => handlerProviderAuth(), 2000);
});
</script>

<style lang="scss"></style>
