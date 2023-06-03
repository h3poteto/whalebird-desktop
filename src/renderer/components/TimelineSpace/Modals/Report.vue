<template>
  <el-dialog :title="$t('modals.report.title')" v-model="reportModal" width="400px" custom-class="report">
    <el-input type="textarea" v-model="comment" :placeholder="$t('modals.report.comment')"></el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeModal">{{ $t('modals.report.cancel') }}</el-button>
        <el-button type="primary" @click="submit">{{ $t('modals.report.ok') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { useStore } from '@/store'
import { MUTATION_TYPES, ACTION_TYPES } from '@/store/TimelineSpace/Modals/Report'
import { useTranslation } from 'i18next-vue'

export default defineComponent({
  name: 'Report',
  setup() {
    const space = 'TimelineSpace/Modals/Report'
    const store = useStore()
    const { t } = useTranslation()

    const comment = ref<string>('')

    const status = computed(() => store.state.TimelineSpace.Modals.Report.message)
    const reportModal = computed({
      get: () => store.state.TimelineSpace.Modals.Report.modalOpen,
      set: (value: boolean) => store.commit(`${space}/${MUTATION_TYPES.CHANGE_MODAL_OPEN}`, value)
    })

    const closeModal = () => {
      store.commit(`${space}/${MUTATION_TYPES.CHANGE_MODAL_OPEN}`, false)
    }
    const submit = async () => {
      closeModal()
      await store.dispatch(`${space}/${ACTION_TYPES.SUBMIT}`, {
        account_id: status.value?.account.id,
        status_id: status.value?.id,
        comment: comment.value
      })
    }

    return {
      comment,
      reportModal,
      closeModal,
      submit,
      $t: t
    }
  }
})
</script>

<style lang="scss" scoped></style>
