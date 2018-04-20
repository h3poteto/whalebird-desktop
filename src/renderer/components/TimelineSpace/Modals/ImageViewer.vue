<template>
<transition name="image-viewer">
  <div id="image" v-if="modalOpen">
    <div class="image-wrapper" @keyup.esc.exact="close" tabindex="-1" ref="wrapper">
      <div class="image-header">
        <el-button type="text" icon="el-icon-close" @click="close" class="close-button"></el-button>
      </div>
      <div class="image-content">
        <img :src="imageURL">
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'image-viewer',
  computed: {
    ...mapState({
      modalOpen: state => state.TimelineSpace.Modals.ImageViewer.modalOpen,
      imageURL: state => state.TimelineSpace.Modals.ImageViewer.imageURL
    })
  },
  updated () {
    if (this.modalOpen) {
      this.$refs.wrapper.focus()
    }
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Modals/ImageViewer/closeModal')
    }
  }
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  outline: 0;

  .image-header {
    width: 100%;
    text-align: right;
    padding: 8px 8px 0 0 ;
    color: #409eff;
    box-sizing: border-box;
    position: fixed;

    .close-button {
      font-size: 24px;
    }
  }

  .image-content {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      max-width: 80%;
      max-height: 80%;
    }
  }
}

.image-viewer-enter-active, .image-viewer-leave-active {
  transition: opacity 0.5s;
}
.image-viewer-enter, .image-viewer-leave-to {
  opacity: 0;
}
</style>
