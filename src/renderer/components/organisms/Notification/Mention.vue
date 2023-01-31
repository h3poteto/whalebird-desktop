<template>
  <div class="mention">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Entity } from 'megalodon'
import Toot from '../Toot.vue'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'

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
  components: { Toot },
  setup(_props, ctx) {
    const updateToot = message => {
      return ctx.emit('update', message)
    }
    const deleteToot = message => {
      return ctx.emit('delete', message)
    }

    return {
      updateToot,
      deleteToot
    }
  }
})
</script>
