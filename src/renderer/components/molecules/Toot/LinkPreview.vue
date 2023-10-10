<template>
  <div class="link" @click="openLink(url)">
    <el-image :src="icon" class="icon" fit="cover" lazy>
      <div class="image-slot" slot="error">
        <font-awesome-icon icon="link" />
      </div>
    </el-image>
    <div class="contents">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { MyWindow } from '~/src/types/global'

export default defineComponent({
  name: 'link-preview',
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: null
    }
  },
  setup() {
    const win = (window as any) as MyWindow
    const openLink = (link: string) => {
      win.ipcRenderer.invoke('open-browser', link)
    }

    return {
      openLink
    }
  }
})
</script>

<style lang="scss">
.link {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  border: 1px solid var(--theme-selected-background-color);
  cursor: pointer;

  &:hover {
    background-color: var(--theme-selected-background-color);
  }

  .icon {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;

    .image-slot {
      font-size: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: #f5f7fa;
      color: #909399;
    }
  }

  .contents {
    box-sizing: border-box;
    height: 60px;
    padding: 8px 11px;
    color: var(--theme-secondary-color);
    overflow: hidden;

    strong {
      display: block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    span {
      display: block;
      padding: 4px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
