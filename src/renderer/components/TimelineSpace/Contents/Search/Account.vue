<template>
  <div id="search_account">
    <DynamicScroller :items="results" :min-item-size="20" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.acct]" :data-index="index">
          <user :user="item"></user>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '~/src/renderer/components/molecules/User'

export default {
  name: 'search-account',
  components: { User },
  computed: {
    ...mapState({
      results: state => state.TimelineSpace.Contents.Search.Account.results
    })
  },
  destroyed() {
    this.$store.commit('TimelineSpace/Contents/Search/Account/updateResults', [])
  }
}
</script>

<style lang="scss" scoped></style>
