<template>
<div id="side_bar" v-if="openSideBar">
  <div class="header">
    <i class="el-icon-close" @click="close"></i>
  </div>
  <account-profile v-if="component === 1"></account-profile>
</div>
</template>

<script>
import { mapState } from 'vuex'
import AccountProfile from './SideBar/AccountProfile'

export default {
  name: 'side-bar',
  components: {
    AccountProfile
  },
  computed: {
    ...mapState({
      openSideBar: state => state.TimelineSpace.Contents.SideBar.openSideBar,
      component: state => state.TimelineSpace.Contents.SideBar.component
    })
  },
  methods: {
    close () {
      this.$store.dispatch('TimelineSpace/Contents/SideBar/close')
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
  overflow: auto;
  border-left: solid 1px #dcdfe6;

  .header {
    background-color: #f3f6fc;
    padding: 4px 8px;
    border-top: solid 1px #dcdfe6;
    border-bottom: solid 1px #dcdfe6;
    text-align: right;

    .el-icon-close {
      cursor: pointer;
    }
  }
}
</style>
