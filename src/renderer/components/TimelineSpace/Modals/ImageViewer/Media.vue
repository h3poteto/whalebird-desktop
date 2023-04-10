<template>
  <div id="current-media" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0.8)">
    <video :src="imageSrc" v-if="isMovie()" autoplay loop controls v-on:loadstart="loaded()"></video>
    <video :src="imageSrc" v-else-if="isGIF()" autoplay loop v-on:loadstart="loaded()"></video>
    <video :src="imageSrc" v-else-if="isAudio()" autoplay loop controls v-on:loadstart="loaded()"></video>
    <img :src="imageSrc" v-else v-on:load="loaded()" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRefs, watch, computed } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/ImageViewer'

export default defineComponent({
  name: 'Media',
  props: {
    src: {
      type: String,
      default: ''
    },
    imageType: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const srcRef = toRefs(props).src
    const imageTypeRef = toRefs(props).imageType
    const imageSrc = ref('')
    imageSrc.value = srcRef.value
    const store = useStore()
    const loading = computed(() => store.state.TimelineSpace.Modals.ImageViewer.loading)

    const isMovie = () => ['video'].includes(imageTypeRef.value)
    const isGIF = () => ['gifv'].includes(imageTypeRef.value)
    const isAudio = () => ['audio'].includes(imageTypeRef.value)

    watch(srcRef, async (newSrc, _oldSrc) => {
      imageSrc.value = newSrc
    })

    const loaded = () => store.dispatch(`TimelineSpace/Modals/ImageViewer/${ACTION_TYPES.LOADED}`)

    return {
      imageSrc,
      loading,
      isMovie,
      isGIF,
      isAudio,
      loaded
    }
  }
})
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
