<template>
  <div class="toot-detail" ref="detail">
    <div class="toot-ancestors" v-for="(message, index) in ancestors" v-bind:key="'ancestors-' + index">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :overlaid="modalOpened"
        :filters="filters"
        v-on:update="updateAncestorsToot"
        v-on:delete="deleteAncestorsToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
      >
      </toot>
    </div>
    <div class="original-toot" ref="original">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :overlaid="modalOpened"
        :filters="filters"
        :detailed="true"
        v-on:update="updateToot"
        v-on:delete="deleteToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
      >
      </toot>
    </div>
    <div class="toot-descendants" v-for="(message, index) in descendants" v-bind:key="'descendants' + index">
      <toot
        :message="message"
        :focused="message.uri + message.id === focusedId"
        :overlaid="modalOpened"
        :filters="filters"
        v-on:update="updateDescendantsToot"
        v-on:delete="deleteDescendantsToot"
        @focusNext="focusNext"
        @focusPrev="focusPrev"
        @focusLeft="focusTimeline"
        @selectToot="focusToot(message)"
      >
      </toot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { Entity } from 'megalodon'
import { useStore } from '@/store'
import { useI18next } from 'vue3-i18next'
import Toot from '@/components/organisms/Toot.vue'
import { EventEmitter } from '@/components/event'
import { ACTION_TYPES, MUTATION_TYPES } from '@/store/TimelineSpace/Contents/SideBar/TootDetail'

export default defineComponent({
  name: 'toot-detail',
  components: { Toot },
  setup() {
    const space = 'TimelineSpace/Contents/SideBar/TootDetail'
    const store = useStore()
    const i18n = useI18next()

    const focusedId = ref<string | null>(null)
    const original = ref<any>(null)

    const message = computed(() => store.state.TimelineSpace.Contents.SideBar.TootDetail.message)
    const ancestors = computed(() => store.state.TimelineSpace.Contents.SideBar.TootDetail.ancestors)
    const descendants = computed(() => store.state.TimelineSpace.Contents.SideBar.TootDetail.descendants)
    const timeline = computed(() => {
      const mes = message.value ? [message.value] : []
      return ancestors.value.concat(mes).concat(descendants.value)
    })
    const filters = computed(() => store.getters[`${space}/filters`])
    const modalOpened = computed(() => store.getters[`TimelineSpace/Modals/modalOpened`])
    const currentFocusedIndex = computed(() => timeline.value.findIndex(toot => focusedId.value === toot.uri + toot.id))
    const originalMessage = computed(() => (message.value?.reblog !== null ? message.value?.reblog : message.value))

    onMounted(() => {
      load()
    })
    watch(message, () => {
      load()
    })

    onBeforeUnmount(() => {
      EventEmitter.emit('focus-timeline')
      EventEmitter.off('focus-sidebar')
    })

    const load = () => {
      store
        .dispatch(`${space}/${ACTION_TYPES.FETCH_TOOT}`, originalMessage.value)
        .then(() => {
          const toot = original.value
          toot.scrollIntoView()
        })
        .catch(() => {
          ElMessage({
            message: i18n.t('message.toot_fetch_error'),
            type: 'error'
          })
        })
    }
    const updateAncestorsToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_ANCESTORS_TOOT}`, message)
    }
    const deleteAncestorsToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_ANCESTORS_TOOT}`, message)
    }
    const updateToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_TOOT}`, message)
    }
    const deleteToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_TOOT}`, message)
    }
    const updateDescendantsToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_DESCENDANTS_TOOT}`, message)
    }
    const deleteDescendantsToot = (message: Entity.Status) => {
      store.commit(`${space}/${MUTATION_TYPES.DELETE_DESCENDANTS_TOOT}`, message)
    }
    const focusNext = () => {
      if (currentFocusedIndex.value === -1) {
        focusedId.value = timeline.value[0].uri + timeline.value[0].id
      } else if (currentFocusedIndex.value < timeline.value.length - 1) {
        focusedId.value = timeline.value[currentFocusedIndex.value + 1].uri + timeline.value[currentFocusedIndex.value + 1].id
      }
    }
    const focusPrev = () => {
      if (currentFocusedIndex.value > 0) {
        focusedId.value = timeline.value[currentFocusedIndex.value - 1].uri + timeline.value[currentFocusedIndex.value - 1].id
      }
    }
    const focusToot = (message: Entity.Status) => {
      focusedId.value = message.uri + message.id
    }
    const focusTimeline = () => {
      focusedId.value = null
      EventEmitter.emit('focus-timeline')
    }

    return {
      original,
      ancestors,
      focusedId,
      modalOpened,
      filters,
      updateAncestorsToot,
      deleteAncestorsToot,
      focusNext,
      focusPrev,
      focusTimeline,
      focusToot,
      message,
      updateToot,
      deleteToot,
      descendants,
      updateDescendantsToot,
      deleteDescendantsToot
    }
  }
})
</script>

<style lang="scss" scoped>
.toot-detail {
  .original-toot {
    .toot {
      background-color: var(--theme-selected-background-color);
      outline: 0;
    }
  }
}
</style>
