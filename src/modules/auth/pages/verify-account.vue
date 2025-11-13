<template>
  <AuthWrapper
    title_text="Verify Business Account"
    description_text="A verification code has been sent to your email address. Please enter the code below to verify your account."
  >
    <form @submit.prevent="handleAccountVerification">
      <!-- EMAIL ADDRESS -->
      <OTPFieldInput :otpFields="6" @otpChanged="handleOTPChange" />

      <button
        class="btn btn-primary w-full mt-6"
        ref="otpBtnRef"
        :disabled="isOTPReady"
      >
        Verify Account
      </button>
    </form>
  </AuthWrapper>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/modules/auth/store";
import useEvents from "@/shared/composables/useEvents";
import AuthWrapper from "@/modules/auth/components/auth-wrapper.vue";
import OTPFieldInput from "@/shared/components/form-comps/otp-field-input.vue";

type IOTPInputType = {
  user_id: string;
  otp_code: string;
};

const otpPayload = ref<IOTPInputType>({
  user_id: "",
  otp_code: "",
});

const route = useRoute();
const otpBtnRef = ref(null);

const { verifyAccount } = useAuthStore();
const { processAPIRequest } = useEvents();

const isOTPReady = computed(() => {
  return otpPayload.value.otp_code ? false : true;
});

const handleOTPChange = (otp: string) => {
  otpPayload.value.otp_code = otp;
};

const handleAccountVerification = async () => {
  const response = await processAPIRequest({
    action: verifyAccount,
    payload: otpPayload.value,
    btnRef: otpBtnRef,
    btnText: "Verify Account",
    alertHandler: {
      200: {
        message: "Account verified!",
        description: "You can now login to your dashboard.",
        type: "success",
      },
      201: {
        message: "Account verified!",
        description: "You can now login to your dashboard.",
        type: "success",
      },
      400: {
        message: "Account verification failed",
        description: "Please try again.",
        type: "error",
      },
    },
  });

  if (response.status === 201 || response.status === 200) {
    setTimeout(() => {
      location.href = "/login";
    }, 2000);
  }
};

onMounted(() => {
  if (route.params.user_id) {
    otpPayload.value.user_id = route.params.user_id as string;
  }
});
</script>
