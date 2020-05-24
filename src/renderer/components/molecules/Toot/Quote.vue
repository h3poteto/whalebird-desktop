<template>
  <div class="quote" v-on:click.stop.prevent="$emit('select')">
    <FailoverImg class="icon" :src="icon" :alt="`Avatar of ${username}`" />
    <div class="contents">
      <div class="header">
        <strong v-html="username"></strong>
        <span>{{ accountName }}</span>
      </div>
      <div class="body" v-html="body"></div>
    </div>
  </div>
</template>

<script>
import FailoverImg from '~/src/renderer/components/atoms/FailoverImg'
export default {
  name: 'quote',
  props: {
    icon: {
      type: String,
      default: ''
    },
    username: {
      type: String,
      default: ''
    },
    accountName: {
      type: String,
      default: ''
    },
    body: {
      type: String,
      default: ''
    }
  },
  components: {
    FailoverImg
  }
}
</script>

<style lang="scss">
.quote {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
  border: 1px solid var(--theme-selected-background-color);
  cursor: pointer;
  font-size: var(--base-font-size);

  &:hover {
    background-color: var(--theme-selected-background-color);
  }

  .icon {
    width: 40px;
    height: 40px;
    min-width: 40px;
    min-height: 40px;
    margin: 10px;
    border-radius: 4px;
  }

  .contents {
    .header {
      .emojione {
        width: 20px;
        height: 20px;
      }
    }
    .body {
      margin-top: 4px;

      .emojione {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>
