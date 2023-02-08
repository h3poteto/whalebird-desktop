<template>
  <div class="quote">
    <div class="icon">
      <FailoverImg :src="message.account.avatar" />
    </div>
    <div class="status">
      <div class="header">
        <div class="user">
          <span class="display-name"><bdi v-html="username(message.account)"></bdi></span>
          <span class="acct">{{ accountName(message.account) }}</span>
        </div>
        <div class="close">
          <el-button link>
            <font-awesome-icon icon="xmark" @click="close" />
          </el-button>
        </div>
      </div>
      <div class="body">
        <div class="spoiler" v-html="emojiText(message.spoiler_text, message.emojis)"></div>
        <div class="content" v-html="emojiText(message.content, message.emojis)"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue'
import { Entity } from 'megalodon'
import DisplayStyle from '~/src/constants/displayStyle'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import emojify from '@/utils/emojify'
import { useStore } from '@/store'

export default defineComponent({
  name: 'Quote',
  components: {
    FailoverImg
  },
  props: {
    message: {
      type: Object as PropType<Entity.Status>,
      required: true
    }
  },
  emits: ['close'],
  setup(_props, ctx) {
    const store = useStore()

    const displayNameStyle = computed(() => store.state.App.displayNameStyle)

    const username = (account: Entity.Account) => {
      switch (displayNameStyle.value) {
        case DisplayStyle.DisplayNameAndUsername.value:
          if (account.display_name !== '') {
            return emojify(account.display_name, account.emojis)
          } else {
            return account.acct
          }
        case DisplayStyle.DisplayName.value:
          if (account.display_name !== '') {
            return emojify(account.display_name, account.emojis)
          } else {
            return account.acct
          }
        default:
          return account.acct
      }
    }
    const accountName = (account: Entity.Account) => {
      switch (displayNameStyle.value) {
        case DisplayStyle.DisplayNameAndUsername.value:
          return `@${account.acct}`
        case DisplayStyle.DisplayName.value:
        default:
          return ''
      }
    }
    const emojiText = (content: string, emojis: Array<Entity.Emoji>) => {
      return emojify(content, emojis)
    }
    const close = () => {
      ctx.emit('close', null)
    }

    return {
      username,
      accountName,
      emojiText,
      close
    }
  }
})
</script>

<style lang="scss" scoped>
.quote {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--theme-border-color);
  font-size: var(--base-font-size);
  background-color: var(--theme-selected-background-color);
  margin-bottom: 8px;

  .icon {
    img {
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      margin: 10px;
      border-radius: 4px;
    }
  }

  .status {
    width: calc(100% - 40px);

    .header {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
