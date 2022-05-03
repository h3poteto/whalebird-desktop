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

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useStore } from '@/store'
import NewToot from './Modals/NewToot.vue'
import Jump from './Modals/Jump.vue'
import ImageViewer from './Modals/ImageViewer.vue'
import ListMembership from './Modals/ListMembership.vue'
import AddListMember from './Modals/AddListMember.vue'
import MuteConfirm from './Modals/MuteConfirm.vue'
import Shortcut from './Modals/Shortcut.vue'
import Report from './Modals/Report.vue'

export default defineComponent({
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
  setup() {
    const store = useStore()
    const newTootModal = computed(() => store.state.TimelineSpace.Modals.NewToot.modalOpen)
    const jumpModal = computed(() => store.state.TimelineSpace.Modals.Jump.modalOpen)
    const reportModal = computed(() => store.state.TimelineSpace.Modals.Report.modalOpen)
    const muteConfirmModal = computed(() => store.state.TimelineSpace.Modals.MuteConfirm.modalOpen)
    const addListMemberModal = computed(() => store.state.TimelineSpace.Modals.AddListMember.modalOpen)
    const listMembershipModal = computed(() => store.state.TimelineSpace.Modals.ListMembership.modalOpen)

    return {
      newTootModal,
      jumpModal,
      reportModal,
      muteConfirmModal,
      addListMemberModal,
      listMembershipModal
    }
  }
})
</script>
