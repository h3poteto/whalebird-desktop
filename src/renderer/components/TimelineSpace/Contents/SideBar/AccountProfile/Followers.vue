<template>
  <div id="followers">
    <DynamicScroller :items="followers" :min-item-size="53" class="scroller" page-mode>
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.item]" :data-index="index" :watchData="true">
          <user :user="item" :relationship="targetRelation(item.id)" @followAccount="followAccount" @unfollowAccount="unfollowAccount">
          </user>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import User from '~/src/renderer/components/molecules/User'

export default {
  name: 'followers',
  props: ['account'],
  components: { User },
  computed: {
    ...mapState('TimelineSpace/Contents/SideBar/AccountProfile/Followers', {
      followers: state => state.followers,
      relationships: state => state.relationships
    })
  },
  created() {
    this.load()
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
        const followers = await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchFollowers', this.account)
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', followers)
      } catch (err) {
        this.$message({
          message: this.$t('message.followers_fetch_error'),
          type: 'error'
        })
      } finally {
        this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', false)
      }
    },
    targetRelation(id) {
      return this.relationships.find(r => r.id === id)
    },
    async followAccount(account) {
      this.$store.commit('TimelineSpace/Contents/SideBar/AccountProfile/changeLoading', true)
      try {
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/follow', account)
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', this.followers)
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
        await this.$store.dispatch('TimelineSpace/Contents/SideBar/AccountProfile/Followers/fetchRelationships', this.followers)
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

<style lang="scss" scoped></style>
