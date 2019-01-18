<template>
  <div>
    <new-toot></new-toot>
    <jump></jump>
    <image-viewer></image-viewer>
    <list-membership></list-membership>
    <add-list-member></add-list-member>
    <mute-confirm></mute-confirm>
    <shortcut></shortcut>
    <report></report>
  </div>
</template>

<script>
import NewToot from './Modals/NewToot'
import Jump from './Modals/Jump'
import ImageViewer from './Modals/ImageViewer'
import ListMembership from './Modals/ListMembership'
import AddListMember from './Modals/AddListMember'
import MuteConfirm from './Modals/MuteConfirm'
import Shortcut from './Modals/Shortcut'
import Report from './Modals/Report'

export default {
  name: 'modals',
  components: {
    NewToot,
    Jump,
    ImageViewer,
    ListMembership,
    AddListMember,
    MuteConfirm,
    Shortcut,
    Report
  }
}
</script>
