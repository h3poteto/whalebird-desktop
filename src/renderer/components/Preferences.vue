<template>
  <el-container id="preferences">
    <el-header class="header">
      <el-row>
        <el-col :span="23">
          <h1>{{ $t('preferences.title') }}</h1>
        </el-col>
        <el-col :span="1">
          <el-button type="text" icon="el-icon-close" @click="close" class="close-button" role="button"></el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <div v-shortkey="['esc']" @shortkey="close"></div>
      <el-aside width="240px" class="menu">
        <el-menu
          :default-active="activeRoute()"
          class="setting-menu"
          :text-color="primaryColor"
          :background-color="backgroundColor"
          :router="true"
        >
          <el-menu-item index="/preferences/general">
            <icon name="cog" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.general.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/appearance">
            <icon name="palette" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.appearance.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/notification">
            <icon name="bell" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.notification.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/account">
            <icon name="user" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.account.title') }}</span>
          </el-menu-item>
          <el-menu-item index="/preferences/language">
            <icon name="language" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.language.title') }}</span>
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
  name: 'preferences',
  computed: {
    ...mapState({
      primaryColor: state => state.App.theme.primary_color,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  methods: {
    close() {
      this.$router.push({ path: '/', query: { redirect: 'home' } })
    },
    activeRoute() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
#preferences {
  height: 100%;
  overflow: auto;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);
    user-select: none;

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

    .setting-menu /deep/ {
      height: 100%;
      user-select: none;

      .icon {
        margin-right: 9px;
      }
    }
  }
}
</style>
