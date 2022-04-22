<template>
  <el-container id="settings">
    <el-header class="header">
      <el-row>
        <el-col :span="23">
          <h1>{{ $t('settings.title') }}</h1>
        </el-col>
        <el-col :span="1" class="close-area">
          <el-button type="text" @click="close" class="close-button" role="button">
            <font-awesome-icon icon="xmark" />
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <div></div>
      <el-aside width="240px" class="menu">
        <el-menu
          :default-active="activeRoute()"
          class="setting-menu"
          :text-color="primaryColor"
          :background-color="backgroundColor"
          :router="true"
        >
          <el-menu-item :index="`/${id()}/settings/general`">
            <font-awesome-icon icon="gear" class="icon" size="lg" />
            <span>{{ $t('settings.general.title') }}</span>
          </el-menu-item>
          <el-menu-item :index="`/${id()}/settings/timeline`">
            <font-awesome-icon icon="align-left" class="icon" size="lg" />
            <span>{{ $t('settings.timeline.title') }}</span>
          </el-menu-item>
          <el-menu-item :index="`/${id()}/settings/filters`">
            <font-awesome-icon icon="filter" class="icon" size="lg" />
            <span>{{ $t('settings.filters.title') }}</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Settings',
  computed: {
    ...mapState({
      primaryColor: state => state.App.theme.primary_color,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  created() {
    this.$store.commit('Settings/changeAccountID', this.id())
    this.$router.push(`/${this.id()}/settings/general`)
  },
  methods: {
    id() {
      return this.$route.params.id
    },
    close() {
      this.$router.push(`/${this.id()}/home`)
    },
    activeRoute() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
#settings {
  height: 100%;
  overflow: auto;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);
    user-select: none;
  }

  .close-area {
    display: flex;
    align-items: center;

    .close-button {
      font-size: 28px;
    }
  }

  .menu {
    text-align: right;
    padding-left: 24px;

    .el-menu {
      border-right: solid 1px var(--theme-border-color);
    }

    .setting-menu {
      height: 100%;
      user-select: none;
    }
    .setting-menu :deep(.icon) {
      margin-right: 9px;
    }
  }
}
</style>
