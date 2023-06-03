<template>
  <el-dialog v-model="jumpModal" width="440px" custom-class="jump-modal">
    <el-form class="jump-form" v-on:submit.prevent="jumpCurrentSelected">
      <div class="channel">
        <input type="text" v-model="inputtedChannel" :placeholder="$t('modals.jump.jump_to')" ref="channelForm" v-focus autofocus />
        <ul class="channel-list">
          <li
            v-for="c in filteredChannel"
            :class="c.name === selectedChannel.name ? 'channel-list-item selected' : 'channel-list-item'"
            @click="jump(c)"
            @mouseover="changeSelected(c)"
          >
            {{ c.name }}
          </li>
        </ul>
      </div>
      <!-- Dummy form to guard submitting with enter -->
      <el-form-item class="hidden">
        <el-input></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useMagicKeys, whenever } from '@vueuse/core'
import { useStore } from '@/store'
import { MUTATION_TYPES, ACTION_TYPES, Channel } from '@/store/TimelineSpace/Modals/Jump'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'jump',
  setup() {
    const space = 'TimelineSpace/Modals/Jump'
    const store = useStore()
    const { t } = useTranslation()
    const { up, down, enter } = useMagicKeys()

    const channelForm = ref<HTMLInputElement>()

    const channelList = computed(() => store.state.TimelineSpace.Modals.Jump.defaultChannelList)
    const selectedChannel = computed(() => store.state.TimelineSpace.Modals.Jump.selectedChannel)
    const inputtedChannel = computed({
      get: () => store.state.TimelineSpace.Modals.Jump.channel,
      set: (value: string) => store.commit(`${space}/${MUTATION_TYPES.UPDATE_CHANNEL}`, value)
    })
    const jumpModal = computed({
      get: () => store.state.TimelineSpace.Modals.Jump.modalOpen,
      set: (value: boolean) => store.commit(`${space}/${MUTATION_TYPES.CHANGE_MODAL}`, value)
    })

    const filteredChannel = computed(() =>
      channelList.value.filter(c => c.name.toLowerCase().indexOf(inputtedChannel.value.toLowerCase()) !== -1)
    )

    onMounted(() => {
      nextTick(() => {
        setTimeout(() => {
          channelForm.value?.focus()
        }, 500)
      })
    })
    onBeforeUnmount(() => {
      store.commit(`${space}/${MUTATION_TYPES.UPDATE_CHANNEL}`, '')
    })

    watch(inputtedChannel, (_new, _old) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_SELECTED}`, filteredChannel.value[0])
    })

    whenever(up, () => {
      prevChannel()
    })
    whenever(down, () => {
      nextChannel()
    })
    whenever(enter, () => {
      jumpCurrentSelected()
    })

    const nextChannel = () => {
      const filtered = filteredChannel.value
      const i = filtered.findIndex(e => e.name === selectedChannel.value.name)
      if (i !== undefined && i < filtered.length - 1) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SELECTED}`, filtered[i + 1])
      }
    }
    const prevChannel = () => {
      const filtered = filteredChannel.value
      const i = filtered.findIndex(e => e.name === selectedChannel.value.name)
      if (i !== undefined && i > 0) {
        store.commit(`${space}/${MUTATION_TYPES.CHANGE_SELECTED}`, filtered[i - 1])
      }
    }
    const changeSelected = (channel: Channel) => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_SELECTED}`, channel)
    }
    const jump = (channel: Channel) => {
      store.dispatch(`${space}/${ACTION_TYPES.JUMP}`, channel)
    }
    const jumpCurrentSelected = () => {
      store.dispatch(`${space}/${ACTION_TYPES.JUMP_CURRENT_SELECTED}`)
    }

    return {
      channelForm,
      selectedChannel,
      inputtedChannel,
      jumpModal,
      filteredChannel,
      jump,
      changeSelected,
      jumpCurrentSelected,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.jump-form {
  .channel {
    input {
      font-size: 32px;
      line-height: 54px;
      width: 100%;
      outline: 0;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      padding: 8px;
      color: #303133;
      box-sizing: border-box;
    }

    .channel-list {
      list-style: none;
      font-size: 16px;
      padding: 0;

      .channel-list-item {
        padding: 4px 8px;
        border-radius: 4px;
      }

      .selected {
        background-color: #409eff;
        color: #ffffff;
      }
    }
  }

  .hidden {
    display: none;
  }
}
</style>
