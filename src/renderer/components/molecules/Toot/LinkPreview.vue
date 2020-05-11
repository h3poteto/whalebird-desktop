<template>
  <div class="link" @click="openLink(url)">
    <el-image :src="icon" class="icon" fit="cover" lazy>
      <div class="image-slot" slot="error">
        <i class="el-icon-link"></i>
      </div>
    </el-image>
    <div class="contents">
      <strong>{{ title }}</strong>
      <span>{{ description }}</span>
    </div>
  </div>
</template>

<script>
export default {
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
  methods: {
    openLink(link) {
      if (link) {
        return window.shell.openExternal(link)
      }
    }
  }
}
</script>

<style lang="scss">
.link {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
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
    padding: 4px 0 0 10px;
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
