<template>
<transition name="slide-detail">
  <div id="side_bar" v-if="openSideBar" v-shortkey="['esc']" @shortkey="close">
    <div class="header">
      <i class="el-icon-loading" v-show="loading"></i>
      <i class="el-icon-close" @click="close"></i>
    </div>
    <div id="sidebar_scrollable">
      <account-profile v-if="component === 1" v-on:change-loading="changeLoading"></account-profile>
      <toot-detail v-else-if="component === 2"></toot-detail>
      <div
        class="loading"
        v-loading="true"
        :element-loading-text="$t('message.loading')"
        element-loading-spinner="el-icon-loading"
        :element-loading-background="backgroundColor"
        v-else>
      </div>
    </div>
  </div>
</transition>
</template>

<script>
import { mapState } from 'vuex'
import TootDetail from './SideBar/TootDetail'
import AccountProfile from './SideBar/AccountProfile'

export default {
  name: 'side-bar',
  components: {
    TootDetail,
    AccountProfile
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      component: state => state.TimelineSpace.Contents.SideBar.component,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  beforeDestroy () {
    this.close()
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/close')
    },
    changeLoading (value) {
      this.loading = value
    }
  }
}
</script>

<style lang="scss" scoped>
#side_bar {
  position: fixed;
  top: 48px;
  right: 0;
  width: 320px;
  height: calc(100% - 48px);
  border-left: solid 1px var(--theme-border-color);

  .header {
    background-color: var(--theme-selected-background-color);
    padding: 4px 8px;
    border-top: solid 1px var(--theme-border-color);
    border-bottom: solid 1px var(--theme-border-color);
    text-align: right;
    height: 30px;
    box-sizing: border-box;

    .el-icon-close {
      cursor: pointer;
    }
  }

  #sidebar_scrollable {
    overflow: auto;
    height: calc(100% - 30px);
  }

  .loading {
    height: 100%;
  }
}

.slide-detail-enter-active, .slide-detail-leave-active {
  transition: all 0.5s;
}
.slide-detail-enter, .slide-detail-leave-to {
  margin-right: -320px;
  opacity: 0;
}
</style>
