<template>
<div id="hashtag">
  <div class="search-header" v-loading="false">
    <el-form>
      <div class="form-wrapper">
        <div class="form-item" v-show="tagPage()">
          <el-button type="text" @click="back">
            <icon name="chevron-left"></icon>
          </el-button>
        </div>
        <div class="form-item input">
          <input v-model="tag" placeholder="Tag name" class="search-keyword" v-shortkey="['enter']" @shortkey="search" autofocus></input>
        </div>
        <div class="form-item" v-show="tagPage()">
          <el-button type="text" @click="save">
            <icon name="thumbtack"></icon>
          </el-button>
        </div>
      </div>
    </el-form>
  </div>
  <router-view></router-view>
</div>
</template>

<script>
export default {
  name: 'hashtag',
  data () {
    return {
      tag: ''
    }
  },
  methods: {
    id () {
      return this.$route.params.id
    },
    search () {
      this.$router.push({ path: `/${this.id()}/hashtag/${this.tag}` })
    },
    tagPage () {
      return this.$route.name === 'tag'
    },
    back () {
      this.$router.push({ path: `/${this.id()}/hashtag` })
    },
    save () {
      this.$store.dispatch('TimelineSpace/Contents/Hashtag/saveTag', this.tag)
    }
  }
}
</script>

<style lang="scss" scoped>
#hashtag {
  border-top: 1px solid var(--theme-border-color);

  .search-header {
    background-color: var(--theme-selected-background-color);
    padding: 8px 12px;

    .form-wrapper {
      display: flex;
      align-items: center;

      .input {
        flex-grow: 3;
      }

      .form-item {
        margin: auto 8px;

        .el-button {
          padding: 0;
        }
      }

      .search-keyword {
        width: 100%;
        background-color: var(--theme-background-color);
        border: none;
        border-radius: 0 4px 4px 0;
        color: var(--theme-primary-color);
        line-height: 40px;
        height: 40px;
        padding: 0 15px;
        outline: 0;
        font-size: 14px;
        box-sizing: border-box;
      }
    }
  }
}
</style>
