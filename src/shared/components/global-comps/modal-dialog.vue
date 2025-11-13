<template>
  <div class="modal-overlay" @click.self="selfCloseModal">
    <div
      class="modal-outer-container"
      :class="[
        place_center && 'modal-center-placement',
        place_side && 'modal-right-placement',
      ]"
      @click.self="selfCloseModal"
    >
      <div
        :class="[getModalWrapperStyle, place_side ? 'ml-auto' : 'mx-auto']"
        class="modal-cover shadow-md px-0 mx-auto"
      >
        <div class="modal-cover-body-wrapper px-0">
          <!-- DISMISS DIALOG -->
          <div
            v-if="show_close_btn"
            class="dialog-dismiss cursor-pointer z-10"
            @click="$emit('closeModal')"
            title="Close"
          >
            <div class="wrapper relative w-full h-full">
              <div class="icon icon-times"></div>
            </div>
          </div>

          <!-- MODAL COVER CONTAINER  -->
          <div class="modal-cover-container" :class="modal_style.background">
            <!-- MODAL COVER HEADER -->
            <slot name="modal-cover-header"></slot>

            <!-- MODAL COVER BODY -->
            <slot name="modal-cover-body"></slot>

            <!-- MODAL COVER FOOTER  -->
            <slot name="modal-cover-footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ModalDialog",

  props: {
    modal_style: {
      type: Object,
      default: () => ({
        shape: "rounded-lg",
        size: "modal-sm", //Refer to Modal.scss for more modal sizes
        background: "bg-neutral-10",
      }),
    },

    show_close_btn: {
      type: Boolean,
      default: true,
    },

    trigger_self_close: {
      type: Boolean,
      default: true,
    },

    place_center: {
      type: Boolean,
      default: false,
    },

    place_side: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    getModalWrapperStyle() {
      return `${this.modal_style.shape || "rounded-2xl"} ${
        this.modal_style.size || "modal-lg"
      } ${this.modal_style.background || "bg-neutral-10"}`;
    },
  },

  mounted() {
    document.querySelector("body").style.overflow = "hidden";
  },

  unmounted() {
    document.querySelector("body").style.overflow = "auto";
  },

  methods: {
    selfCloseModal() {
      if (this.trigger_self_close) this.$emit("closeModal");
    },
  },
};
</script>

<style lang="scss"></style>
