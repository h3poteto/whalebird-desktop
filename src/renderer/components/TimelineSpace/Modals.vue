<template>
  <div>
    <new-toot></new-toot>
    <jump></jump>
    <image-viewer></image-viewer>
  </div>
</template>

<script>
import NewToot from './Modals/NewToot'
import Jump from './Modals/Jump'
import ImageViewer from './Modals/ImageViewer'

export default {
  name: 'modals',
  components: {
    NewToot,
    Jump,
    ImageViewer
  }
}
</script>
