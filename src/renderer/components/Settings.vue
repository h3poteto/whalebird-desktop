<template>
<el-container id="settings">
  <el-header class="header">
    <el-row>
      <el-col :span="23">
        <h3>{{ $t('settings.title') }}</h3>
      </el-col>
      <el-col :span="1">
        <el-button type="text" icon="el-icon-close" @click="close" class="close-button"></el-button>
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
        :router="true">
        <el-menu-item :index="`/${id()}/settings/general`">
          <icon name="cog" class="icon" scale="1.3"></icon>
          <span>{{ $t('settings.general.title') }}</span>
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
import Visibility from '~/src/constants/visibility'

export default {
  name: 'Settings',
  data () {
    return {
      visibilities: [
        Visibility.Public,
        Visibility.Unlisted,
        Visibility.Private
      ],
      tootVisibility: Visibility.Public
    }
  },
  computed: {
    ...mapState({
      primaryColor: state => state.App.theme.primary_color,
      backgroundColor: state => state.App.theme.background_color
    })
  },
  created () {
    this.$router.push(`/${this.id()}/settings/general`)
  },
  methods: {
    id () {
      return this.$route.params.id
    },
    close () {
      this.$router.push(`/${this.id()}/home`)
    },
    activeRoute () {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
#settings {
  height: 100%;

  .header {
    text-align: center;
    border-bottom: 1px solid var(--theme-border-color);
  }

  .close-button {
    font-size: 24px;
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
