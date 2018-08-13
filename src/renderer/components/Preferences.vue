<template>
  <el-container id="preferences">
    <el-header class="header">
      <el-row>
        <el-col :span="23">
          <h3>{{ $t('preferences.title') }}</h3>
        </el-col>
        <el-col :span="1">
          <el-button type="text" icon="el-icon-close" @click="close" class="close-button"></el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-container>
      <el-aside width="240px" class="menu">
        <el-menu
          :default-active="defaultActive"
          class="setting-menu"
          :text-color="primaryColor"
          :background-color="backgroundColor"
          :route="true">
          <el-menu-item index="1" :route="{path: '/preferences/general'}" @click="general">
            <icon name="cog" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.general.title') }}</span>
          </el-menu-item>
          <el-menu-item index="2" :route="{path: '/preferences/account'}" @click="account">
            <icon name="user" class="icon" scale="1.3"></icon>
            <span>{{ $t('preferences.account.title') }}</span>
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
      defaultActive: state => state.Preferences.defaultActive,
      primaryColor: state => state.App.theme.primary_color,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  methods: {
    close () {
      this.$router.push('/')
    },
    general () {
      this.$router.push('/preferences/general')
    },
    account () {
      this.$router.push('/preferences/account')
    }
  }
}
</script>

<style lang="scss" scoped>
#preferences {
  height: 100%;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);

    .close-button {
      font-size: 24px;
    }
  }

  .menu {
    text-align: right;
    padding-left: 24px;

    .el-menu {
      background-color: var(--theme-background-color);
      border-right: solid 1px var(--theme-border-color);
    }

    .setting-menu /deep/ {
      height: 100%;

      .icon {
        margin-right: 9px;
      }

      .el-menu-item {
        transition: none;
        -webkit-transition: none;

        .icon {
          color: var(--theme-secondary-color);
        }
      }

      .is-active {
        .icon {
          color: #409eff;
        }
      }
    }
  }
}
</style>
