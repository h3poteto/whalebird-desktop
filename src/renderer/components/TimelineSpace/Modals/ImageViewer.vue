<template>
<transition name="image-viewer">
  <div id="image" v-show="modalOpen" @click="close">
    <div class="image-wrapper" @keyup.esc.exact="close" tabindex="-1" ref="wrapper">
      <div class="image-header">
        <el-button type="text" icon="el-icon-close" @click="close" class="close-button"></el-button>
      </div>
      <div class="image-content">
        <span class="button-area"><el-button type="text" v-show="showLeft" v-shortkey="['arrowleft']" @shortkey.native="decrementIndex()"><i class="el-icon-arrow-left" @click.stop="decrementIndex"></i></el-button></span>
        <Media :src="imageURL"></Media>
        <span class="button-area"><el-button type="text" v-show="showRight" v-shortkey="['arrowright']" @shortkey.native="incrementIndex()"><i class="el-icon-arrow-right" @click.stop="incrementIndex"></i></el-button></span>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import Media from './Media'
import { mapState } from 'vuex'

export default {
  name: 'image-viewer',
  components: {
    Media
  },
  computed: {
    ...mapState({
      modalOpen: state => state.TimelineSpace.Modals.ImageViewer.modalOpen
    }),
    imageURL () {
      return this.$store.getters['TimelineSpace/Modals/ImageViewer/imageURL']
    },
    showLeft () {
      return this.$store.getters['TimelineSpace/Modals/ImageViewer/showLeft']
    },
    showRight () {
      return this.$store.getters['TimelineSpace/Modals/ImageViewer/showRight']
    }
  },
  updated () {
    if (this.modalOpen) {
      this.$refs.wrapper.focus()
    }
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Modals/ImageViewer/closeModal')
    },
    decrementIndex () {
      if (this.showLeft) this.$store.dispatch('TimelineSpace/Modals/ImageViewer/decrementIndex')
    },
    incrementIndex () {
      if (this.showRight) this.$store.dispatch('TimelineSpace/Modals/ImageViewer/incrementIndex')
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
  }
}

.image-viewer-enter-active, .image-viewer-leave-active {
  transition: opacity 0.5s;
}
.image-viewer-enter, .image-viewer-leave-to {
  opacity: 0;
}
.button-area {
  display: inline-block;
  width: 52px;
  height: 77px;
  i {
    font-size: 50px;
  }
}
</style>
