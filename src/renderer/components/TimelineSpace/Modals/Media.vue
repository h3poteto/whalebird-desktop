<template>
  <video :src="src" v-if="isMovieFile()" controls></video>
  <video :src="src" v-else-if="isGIF()" autoplay loop></video>
  <img :src="src" v-else>
</template>

<script>
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
  methods: {
    isMovieFile () {
      return ['video'].includes(this.type)
    },
    isGIF () {
      return ['gifv'].includes(this.type)
    }
  }
}
</script>

<style lang="scss" scoped>
img,
video {
  max-width: 80%;
  max-height: 80%;
}
</style>


