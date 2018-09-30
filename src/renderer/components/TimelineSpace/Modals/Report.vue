<template>
<el-dialog
  :title="$t('modals.report.title')"
  :visible.sync="reportModal"
  width="400px"
  custom-class="report"
  >
  <el-input type="textarea" v-model="comment" :placeholder="$t('modals.report.comment')"></el-input>
  <span slot="footer" class="dialog-footer">
    <el-button @click="closeModal">{{ $t('modals.report.cancel') }}</el-button>
    <el-button type="primary" @click="submit">{{ $t('modals.report.ok') }}</el-button>
  </span>
</el-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Report',
  data () {
    return {
      comment: ''
    }
  },
  computed: {
    ...mapState('TimelineSpace/Modals/Report', {
      toot: state => state.message
    }),
    reportModal: {
      get () {
        return this.$store.state.TimelineSpace.Modals.Report.modalOpen
      },
      set (value) {
        this.$store.commit('TimelineSpace/Modals/Report/changeModalOpen', value)
      }
    }
  },
  methods: {
    closeModal () {
      this.reportModal = false
    },
    async submit () {
      this.closeModal()
      await this.$store.dispatch('TimelineSpace/Modals/Report/submit', {
        account_id: this.toot.account.id,
        status_id: this.toot.id,
        comment: this.comment
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
