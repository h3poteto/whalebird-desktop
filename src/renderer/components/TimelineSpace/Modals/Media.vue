<template>
  <div class="media">
    <img :src="src" v-if="isImageFile()">
    <video :src="src" v-else-if="isMovieFile()" controls></video>
  </div>
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
    isImageFile () {
      return ['jpg', 'gif', 'png'].indexOf(this.file_ext()) >= 0
    },
    isMovieFile () {
      return ['mp4'].indexOf(this.file_ext()) >= 0
    }
  }
}
</script>

<style lang="scss" scoped>
.media {
  img, video {
    max-width: 80%;
    max-height: 80%;
  }
}
</style>


