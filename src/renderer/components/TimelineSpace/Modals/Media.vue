<template>
  <div
    id="current-media"
    v-loading="loading"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <video :src="src" v-if="isMovieFile()" controls v-on:loadstart="loaded()"></video>
    <video :src="src" v-else-if="isGIF()" autoplay loop v-on:loadstart="loaded()"></video>
    <img :src="src" v-else v-on:load="loaded()">
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    src: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState({
      loading: state => state.TimelineSpace.Modals.ImageViewer.loading
    })
  },
  methods: {
    isMovieFile () {
      return ['video'].includes(this.type)
    },
    isGIF () {
      return ['gifv'].includes(this.type)
    },
    async loaded () {
      this.$store.dispatch('TimelineSpace/Modals/ImageViewer/loaded')
    }
  }
}
</script>

<style lang="scss" scoped>
#current-media {
  max-width: 80%;
  min-width: 10%;
  height: 80%;
  display: inline-flex;

  img,
  video {
    max-height: 100%;
    max-width: 100%;
    align-self: center;
  }
}
</style>
