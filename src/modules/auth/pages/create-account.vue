<template>
  <AuthWrapper title_text="Provide your Business Details">
    <form @submit.prevent="handleUserSignup">
      <!-- FIRST SECTION -->
      <template v-if="activeSection === 'section-one'">
        <!-- BUSINESS NAME -->
        <TextFieldInput
          labelId="businessName"
          labelTitle="Business Name"
          :inputType="IInputType.Text"
          :inputValue="signupPayload.business_name"
          inputPlaceholder="Provide a business name"
          isRequired
          @inputChanged="signupPayload.business_name = $event"
          @inputValidated="payloadValidity.business_name = $event"
          :errorHandler="{
            validator: 'validateRequired',
            message: 'Business name is a required field',
          }"
        />

        <!-- EMAIL ADDRESS -->
        <TextFieldInput
          labelId="businessEmail"
          labelTitle="Email address"
          :inputType="IInputType.Email"
          :inputValue="signupPayload.email"
          inputPlaceholder="hello@companyname.com"
          isRequired
          @inputChanged="signupPayload.email = $event"
          @inputValidated="payloadValidity.email = $event"
          :errorHandler="{
            validator: 'validateEmail',
          }"
        />

        <!-- PASSWORD -->
        <TextFieldInput
          labelId="userPassword"
          labelTitle="Choose a password"
          :inputType="IInputType.Password"
          :inputValue="signupPayload.password"
          inputPlaceholder="Please enter your password"
          isRequired
          @inputChanged="signupPayload.password = $event"
          @inputValidated="payloadValidity.password = $event"
          :errorHandler="{
            validator: 'validatePasswordStrength',
          }"
        />
      </template>

      <!-- SECOND SECTION -->
      <template v-else>
        <!-- BUSINESS TIN NUMBER -->
        <TextFieldInput
          labelId="tinNumber"
          labelTitle="Tax Identification Number (TIN)"
          :inputType="IInputType.Text"
          :inputValue="signupPayload.tin_number"
          inputPlaceholder="Provide a tax identification number"
          isRequired
          @inputChanged="signupPayload.tin_number = $event"
          @inputValidated="payloadValidity.tin_number = $event"
          :errorHandler="{
            validator: 'validateRequired',
            message: 'Business TIN is a required field',
          }"
        />

        <!-- BUSINESS RC NUMBER -->
        <TextFieldInput
          labelId="rcNumber"
          labelTitle="Registration Certificate (RC) Number"
          :inputType="IInputType.Text"
          :inputValue="signupPayload.rc_number"
          inputPlaceholder="Provide a registration certificate number"
          isRequired
          @inputChanged="signupPayload.rc_number = $event"
          @inputValidated="payloadValidity.rc_number = $event"
          :errorHandler="{
            validator: 'validateRequired',
            message: 'Business RC is a required field',
          }"
        />

        <!-- TAXPAYER ENTITY -->
        <TextFieldInput
          labelId="taxpayerEntity"
          labelTitle="Taxpayer Entity ID"
          :inputType="IInputType.Text"
          :inputValue="signupPayload.taxpayer_entity"
          inputPlaceholder="Provide a taxpayer entity ID"
          isRequired
          @inputChanged="signupPayload.taxpayer_entity = $event"
          @inputValidated="payloadValidity.taxpayer_entity = $event"
          :errorHandler="{
            validator: 'validateRequired',
            message: 'Taxpayer entity ID is a required field',
          }"
        />
      </template>

      <button
        class="btn btn-primary w-full -mt-1"
        ref="signupBtnRef"
        :disabled="isSignupReady"
      >
        {{ activeSection === "section-one" ? "Continue" : "Create Account" }}
      </button>
    </form>
  </AuthWrapper>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { IInputType } from "@/models/form-type";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/modules/auth/store";
import useEvents from "@/shared/composables/useEvents";
import AuthWrapper from "@/modules/auth/components/auth-wrapper.vue";
import TextFieldInput from "@/shared/components/form-comps/text-field-input.vue";

type ISignupInputType = {
  business_name: string;
  email: string;
  password: string;
  tin_number: string;
  rc_number: string;
  taxpayer_entity: string;
};

type IInputValidity = {
  business_name: boolean;
  email: boolean;
  password: boolean;
  rc_number: boolean;
  tin_number: boolean;
  taxpayer_entity: boolean;
};

const signupPayload = ref<ISignupInputType>({
  business_name: "",
  email: "",
  password: "",
  tin_number: "",
  rc_number: "",
  taxpayer_entity: "",
});

const payloadValidity = ref<IInputValidity>({
  business_name: false,
  email: false,
  password: false,
  tin_number: false,
  rc_number: false,
  taxpayer_entity: false,
});

const router = useRouter();
const signupBtnRef = ref(null);

const activeSection = ref<"section-one" | "section-two">("section-one");

const { signupUser } = useAuthStore();
const { processAPIRequest } = useEvents();

const isSignupReady = computed(() => {
  if (activeSection.value === "section-one") {
    return signupPayload.value.business_name &&
      signupPayload.value.email &&
      signupPayload.value.password &&
      payloadValidity.value.business_name &&
      payloadValidity.value.email &&
      payloadValidity.value.password
      ? false
      : true;
  }

  return signupPayload.value.tin_number &&
    signupPayload.value.rc_number &&
    payloadValidity.value.tin_number &&
    payloadValidity.value.rc_number &&
    payloadValidity.value.taxpayer_entity
    ? false
    : true;
});

const getSignupPayload = computed(() => {
  const {
    business_name,
    email,
    password,
    tin_number,
    rc_number,
    taxpayer_entity,
  } = signupPayload.value;
  return {
    company_name: business_name,
    email_address: email,
    tin: tin_number,
    rc_number,
    taxpayer_entity,
    password,
    business_type_id: 2,
    phone_number: "",
    first_name: "",
    last_name: "",
  };
});

const handleUserSignup = async () => {
  if (activeSection.value === "section-one") {
    activeSection.value = "section-two";
    return;
  }

  const response = await processAPIRequest({
    action: signupUser,
    payload: getSignupPayload.value,
    btnRef: signupBtnRef,
    btnText: "Create account",
    showAlert: true,
    alertHandler: {
      201: {
        message: "Business account created",
        description: "Proceed to verify your account email address",
        type: "success",
      },
      400: {
        message: "Account creation failed",
        type: "error",
      },
    },
  });

  // REDIRECT TO EMAIL VERIFICATION PAGE
  if (response.status === 201) {
    const { user_id } = response.data.data;

    setTimeout(() => {
      router.push({
        name: "VerifyAccount",
        params: { user_id: encodeURIComponent(user_id) },
      });

      localStorage.clear();
    }, 2000);
  }
};
</script>
