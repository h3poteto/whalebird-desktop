<template>
  <div id="global_header">
    <el-menu
      :default-active="defaultActive"
      class="el-menu-vertical"
      @open="instanceSelected"
      @close="instanceClosed"
      :collapse="isCollapse"
      background-color="#545c64"
      text-color="#909399"
      active-text-color="#ffffff">
      <el-menu-item index="1">
        <i class="el-icon-menu"></i>
        <span slot="title">First server</span>
      </el-menu-item>
    </el-menu>
    <div class="content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: 'global-header',
  data () {
    return {
      isCollapse: true,
      defaultActive: '1'
    }
  },
  created () {
  },
  methods: {
    instanceSelected (key, keyPath) {
      console.log(key, keyPath)
    },
    instanceClosed (key, keyPath) {
      console.log(key, keyPath)
    }
  }
}
</script>

<style lang="scss">
html, body, #app, #global_header {
  height: 100%;
  margin: 0;
}

#global_header {
  .el-menu {
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    width: 65px;
  }

  .content {
    margin-left: 65px;
  }
}
</style>
