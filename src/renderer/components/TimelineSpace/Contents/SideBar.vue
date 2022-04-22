<template>
  <div class="side-bar" v-if="openSideBar">
    <div class="header">
      <el-button type="text" @click="reload" class="action">
        <font-awesome-icon icon="rotate" />
      </el-button>
      <el-button type="text" @click="close" class="action">
        <font-awesome-icon icon="xmark" />
      </el-button>
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
        v-else
      ></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import TootDetail from './SideBar/TootDetail'
import AccountProfile from './SideBar/AccountProfile'

export default {
  components: {
    TootDetail,
    AccountProfile
  },
  name: 'side-bar',
  props: {
    overlaid: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      component: state => state.TimelineSpace.Contents.SideBar.component,
      backgroundColor: state => state.App.theme.background_color
    }),
    shortcutEnabled: function () {
      return !this.overlaid
    }
  },
  beforeUnmount() {
    this.close()
  },
  methods: {
    close() {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/close')
    },
    changeLoading(value) {
      this.loading = value
    },
    reload() {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/reload')
    },
    handleKey(event) {
      switch (event.srcKey) {
        case 'close':
          this.close()
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  .header {
    background-color: var(--theme-selected-background-color);
    padding: 4px 8px;
    border-top: solid 1px var(--theme-border-color);
    border-bottom: solid 1px var(--theme-border-color);
    text-align: right;
    height: 36px;
    box-sizing: border-box;
    font-size: 18px;

    .action {
      color: var(--theme-secondary-color);
      padding: 0;
      margin-left: 8px;

      &:hover {
        color: #409eff;
      }
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
</style>
