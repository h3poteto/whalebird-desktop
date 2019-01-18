<template>
<el-dialog
  :title="$t('modals.mute_confirm.title')"
  :visible.sync="muteConfirmModal"
  width="400px"
  custom-class="mute-confirm"
  >
  <el-form class="description">
    <el-form-item for="notify" :label="$t('modals.mute_confirm.body')">
      <el-switch id="notify" v-model="notify"></el-switch>
    </el-form-item>
  </el-form>
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
}
</style>
