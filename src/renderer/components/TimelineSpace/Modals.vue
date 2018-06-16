<template>
  <div>
    <new-toot></new-toot>
    <jump></jump>
    <image-viewer></image-viewer>
    <list-membership></list-membership>
  </div>
</template>

<script>
import NewToot from './Modals/NewToot'
import Jump from './Modals/Jump'
import ImageViewer from './Modals/ImageViewer'
import ListMembership from './Modals/ListMembership'

export default {
  name: 'modals',
  components: {
    NewToot,
    Jump,
    ImageViewer,
    ListMembership
  }
}
</script>
