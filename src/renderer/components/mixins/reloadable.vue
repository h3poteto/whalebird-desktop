<script>
export default {
  name: 'reloadable',
  methods: {
    async reloadable() {
      const account = await this.$store.dispatch('TimelineSpace/localAccount', this.$route.params.id).catch(err => {
        this.$message({
          message: this.$t('message.account_load_error'),
          type: 'error'
        })
        throw err
      })
      await this.$store.dispatch('GlobalHeader/stopUserStreamings')
      await this.$store.dispatch('TimelineSpace/stopStreamings')
      await this.$store.dispatch('TimelineSpace/fetchContentsTimelines')
      await this.$store.dispatch('TimelineSpace/startStreamings')
      this.$store.dispatch('GlobalHeader/startUserStreamings')
      return account
    }
  }
}
</script>
