<template>
  <div id="follows">
    <DynamicScroller :items="follows" :min-item-size="53" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.item]" :data-index="index" :watchData="true">
          <user
            :user="item"
            v-bind:key="item.id"
            :relationship="targetRelation(item.id)"
            @followAccount="followAccount"
            @unfollowAccount="unfollowAccount"
          >
          </user>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <div class="loading-card" v-loading="lazyLoading" :element-loading-background="backgroundColor"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '~/src/renderer/components/molecules/User'

export default {
  name: 'follows',
  props: ['account'],
  components: { User },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Follows', {
      follows: state => state.follows,
      relationships: state => state.relationships,
      lazyLoading: state => state.lazyLoading
    }),
    ...mapState('App', {
      backgroundColor: state => state.theme.background_color
    })
  },
  created() {
    this.load()
  },
  mounted() {
    document.getElementById('sidebar_scrollable').addEventListener('scroll', this.onScroll)
  },
  unmounted() {
    if (document.getElementById('sidebar_scrollable') !== undefined && document.getElementById('sidebar_scrollable') !== null) {
      document.getElementById('sidebar_scrollable').removeEventListener('scroll', this.onScroll)
    }
  },
  watch: {
    account: function (_newAccount, _oldAccount) {
      this.load()
    }
  },
  methods: {
    async load() {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        const follows = await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchFollows', this.account)
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', follows)
      } catch (err) {
        console.error(err)
        this.$message({
          message: this.$t('message.follows_fetch_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
    },
    onScroll(event) {
      // for lazyLoading
      if (
        event.target.clientHeight + event.target.scrollTop >= document.getElementById('account_profile').clientHeight - 10 &&
        !this.lazyloading
      ) {
        this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/lazyFetchFollows', this.account).catch(err => {
          console.error(err)
          this.$message({
            message: this.$t('message.timeline_fetch_error'),
            type: 'error'
          })
        })
      }
    },
    targetRelation(id) {
      return this.relationships.find(r => r.id === id)
    },
    async followAccount(account) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/follow', account)
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', this.follows)
      } catch (err) {
        this.$message({
          message: this.$t('message.follow_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
    },
    async unfollowAccount(account) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/unfollow', account)
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Follows/fetchRelationships', this.follows)
      } catch (err) {
        this.$message({
          message: this.$t('message.unfollow_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-card {
  height: 60px;
}

.loading-card:empty {
  height: 0;
}
</style>
