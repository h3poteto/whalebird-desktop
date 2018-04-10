<template>
  <div>
    <toot></toot>
    <new-toot></new-toot>
    <jump></jump>
    <image-viewer></image-viewer>
  </div>
</template>

<script>
import Toot from './Modals/Toot'
import NewToot from './Modals/NewToot'
import Jump from './Modals/Jump'
import ImageViewer from './Modals/ImageViewer'

export default {
  name: 'modals',
  components: {
    Toot,
    NewToot,
    Jump,
    ImageViewer
  }
}
</script>
