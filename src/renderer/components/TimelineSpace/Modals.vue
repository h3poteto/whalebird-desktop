<template>
  <div>
    <new-toot v-if="newTootModal"></new-toot>
    <jump v-if="jumpModal"></jump>
    <image-viewer></image-viewer>
    <list-membership v-if="listMembershipModal"></list-membership>
    <add-list-member v-if="addListMemberModal"></add-list-member>
    <mute-confirm v-if="muteConfirmModal"></mute-confirm>
    <shortcut></shortcut>
    <report v-if="reportModal"></report>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
  },
  computed: {
    ...mapState({
      newTootModal: state => state.TimelineSpace.Modals.NewToot.modalOpen,
      jumpModal: state => state.TimelineSpace.Modals.Jump.modalOpen,
      reportModal: state => state.TimelineSpace.Modals.Report.modalOpen,
      muteConfirmModal: state => state.TimelineSpace.Modals.MuteConfirm.modalOpen,
      addListMemberModal: state => state.TimelineSpace.Modals.AddListMember.modalOpen,
      listMembershipModal: state => state.TimelineSpace.Modals.ListMembership.modalOpen
    })
  }
}
</script>
