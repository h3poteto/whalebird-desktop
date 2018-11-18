<template>
  <div class="toot-detail" ref="detail">
    <div class="toot-ancestors" v-for="(message, index) in ancestors" v-bind:key="'ancestors-' + index">
      <toot :message="message" v-on:update="updateAncestorsToot" v-on:delete="deleteAncestorsToot"></toot>
    </div>
    <div class="original-toot" ref="original">
      <toot :message="message" v-on:update="updateToot" v-on:delete="deleteToot"></toot>
    </div>
    <div class="toot-descendants" v-for="(message, index) in descendants" v-bind:key="'descendants' + index">
      <toot :message="message" v-on:update="updateDescendantsToot" v-on:delete="deleteDescendantsToot"></toot>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Toot from '~/src/renderer/components/molecules/Toot'

export default {
  name: 'toot-detail',
  components: { Toot },
  computed: {
    ...mapState({
      message: state => state.TimelineSpace.Contents.SideBar.TootDetail.message,
      ancestors: state => state.TimelineSpace.Contents.SideBar.TootDetail.ancestors,
      descendants: state => state.TimelineSpace.Contents.SideBar.TootDetail.descendants
    })
  },
  created () {
    this.load()
  },
  watch: {
    message: function () {
      this.load()
    }
  },
  methods: {
    load () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/TootDetail/fetchToot', this.message)
        .then(() => {
          const toot = this.$refs.original
          toot.scrollIntoView()
        })
        .catch(() => {
          this.$message({
            message: this.$t('message.toot_fetch_error'),
            type: 'error'
          })
        })
    },
    updateAncestorsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateAncestorsToot', message)
    },
    deleteAncestorsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteAncestorsToot', message)
    },
    updateToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateToot', message)
    },
    deleteToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteToot', message)
    },
    updateDescendantsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/updateDescendantsToot', message)
    },
    deleteDescendantsToot (message) {
      this.$store.commit('TimelineSpace/Contents/SideBar/TootDetail/deleteDescendantsToot', message)
    }
  }
}
</script>

<style lang="scss" scoped>
.toot-detail {
  .original-toot {
    .toot {
      background-color: var(--theme-selected-background-color);
      outline: 0;
    }
  }
}
</style>
