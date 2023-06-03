<template>
  <div id="hashtag">
    <div class="search-header" v-loading="false">
      <el-form>
        <div class="form-wrapper">
          <div class="form-item" v-show="tagPage">
            <el-button link @click="back">
              <font-awesome-icon icon="chevron-left" />
            </el-button>
          </div>
          <div class="form-item input">
            <input v-model="tag" :placeholder="$t('hashtag.tag_name')" class="search-keyword" v-on:keyup.enter="search" autofocus />
          </div>
        </div>
      </el-form>
    </div>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { useTranslation } from 'i18next-vue'
import { computed, defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default defineComponent({
  name: 'hashtag',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useTranslation()

    const tag = ref<string>('')
    const id = computed(() => route.params.id)
    const tagPage = computed(() => route.name === 'tag')

    onMounted(() => {
      if (route.name === 'tag') {
        tag.value = route.params.tag as string
      }
    })
    watch(
      () => route.params.tag,
      () => {
        if (route.name === 'tag') {
          tag.value = route.params.tag as string
        }
      }
    )
    const search = () => {
      router.push({ path: `/${id.value}/hashtag/${tag.value}` })
    }
    const back = () => {
      router.push({ path: `/${id.value}/hashtag` })
    }

    return {
      tagPage,
      tag,
      back,
      search,
      $t: t
    }
  },
  methods: {}
})
</script>

<style lang="scss" scoped>
#hashtag {
  height: calc(100% - 1px);
  overflow: hidden;

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
