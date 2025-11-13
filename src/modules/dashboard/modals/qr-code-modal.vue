<template>
  <ModalDialog @closeModal="$emit('closeTriggered')">
    <!-- MODAL COVER HEADER -->
    <template #modal-cover-header>
      <div class="modal-cover-header min-w-[300px]">
        <div class="modal-cover-title">Invoice QR Code</div>
      </div>
    </template>

    <template #modal-cover-body>
      <div class="modal-cover-body mt-0.5 pb-2">
        <!-- Loading State -->
        <div v-if="isLoading" class="qr-loading-container">
          <div class="spinner"></div>
          <p class="loading-text">Loading QR Code...</p>
        </div>

        <!-- QR Code Display -->
        <div v-else-if="qrCodeData" class="qr-content-container">
          <!-- IRN Display -->
          <div class="irn-display">
            <span class="irn-label">Invoice Reference Number</span>
            <span class="irn-value">{{ qrCodeData.irn }}</span>
          </div>

          <!-- QR Code Image -->
          <div class="qr-image-container">
            <img
              :src="qrCodeData.qrCodeDataUrl"
              alt="Invoice QR Code"
              class="qr-image"
            />
          </div>

          <!-- Scan Instruction -->
          <p class="scan-instruction">
            Send this QR Code to your customer<br />
            to Scan using the MBS App
          </p>
        </div>

        <!-- Error State -->
        <div v-else class="error-container">
          <div class="error-icon">⚠️</div>
          <p class="error-text">Failed to load QR code</p>
        </div>
      </div>
    </template>

    <!-- MODAL COVER FOOTER -->
    <template #modal-cover-footer>
      <!-- <div class="modal-cover-footer -mt-2">
        <button
          class="btn btn-secondary w-full"
          @click="$emit('closeTriggered')"
        >
          Close
        </button>
      </div> -->
    </template>
  </ModalDialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import ModalDialog from "@/shared/components/global-comps/modal-dialog.vue";
import { useDashboardStore } from "@/modules/dashboard/store";

interface QrCodeResponse {
  requestId: string;
  irn: string;
  qrCodeDataUrl: string;
}

const emits = defineEmits(["closeTriggered"]);

const props = defineProps({
  irn: {
    type: String,
    required: true,
  },
});

const { getQrCode } = useDashboardStore();

const isLoading = ref<boolean>(true);
const qrCodeData = ref<QrCodeResponse | null>(null);

const fetchInvoiceQrCode = async () => {
  isLoading.value = true;

  try {
    const response = await getQrCode(props.irn);

    if (response.status === 200) {
      qrCodeData.value = response.data;
    }
  } catch (error) {
    console.error("Failed to fetch QR code:", error);
    qrCodeData.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => fetchInvoiceQrCode());
</script>

<style lang="scss" scoped>
/* Loading State */
.qr-loading-container {
  @apply flex flex-col items-center justify-center py-12;
}

.spinner {
  @apply w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin;
}

.loading-text {
  @apply mt-4 text-sm text-gray-600;
}

/* QR Code Content */
.qr-content-container {
  @apply flex flex-col items-center py-6 px-4;
}

/* IRN Display */
.irn-display {
  @apply flex flex-col items-center gap-2 mb-6 w-full;
}

.irn-label {
  @apply text-xs font-medium text-gray-500 uppercase tracking-wide;
}

.irn-value {
  @apply text-lg font-semibold text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200;
}

/* QR Code Image */
.qr-image-container {
  @apply bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4;
}

.qr-image {
  @apply w-64 h-64 object-contain;
}

/* Scan Instruction */
.scan-instruction {
  @apply text-sm text-gray-600 text-center;
}

/* Error State */
.error-container {
  @apply flex flex-col items-center justify-center py-12;
}

.error-icon {
  @apply text-4xl mb-3;
}

.error-text {
  @apply text-sm text-red-600 font-medium;
}
</style>
