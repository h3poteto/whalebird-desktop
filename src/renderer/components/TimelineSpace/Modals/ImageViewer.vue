<template>
<div id="image" v-if="modalOpen">
  <div class="image-wrapper" @keyup.esc.exact="close" tabindex="-1" ref="wrapper">
    <div class="image-header">
      <i class="el-icon-close" @click="close"></i>
    </div>
    <div class="image-content">
      <img :src="imageURL">
    </div>
  </div>
</div>
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
    font-size: 18px;

    i {
      font-weight: 800;
      cursor: pointer;
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
</style>
