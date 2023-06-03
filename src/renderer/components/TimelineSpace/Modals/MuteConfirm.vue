<template>
  <el-dialog :title="$t('modals.mute_confirm.title')" v-model="muteConfirmModal" width="400px" custom-class="mute-confirm">
    <el-form class="description">
      <el-form-item for="notify" :label="$t('modals.mute_confirm.body')">
        <el-switch id="notify" v-model="notify"></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeModal">{{ $t('modals.mute_confirm.cancel') }}</el-button>
      <el-button type="primary" @click="submit">{{ $t('modals.mute_confirm.ok') }}</el-button>
    </span>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useStore } from '@/store'
import { ACTION_TYPES } from '@/store/TimelineSpace/Modals/MuteConfirm'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'MuteConfirm',
  setup() {
    const space = 'TimelineSpace/Modals/MuteConfirm'
    const store = useStore()
    const { t } = useTranslation()

    const notify = ref<boolean>(true)

    const muteConfirmModal = computed({
      get: () => store.state.TimelineSpace.Modals.MuteConfirm.modalOpen,
      set: (value: boolean) => store.dispatch(`${space}/${ACTION_TYPES.CHANGE_MODAL}`, value)
    })

    const closeModal = () => {
      store.dispatch(`${space}/${ACTION_TYPES.CHANGE_MODAL}`, false)
    }
    const submit = async () => {
      closeModal()
      await store.dispatch(`${space}/${ACTION_TYPES.SUBMIT}`, notify.value)
    }

    return {
      notify,
      muteConfirmModal,
      closeModal,
      submit,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped>
.description {
  text-align: center;
}
</style>
