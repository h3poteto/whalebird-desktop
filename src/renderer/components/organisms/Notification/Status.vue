<template>
  <div class="notified-status">
    <div class="action">
      <div class="action-mark">
        <font-awesome-icon icon="home" size="sm" />
      </div>
      <div class="action-detail">
        <span class="bold" @click="openUser(message.account)">
          <bdi
            v-html="
              $t('notification.status.body', {
                username: username(message.account),
                interpolation: { escapeValue: false }
              })
            "
          ></bdi>
        </span>
      </div>
      <div class="action-icon" role="presentation">
        <FailoverImg :src="message.account.avatar" :alt="`Avatar of ${message.account.username}`" />
      </div>
    </div>
    <div class="clearfix"></div>
    <toot
      :message="message.status"
      :filters="filters"
      :focused="focused"
      :account="account"
      :server="server"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusRight="$emit('focusRight')"
      @selectToot="$emit('select')"
    >
    </toot>
    <div class="clearfix"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import FailoverImg from '@/components/atoms/FailoverImg.vue'
import Toot from '../Toot.vue'
import { usernameWithStyle } from '@/utils/username'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'mention',
  props: {
    message: {
      type: Object as PropType<Entity.Notification>,
      default: {}
    },
    filters: {
      type: Array as PropType<Array<Entity.Filter>>,
      default: []
    },
    focused: {
      type: Boolean,
      default: false
    },
    account: {
      type: Object as PropType<LocalAccount>,
      required: true
    },
    server: {
      type: Object as PropType<LocalServer>,
      required: true
    }
  },
  components: { Toot, FailoverImg },
  setup(_props, ctx) {
    const store = useStore()
    const router = useRouter()
    const displayNameStyle = computed(() => store.state.App.displayNameStyle)

    const updateToot = (message: Entity.Status) => {
      return ctx.emit('update', message)
    }
    const deleteToot = (message: Entity.Status) => {
      return ctx.emit('delete', message)
    }
    const username = (account: Entity.Account) => usernameWithStyle(account, displayNameStyle.value)
    const openUser = (account: Entity.Account) => {
      router.push({ query: { detail: 'true', account_id: account.id } })
    }

    return {
      updateToot,
      deleteToot,
      username,
      openUser
    }
  }
})
</script>

<style lang="scss" scoped>
.bold {
  font-weight: bold;
}

.notified-status {
  padding-top: 8px;

  .action {
    padding: 0 0 0 16px;
    margin-right: 8px;

    .action-mark {
      color: #409eff;
      float: left;
      width: 32px;
      text-align: right;
    }

    .action-detail {
      margin-left: 10px;
      font-size: var(--base-font-size);
      float: left;
      max-width: 80%;

      .bold {
        cursor: pointer;
      }

      .bold :deep(.emojione) {
        max-width: 14px;
        max-height: 14px;
      }
    }

    .action-icon {
      width: 100%;
      text-align: right;

      img {
        width: 16px;
        height: 16px;
        border-radius: 2px;
      }
    }
  }
}
</style>
