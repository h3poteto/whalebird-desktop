<template>
<el-dialog
  :title="$t('modals.mute_confirm.title')"
  :visible.sync="muteConfirmModal"
  width="400px"
  custom-class="mute-confirm"
  >
  <div class="description">
    <span class="label">
      {{ $t('modals.mute_confirm.body') }}
    </span>
    <el-switch v-model="notify"></el-switch>
  </div>
  <span slot="footer" class="dialog-footer">
    <el-button @click="closeModal">{{ $t('modals.mute_confirm.cancel') }}</el-button>
    <el-button type="primary" @click="submit">{{ $t('modals.mute_confirm.ok') }}</el-button>
  </span>
</el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MuteConfirm',
  data () {
    return {
      notify: true
    }
  },
  computed: {
    ...mapState('TimelineSpace/Modals/MuteConfirm', {
      account: state => state.account
    }),
    muteConfirmModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.MuteConfirm.modalOpen
      },
      set (value) {
        this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/changeModal', value)
      }
    }
  },
  methods: {
    closeModal () {
      this.muteConfirmModal = false
    },
    async submit () {
      this.closeModal()
      await this.$store.dispatch('TimelineSpace/Modals/MuteConfirm/submit', this.notify)
    }
  }
}
</script>

<style lang="scss" scoped>
.description {
  text-align: center;

  .label {
    font-size: 14px;
    color: #606266;
    padding: 0 32px 0 0;
  }
}
</style>
