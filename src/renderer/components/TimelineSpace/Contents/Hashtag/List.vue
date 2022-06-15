<template>
  <div id="list">
    <table class="tag-list">
      <tbody>
        <tr v-for="tag in tags" v-bind:key="tag._id" @click.stop.prevent="openTimeline(tag.tagName)">
          <td>
            {{ tag.tagName }}
          </td>
          <td class="action">
            <el-button type="text" @click.stop="deleteTag(tag)" :title="$t('hashtag.delete_tag')">
              <font-awesome-icon :icon="['far', 'trash-can']" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Contents/Hashtag/List'
import { LocalTag } from '~/src/types/localTag'

export default defineComponent({
  name: 'list',
  setup() {
    const space = 'TimelineSpace/Contents/Hashtag/List'
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    const tags = computed(() => store.state.TimelineSpace.Contents.Hashtag.List.tags)

    onMounted(() => {
      store.dispatch(`${space}/${ACTION_TYPES.LIST_TAGS}`)
    })
    const openTimeline = (tagName: string) => {
      router.push({
        path: `/${route.params.id}/hashtag/${tagName}`
      })
    }
    const deleteTag = (tag: LocalTag) => {
      store.dispatch(`${space}/${ACTION_TYPES.REMOVE_TAG}`, tag)
    }

    return {
      tags,
      openTimeline,
      deleteTag
    }
  }
})
</script>

<style lang="scss" scoped>
#list {
  .tag-list {
    width: 100%;

    tr,
    th,
    td {
      background-color: var(--theme-background-color);
      color: var(--theme-secondary-color);
      border-bottom: 1px solid var(--theme-border-color);
      padding: 12px 20px;
      cursor: pointer;
    }

    &:first-child {
      border-top: 1px solid var(--theme-border-color);
    }

    .action {
      width: 20px;

      .el-button {
        padding: 0;
        color: var(--theme-secondary-color);
      }
    }
  }
}
</style>
