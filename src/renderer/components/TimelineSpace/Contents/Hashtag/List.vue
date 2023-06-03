<template>
  <div id="list">
    <table class="tag-list">
      <tbody>
        <tr v-for="tag in tags" :key="tag._id" @click.stop.prevent="openTimeline(tag.tagName)">
          <td>
            {{ tag.tagName }}
          </td>
          <td class="action">
            <el-button link :title="$t('hashtag.delete_tag')" @click.stop="deleteTag(tag)">
              <font-awesome-icon :icon="['far', 'trash-can']" />
            </el-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LocalTag } from '~/src/types/localTag'
import { MyWindow } from '~/src/types/global'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'list',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useTranslation()
    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))
    const tags = ref<Array<LocalTag>>([])

    onMounted(async () => {
      tags.value = await win.ipcRenderer.invoke('list-hashtags', id.value)
    })
    const openTimeline = (tagName: string) => {
      router.push({
        path: `/${route.params.id}/hashtag/${tagName}`
      })
    }
    const deleteTag = async (tag: LocalTag) => {
      await win.ipcRenderer.invoke('remove-hashtag', tag)
      tags.value = await win.ipcRenderer.invoke('list-hashtags', id.value)
    }

    return {
      tags,
      openTimeline,
      deleteTag,
      $t: t
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
