<script>
export default {
  name: 'reloadable',
  methods: {
    async reloadable () {
      const account = await this.$store.dispatch('TimelineSpace/localAccount', this.$route.params.id).catch((err) => {
        this.$message({
          message: this.$t('message.account_load_error'),
          type: 'error'
        })
        throw err
      })
      await this.$store.dispatch('TimelineSpace/stopUserStreaming')
      await this.$store.dispatch('TimelineSpace/stopLocalStreaming')

      await this.$store.dispatch('TimelineSpace/Contents/Home/fetchTimeline', account)
      await this.$store.dispatch('TimelineSpace/Contents/Local/fetchLocalTimeline', account)

      this.$store.dispatch('TimelineSpace/startUserStreaming', account)
      this.$store.dispatch('TimelineSpace/startLocalStreaming', account)
      return account
    }
  }
}
</script>
