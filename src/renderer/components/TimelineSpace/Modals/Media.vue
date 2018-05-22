<template>
  <video :src="src" v-if="isMovieFile()" controls></video>
  <img :src="src" v-else>
</template>

<script>
export default {
  props: {
    src: String
  },
  methods: {
    file_ext () {
      return this.src.split('.').pop().toLowerCase()
    },
    isMovieFile () {
      return ['mp4'].indexOf(this.file_ext()) >= 0
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


