<template>
  <div class="mention">
    <toot
      :message="message.status"
      :filters="filters"
      :focused="focused"
      :overlaid="overlaid"
      v-on:update="updateToot"
      v-on:delete="deleteToot"
      @focusNext="$emit('focusNext')"
      @focusPrev="$emit('focusPrev')"
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
    overlaid: {
      type: Boolean,
      default: false
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
