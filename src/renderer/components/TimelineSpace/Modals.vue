<template>
  <div>
    <new-toot></new-toot>
    <jump></jump>
    <image-viewer></image-viewer>
    <list-membership></list-membership>
    <add-list-member></add-list-member>
    <shortcut></shortcut>
  </div>
</template>

<script>
import NewToot from './Modals/NewToot'
import Jump from './Modals/Jump'
import ImageViewer from './Modals/ImageViewer'
import ListMembership from './Modals/ListMembership'
import AddListMember from './Modals/AddListMember'
import Shortcut from './Modals/Shortcut'

export default {
  name: 'modals',
  components: {
    NewToot,
    Jump,
    ImageViewer,
    ListMembership,
    AddListMember,
    Shortcut
  }
}
</script>
